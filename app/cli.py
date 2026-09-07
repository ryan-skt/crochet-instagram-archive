import typer
import logging
from typing import Optional
from rich.console import Console
from rich.table import Table

from app.database.database import init_db, get_session
from app.database.repository import Repository
from app.database.models import Post, Media, Classification
from app.collector.instagram import InstaloaderCollector
from app.collector.local import LocalImporter
from app.downloader.downloader import Downloader
from app.classifier.vision import GeminiClassifier
from app.organizer.organizer import Organizer

app = typer.Typer(help="Crochet Instagram Archive CLI")
console = Console()
logger = logging.getLogger("archive.cli")

def get_repo():
    session = get_session()
    return Repository(session)

@app.command()
def collect(
    target: str = typer.Argument(..., help="Instagram username to collect"),
    limit: Optional[int] = typer.Option(None, "--limit", help="Max number of posts to process"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Do not save to DB or download"),
    resume: bool = typer.Option(False, "--resume", help="Resume interrupted download queue"),
):
    """Phase 1: Collect metadata and download media to raw storage."""
    init_db()
    repo = get_repo()
    
    try:
        collector = InstaloaderCollector()
    except ValueError as e:
        console.print(f"[bold red]{e}[/bold red]")
        raise typer.Exit(code=1)
        
    downloader = Downloader(repo)
    
    if resume:
        console.print("[bold blue]Resuming interrupted downloads...[/bold blue]")
        if not dry_run:
            downloader.process_pending(limit)
        return

    console.print(f"[bold blue]Starting collection for {target}...[/bold blue]")
    
    for post_data in collector.collect_posts(target, limit):
        if dry_run:
            console.print(f"Would process post: {post_data['platform_post_id']} with {len(post_data['media'])} media items.")
            continue
            
        # Save to DB
        post = repo.get_post_by_platform_id(post_data['platform_post_id'])
        if not post:
            post = Post(
                platform="instagram",
                platform_post_id=post_data["platform_post_id"],
                post_url=post_data["post_url"],
                caption=post_data["caption"],
                published_at=post_data["published_at"]
            )
            post = repo.add_post(post)
            
        for m_data in post_data["media"]:
            # Check if media URL already exists for this post
            existing_media = repo.get_media_by_url(m_data["media_url"])
            if existing_media and existing_media.post_id == post.id:
                logger.info(f"Media URL already known for post {post.id}, skipping insert.")
                continue
                
            media = Media(
                post_id=post.id,
                media_url=m_data["media_url"],
                media_type=m_data["media_type"]
            )
            repo.add_media(media)
                
    if not dry_run:
        console.print("[bold green]Metadata collection complete. Starting downloads...[/bold green]")
        # Any limits applied to the collector will limit the posts, 
        # but process_pending will process ALL pending unless limited. 
        # If the user specified a limit, we should ideally limit downloads as well if they want to stop early, 
        # but in Phase 1 they usually want to download what was collected.
        downloader.process_pending()
        console.print("[bold green]Phase 1 Complete![/bold green]")

@app.command(name="import-folder")
def import_folder(
    path: str = typer.Argument(..., help="Path to local folder of images"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Do not save to DB or copy files")
):
    """Import a local folder of images directly into the archive."""
    init_db()
    repo = get_repo()
    importer = LocalImporter(repo)
    
    console.print(f"[bold blue]Starting local import from {path}...[/bold blue]")
    importer.import_folder(path, dry_run=dry_run)
    if not dry_run:
        console.print("[bold green]Local import complete![/bold green]")

@app.command()
def classify(
    limit: Optional[int] = typer.Option(None, "--limit", help="Max items to classify"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Run model but don't save to DB"),
    force: bool = typer.Option(False, "--force", help="Re-classify already classified media")
):
    """Phase 2a: Classify raw images using AI Vision."""
    init_db()
    repo = get_repo()
    
    try:
        classifier = GeminiClassifier()
    except ValueError as e:
        console.print(f"[bold red]Error: {e}[/bold red]")
        console.print("Please add your API key to the .env file as GEMINI_API_KEY=your_key")
        raise typer.Exit(code=1)
        
    if force:
        # Get all downloaded media
        media_list = repo.session.query(Media).filter(Media.download_status == "success").all()
    else:
        media_list = repo.get_unclassified_downloaded_media()
        
    if limit:
        media_list = media_list[:limit]
        
    console.print(f"[bold blue]Found {len(media_list)} images to classify.[/bold blue]")
    
    for media in media_list:
        if media.media_type != "image":
            continue # Skip videos for now
            
        console.print(f"Classifying media {media.id}...")
        try:
            result = classifier.classify_image(media.local_path)
            console.print(f" -> {result.primary_category} / {result.subcategory} (Confidence: {result.confidence:.2f})")
            
            if dry_run:
                continue
                
            # If force is true, we might need to delete old classification or update
            existing = repo.get_classification_by_media_id(media.id)
            if existing:
                repo.session.delete(existing)
                repo.session.commit()
                
            classification = Classification(
                media_id=media.id,
                primary_category=result.primary_category,
                subcategory=result.subcategory,
                product_type=result.product_type,
                construction=result.construction,
                image_type=result.image_type,
                colors=result.colors,
                pattern_style=result.pattern_style,
                objects=result.objects,
                description=result.description,
                tags=result.tags,
                confidence=result.confidence,
                model=result.model_name
            )
            repo.add_classification(classification)
        except Exception as e:
            console.print(f"[bold red]Failed to classify media {media.id}: {e}[/bold red]")

@app.command()
def organize(
    dry_run: bool = typer.Option(False, "--dry-run", help="Show where files would be copied without executing")
):
    """Phase 2b: Move classified files into organized folders."""
    init_db()
    repo = get_repo()
    organizer = Organizer(repo)
    
    if dry_run:
        console.print("[bold blue]Running organization in DRY-RUN mode...[/bold blue]")
        organizer.run_organization(dry_run=True)
    else:
        console.print("[bold blue]Organizing classified files...[/bold blue]")
        organizer.run_organization()
        console.print("[bold green]Organization Complete![/bold green]")

@app.command()
def review():
    """Review low-confidence classifications."""
    init_db()
    repo = get_repo()
    
    # Threshold could be read from config, hardcoding 0.75 for now as fallback
    low_conf = repo.get_low_confidence_classifications(0.75)
    
    if not low_conf:
        console.print("No low-confidence items to review.")
        return
        
    for c in low_conf:
        media = c.media
        console.print(f"\n[bold]Media ID:[/bold] {media.id} (File: {media.local_path})")
        console.print(f"[bold]Current Category:[/bold] {c.primary_category} / {c.subcategory}")
        console.print(f"[bold]Confidence:[/bold] {c.confidence}")
        console.print(f"[bold]Description:[/bold] {c.description}")
        console.print(f"[bold]Objects:[/bold] {c.objects}")
        
        action = typer.prompt("Action (approve/edit/skip)", default="skip")
        if action == "approve":
            c.confidence = 1.0 # Force approve
            repo.session.commit()
        elif action == "edit":
            c.primary_category = typer.prompt("Category", default=c.primary_category)
            c.subcategory = typer.prompt("Subcategory", default=c.subcategory)
            c.confidence = 1.0
            repo.session.commit()

@app.command()
def status():
    """Show database statistics."""
    init_db()
    repo = get_repo()
    
    total_posts = repo.session.query(Post).count()
    total_media = repo.session.query(Media).count()
    downloaded = repo.session.query(Media).filter(Media.download_status == "success").count()
    pending = repo.session.query(Media).filter(Media.download_status == "pending").count()
    classified = repo.session.query(Classification).count()
    
    table = Table(title="Archive Status")
    table.add_column("Metric", style="cyan")
    table.add_column("Count", style="magenta")
    
    table.add_row("Total Posts", str(total_posts))
    table.add_row("Total Media", str(total_media))
    table.add_row("Downloaded", str(downloaded))
    table.add_row("Pending Downloads", str(pending))
    table.add_row("Classified", str(classified))
    
    console.print(table)

@app.command()
def duplicates():
    """Find duplicates in the database."""
    # To be fully implemented: finding items with the same pHash or SHA256
    init_db()
    repo = get_repo()
    
    console.print("Exact duplicates are prevented during download phase via SHA-256.")
    # Quick check for visual dupes
    media = repo.session.query(Media).filter(Media.phash.isnot(None)).all()
    phash_dict = {}
    for m in media:
        phash_dict.setdefault(m.phash, []).append(m.id)
        
    dupes = {k: v for k, v in phash_dict.items() if len(v) > 1}
    
    if dupes:
        console.print(f"[bold red]Found {len(dupes)} visual duplicate groups (pHash)[/bold red]")
        for h, ids in dupes.items():
            console.print(f"Hash {h}: Media IDs {ids}")
    else:
        console.print("[bold green]No visual duplicates found.[/bold green]")

@app.command()
def export():
    """Export classifications to JSON/CSV (stub)."""
    console.print("Export functionality not yet implemented.")

if __name__ == "__main__":
    app()

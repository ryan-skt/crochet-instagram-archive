from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database.models import Post, Media, Classification

class Repository:
    def __init__(self, session: Session):
        self.session = session

    def get_post_by_platform_id(self, platform_id: str) -> Optional[Post]:
        return self.session.query(Post).filter(Post.platform_post_id == platform_id).first()

    def add_post(self, post: Post) -> Post:
        try:
            self.session.add(post)
            self.session.commit()
            self.session.refresh(post)
            return post
        except IntegrityError:
            self.session.rollback()
            return self.get_post_by_platform_id(post.platform_post_id)

    def get_media_by_hash(self, sha256: str) -> Optional[Media]:
        if not sha256:
            return None
        return self.session.query(Media).filter(Media.sha256 == sha256).first()

    def get_media_by_url(self, url: str) -> Optional[Media]:
        return self.session.query(Media).filter(Media.media_url == url).first()

    def add_media(self, media: Media) -> Media:
        self.session.add(media)
        self.session.commit()
        self.session.refresh(media)
        return media

    def update_media(self, media: Media) -> Media:
        self.session.commit()
        self.session.refresh(media)
        return media

    def get_pending_media(self, limit: Optional[int] = None) -> List[Media]:
        query = self.session.query(Media).filter(Media.download_status == "pending")
        if limit:
            query = query.limit(limit)
        return query.all()

    def get_unclassified_downloaded_media(self) -> List[Media]:
        # Media that is downloaded but has no classification
        return self.session.query(Media)\
            .filter(Media.download_status == "success")\
            .filter(~Media.classification.has())\
            .all()

    def add_classification(self, classification: Classification) -> Classification:
        self.session.add(classification)
        self.session.commit()
        self.session.refresh(classification)
        return classification
        
    def get_low_confidence_classifications(self, threshold: float) -> List[Classification]:
        return self.session.query(Classification).filter(Classification.confidence < threshold).all()

    def get_classification_by_media_id(self, media_id: int) -> Optional[Classification]:
        return self.session.query(Classification).filter(Classification.media_id == media_id).first()

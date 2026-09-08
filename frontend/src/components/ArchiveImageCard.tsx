import type { Media } from '../services/mock';

interface ArchiveImageCardProps {
  media: Media;
  onClick?: (media: Media) => void;
}

export default function ArchiveImageCard({ media, onClick }: ArchiveImageCardProps) {
  const c = media.classification;
  
  return (
    <div 
      className="cred-card cursor-pointer flex flex-col h-full bg-white/[0.02] group"
      onClick={() => onClick && onClick(media)}
    >
      <div className="relative aspect-square overflow-hidden bg-black/20">
        {/* Mock Color Block simulating an image */}
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105" style={{ backgroundColor: c?.colors?.[0] || '#222' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60"></div>
        </div>
        
        <div className="absolute top-4 left-4 z-10">
          <span className="cred-badge text-white/90">
            {c?.primary_category || 'UNCLASSIFIED'}
          </span>
        </div>
      </div>
      <div className="p-4 border-t border-white/10 flex flex-col justify-between flex-1">
        <div>
          <div className="text-sm font-medium text-white/90 truncate mb-1">
            { `IMG_${media.id.toString().padStart(6, '0')}.jpg`}
          </div>
          <div className="text-xs text-white/50 truncate">
            {c?.subcategory || 'Pending classification'}
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs font-mono text-white/40">
            {media.sha256 ? `${media.sha256.substring(0, 8)}...` : 'N/A'}
          </div>
          {c?.confidence && (
            <div className={`text-xs font-bold px-2 py-1 rounded-md ${
              c.confidence > 0.8 ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'
            }`}>
              {Math.round(c.confidence * 100)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

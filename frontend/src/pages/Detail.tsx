import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMediaById } from '../services/api';
import type { Media } from '../services/mock';
import { ArrowLeft, Edit3, FolderInput, AlertTriangle, Trash2, Box, Hash, Fingerprint } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [media, setMedia] = useState<Media | null>(null);

  useEffect(() => {
    if (id) {
      fetchMediaById(id).then(m => m && setMedia(m));
    }
  }, [id]);

  if (!media) return <div className="p-12 font-medium text-white/50 animate-pulse">Loading asset data...</div>;

  const c = media.classification;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Topbar */}
      <div className="mb-8 flex justify-between items-center z-10 flex-shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
        <button onClick={() => navigate(-1)} className="cred-btn cred-btn-secondary px-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex gap-4 items-center">
          <div className="cred-badge text-white/70">
            Source: <span className="text-white ml-1">{media.source_type}</span>
          </div>
          <div className="cred-badge text-white/70">
            ID: <span className="text-white ml-1 font-mono">{media.id.toString().padStart(6, '0')}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row gap-8 min-h-0">
        {/* Large Image Area */}
        <div className="flex-[3] cred-card relative overflow-hidden flex items-center justify-center min-h-[400px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="w-full max-w-3xl aspect-square relative z-10 p-8 flex items-center justify-center">
             <div className="absolute inset-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-[1.02]" style={{ backgroundColor: c?.colors?.[0] || '#222' }}>
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-50 rounded-2xl"></div>
             </div>
             <div className="relative z-20 text-center opacity-0 hover:opacity-100 transition-opacity duration-300">
               <div className="font-bold text-2xl tracking-tight mb-2 text-white/90">Preview Missing</div>
               <div className="font-mono text-sm text-white/50">{media.local_path.split('/').pop()}</div>
             </div>
          </div>
        </div>

        {/* Metadata Panel */}
        <div className="flex-[2] flex flex-col gap-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 pr-2">
          
          <div className="cred-card p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  <Box className="w-4 h-4" /> AI Analysis
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Intelligence</h2>
              </div>
              <div className="flex flex-col items-end">
                <div className={`text-3xl font-bold tracking-tight ${c?.confidence && c.confidence > 0.8 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {c?.confidence ? Math.round(c.confidence * 100) : 0}%
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mt-1">Confidence</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Category</div>
                <div className="font-medium text-lg text-white/90">{c?.primary_category || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Subcategory</div>
                <div className="font-medium text-lg text-white/90">{c?.subcategory || 'N/A'}</div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Product Type</div>
              <div className="font-medium text-xl text-white">{c?.product_type || 'N/A'}</div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 pt-8 border-t border-white/10">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Construction</div>
                <div className="text-sm text-white/80">{c?.construction || 'N/A'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Pattern</div>
                <div className="text-sm text-white/80">{c?.pattern_style || 'N/A'}</div>
              </div>
            </div>

            <div className="mb-8 pt-8 border-t border-white/10">
              <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-4">Dominant Colors</div>
              <div className="flex gap-3 flex-wrap">
                {c?.colors?.map(color => (
                  <div key={color} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: color.toLowerCase() }}></div>
                    <span className="text-xs font-medium text-white/80 capitalize">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-4 flex items-center gap-1.5">
                <Hash className="w-3 h-3" /> Extracted Tags
              </div>
              <div className="flex gap-2 flex-wrap">
                {c?.tags?.map(tag => (
                  <span key={tag} className="text-xs bg-white/5 border border-white/5 px-2.5 py-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="cred-card p-6">
             <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-4 flex items-center gap-1.5">
                <Fingerprint className="w-3 h-3" /> Signatures
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs text-white/50 font-medium">SHA256</span>
                  <span className="text-xs font-mono text-white/80">{media.sha256 ? `${media.sha256.substring(0, 16)}...` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs text-white/50 font-medium">pHash</span>
                  <span className="text-xs font-mono text-white/80">{media.phash || 'N/A'}</span>
                </div>
              </div>
          </div>

          <div className="cred-card p-6 grid grid-cols-2 gap-3 mt-auto">
            <button onClick={() => showToast('Editing metadata requires API implementation', 'warning')} className="cred-btn cred-btn-secondary py-3">
              <Edit3 className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => showToast('Moving items requires API implementation', 'warning')} className="cred-btn cred-btn-secondary py-3">
              <FolderInput className="w-4 h-4" /> Move
            </button>
            <button onClick={() => showToast('Item marked for review', 'success')} className="cred-btn bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 py-3">
              <AlertTriangle className="w-4 h-4" /> Review
            </button>
            <button onClick={() => showToast('Deletion requires API implementation', 'error')} className="cred-btn cred-btn-danger py-3">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

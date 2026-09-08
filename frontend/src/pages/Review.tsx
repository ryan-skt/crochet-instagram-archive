import { useEffect, useState } from 'react';
import { fetchMedia } from '../services/api';
import type { Media } from '../services/mock';
import { Check, Edit3, RotateCcw, AlertCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Review() {
  const { showToast } = useToast();
  const [reviewItems, setReviewItems] = useState<Media[]>([]);

  useEffect(() => {
    fetchMedia().then(m => setReviewItems(m.filter(item => item.classification?.needs_review)));
  }, []);

  if (reviewItems.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto h-full flex flex-col items-center justify-center animate-in fade-in duration-700">
        <div className="cred-card p-16 text-center max-w-lg relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-[80px] pointer-events-none"></div>
          <Check className="w-20 h-20 text-green-400 mx-auto mb-8 relative z-10 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
          <h2 className="text-3xl font-bold tracking-tight mb-4 relative z-10">Queue Empty</h2>
          <p className="text-white/50 text-lg relative z-10">No intelligence requires human verification.</p>
        </div>
      </div>
    );
  }

  const media = reviewItems[0];
  const c = media.classification;

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto w-full pt-8">
      <div className="mb-8 flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Quality Control</h1>
          <p className="text-white/50 text-lg">Human verification required for low-confidence models.</p>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <div className="text-5xl font-bold tracking-tighter text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">12</div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mt-1">Pending</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
        {/* Image Area */}
        <div className="flex-1 cred-card relative overflow-hidden flex items-center justify-center min-h-[400px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute top-4 left-4 z-20">
            <div className="cred-badge text-white/80 bg-black/50 border-white/20">
              IMG_{media.id.toString().padStart(6, '0')}
            </div>
          </div>
          
          <div className="w-full max-w-xl aspect-square relative z-10 p-8 flex items-center justify-center">
             <div className="absolute inset-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]" style={{ backgroundColor: c?.colors?.[0] || '#222' }}>
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-50 rounded-2xl"></div>
             </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="w-full lg:w-[450px] flex flex-col gap-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 pr-2">
          
          <div className="cred-card p-8 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="text-xs uppercase tracking-widest text-yellow-500/70 font-semibold mb-3 relative z-10">AI Confidence</div>
            <div className="flex items-end gap-3 relative z-10">
              <div className="text-6xl font-bold tracking-tighter text-yellow-400">
                {c?.confidence ? Math.round(c.confidence * 100) : 0}%
              </div>
              <div className="mb-2 px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 text-xs font-bold uppercase tracking-wider">Low</div>
            </div>
          </div>

          <div className="cred-card p-8 flex-1">
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-6 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400" /> Proposed Classification
            </h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-white/50 font-medium">Category</span>
                <span className="font-semibold text-white/90">{c?.primary_category || 'UNKNOWN'}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xs text-white/50 font-medium">Subcategory</span>
                <span className="font-semibold text-white/90">{c?.subcategory || 'UNKNOWN'}</span>
              </div>
            </div>

            <h3 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-6">Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-xs text-white/50">Type</span>
                <span className="text-sm font-medium text-white/80">{c?.product_type || '-'}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-xs text-white/50">Construction</span>
                <span className="text-sm font-medium text-white/80">{c?.construction || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50">Pattern</span>
                <span className="text-sm font-medium text-white/80">{c?.pattern_style || '-'}</span>
              </div>
            </div>
          </div>

          <div className="cred-card p-6 flex flex-col gap-3">
            <button onClick={() => showToast('Classification accepted.', 'success')} className="cred-btn cred-btn-primary py-4 text-base shadow-[0_0_20px_rgba(255,255,255,0.15)]">
              <Check className="w-5 h-5" /> Accept Verification
            </button>
            <div className="flex gap-3">
              <button onClick={() => showToast('Editing requires API implementation.', 'warning')} className="cred-btn cred-btn-secondary flex-1">
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => showToast('Re-running AI requires API implementation.', 'warning')} className="cred-btn cred-btn-secondary flex-1 hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/30">
                <RotateCcw className="w-4 h-4" /> Re-Run
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import { ArrowRight, Activity } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Duplicates() {
  const { showToast } = useToast();
  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto w-full pt-8">
      <div className="mb-12 flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Collision Detection</h1>
          <p className="text-white/50 text-lg">Resolve perceptual hash collisions.</p>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <div className="text-5xl font-bold tracking-tighter text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">7</div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mt-1">Pending</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        <div className="cred-card p-6 md:p-10 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white/90">Perceptual Hash Match (99%)</div>
              <div className="text-xs text-white/50">Collision ID: COL_88291</div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Image A */}
            <div className="flex-1 flex flex-col group">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="font-semibold text-xl tracking-tight text-white/90">Asset A</span>
                <span className="cred-badge">ID: 001288</span>
              </div>
              <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl mb-6 relative overflow-hidden flex items-center justify-center shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
                 <div className="absolute inset-8 bg-blue-500/20 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.2)]"></div>
                 <span className="relative z-10 cred-badge bg-black/50 text-white/80 backdrop-blur-md">INSTAGRAM / granny_crochet0</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-6 space-y-3 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">Acquired</span>
                  <span className="text-sm font-medium text-white/80">2026-09-07</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">pHash</span>
                  <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">1111000011001100</span>
                </div>
              </div>
              <button onClick={() => showToast('Image A kept. Resolving duplicates requires API.', 'info')} className="cred-btn cred-btn-secondary py-4 text-base w-full group-hover:bg-blue-500/10 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-colors duration-300">
                Keep Asset A
              </button>
            </div>

            {/* Image B */}
            <div className="flex-1 flex flex-col group">
              <div className="flex justify-between items-center mb-4 px-2">
                <span className="font-semibold text-xl tracking-tight text-white/90">Asset B</span>
                <span className="cred-badge">ID: 001289</span>
              </div>
              <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl mb-6 relative overflow-hidden flex items-center justify-center shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
                 <div className="absolute inset-8 bg-purple-500/20 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.2)]"></div>
                 <span className="relative z-10 cred-badge bg-black/50 text-white/80 backdrop-blur-md">LOCAL / DIRECTORY_IMPORT</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-6 space-y-3 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">Acquired</span>
                  <span className="text-sm font-medium text-white/80">2026-09-07</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">pHash</span>
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded">1111000011001101</span>
                </div>
              </div>
              <button onClick={() => showToast('Image B kept. Resolving duplicates requires API.', 'info')} className="cred-btn cred-btn-secondary py-4 text-base w-full group-hover:bg-purple-500/10 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-colors duration-300">
                Keep Asset B
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <button onClick={() => showToast('Both images kept.', 'info')} className="cred-btn cred-btn-primary py-4 px-10 text-base shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            <ArrowRight className="w-5 h-5" /> Keep Both Assets
          </button>
        </div>
      </div>
    </div>
  );
}

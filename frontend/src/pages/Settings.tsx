import { Save, Database, HardDrive, Cpu, AlertTriangle } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Settings() {
  const { showToast } = useToast();
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full pt-8">
      <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Settings</h1>
        <p className="text-white/50 text-lg">System configuration and advanced parameters.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pb-12 pr-2">
        
        <section className="cred-card p-8 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-xl font-semibold flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
            <Cpu className="w-5 h-5 text-blue-400" /> AI Classification
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Confidence Threshold</label>
              <input type="range" min="0" max="100" defaultValue="80" className="w-full accent-blue-500" />
              <div className="flex justify-between text-xs text-white/40 mt-2 font-mono">
                <span>0%</span>
                <span>80%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-white/40 mt-3 leading-relaxed">
                Items falling below this threshold will be flagged and placed in the Review Queue.
              </p>
            </div>
          </div>
        </section>

        <section className="cred-card p-8 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <h2 className="text-xl font-semibold flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
            <Database className="w-5 h-5 text-purple-400" /> Deduplication
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">pHash Distance Tolerance</label>
              <input type="number" defaultValue="4" className="cred-input w-full md:w-32 text-center text-lg" />
              <p className="text-xs text-white/40 mt-3 leading-relaxed">
                Maximum Hamming distance between perceptual hashes to be considered a duplicate. Lower means stricter matching.
              </p>
            </div>
          </div>
        </section>

        <section className="cred-card p-8 md:p-10 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <h2 className="text-xl font-semibold flex items-center gap-3 mb-8 border-b border-red-500/20 pb-4 text-red-400">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h2>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
              <div>
                <h3 className="font-semibold text-white/90">Reset Database</h3>
                <p className="text-sm text-white/50 mt-1">Permanently delete all records and start fresh.</p>
              </div>
              <button onClick={() => showToast('Database reset requires API implementation.', 'error')} className="cred-btn cred-btn-danger whitespace-nowrap">
                Reset DB
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
              <div>
                <h3 className="font-semibold text-white/90 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-red-400" /> Clear Media Cache
                </h3>
                <p className="text-sm text-white/50 mt-1">Remove all downloaded images and thumbnails.</p>
              </div>
              <button onClick={() => showToast('Cache clear requires API implementation.', 'error')} className="cred-btn cred-btn-danger whitespace-nowrap">
                Clear Cache
              </button>
            </div>
          </div>
        </section>
        
        <div className="flex justify-end pt-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <button onClick={() => showToast('Configuration saved successfully.', 'success')} className="cred-btn cred-btn-primary px-10 py-4 text-lg shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            <Save className="w-5 h-5" /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

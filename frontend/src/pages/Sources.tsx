import { useEffect, useState } from 'react';
import { fetchSources, runSource } from '../services/api';
import type { Source } from '../services/api';
import { Activity, AlertCircle, Play, Archive as ArchiveIcon, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadSources = () => {
    fetchSources()
      .then(s => setSources(s))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleRun = async (id: number) => {
    try {
      await runSource(id);
      loadSources();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full pt-8">
      <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500 flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Sources</h1>
          <p className="text-white/50 text-lg">Manage connected acquisition endpoints.</p>
        </div>
        <button onClick={() => navigate('/import')} className="cred-btn cred-btn-primary px-6">
          Add Source
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-12">
        {loading && <div className="text-center py-20 text-white/40 animate-pulse">Fetching endpoints...</div>}
        
        {!loading && sources.length === 0 && (
          <div className="cred-card p-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-2xl font-bold mb-4">No Endpoints Configured</h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">Connect an Instagram profile or local directory to begin ingesting media into the intelligence engine.</p>
            <button onClick={() => navigate('/import')} className="cred-btn cred-btn-accent px-8 mx-auto">
              Configure Source
            </button>
          </div>
        )}

        {sources.map((s, i) => (
          <div 
            key={s.id} 
            className="cred-card p-8 md:p-10 flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            {/* Background Glow based on status */}
            {s.status === 'unavailable' && <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none"></div>}
            {s.status === 'ready' && <div className="absolute -top-32 -right-32 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none"></div>}

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 relative z-10">
              <div>
                <div className="cred-badge mb-4 text-white/60 inline-flex">
                  {s.type}
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  {s.username || 'Unknown'}
                </h2>
                <a href={s.url} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 w-max">
                  {s.url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center min-w-[140px] backdrop-blur-sm">
                <div className="text-4xl font-bold tracking-tight text-white mb-1">{s.media_count}</div>
                <div className="text-[10px] tracking-widest uppercase font-semibold text-white/40">Extracted</div>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              {s.status === 'unavailable' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-md">
                  <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-red-400/80 font-semibold mb-1">Acquisition Unavailable</div>
                    <div className="text-sm text-red-200/80 leading-relaxed">{s.error_message || "Automatic acquisition requires authorized API access."}</div>
                  </div>
                </div>
              )}
              
              {s.status === 'ready' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-md">
                  <Activity className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-green-400/80 font-semibold mb-1">System Ready</div>
                    <div className="text-sm text-green-200/80 leading-relaxed">Source endpoint is configured and standing by.</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-white/10 relative z-10">
              <button onClick={() => handleRun(s.id)} className="cred-btn cred-btn-primary flex-1 sm:flex-none px-8">
                <Play className="w-4 h-4" /> Run Acquisition
              </button>
              <button onClick={() => navigate('/archive')} className="cred-btn cred-btn-secondary flex-1 sm:flex-none px-8">
                <ArchiveIcon className="w-4 h-4" /> View Archive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Folder, Globe as Instagram, HardDrive, PlusCircle } from 'lucide-react';
import { createSource } from '../services/api';
import { useToast } from '../components/Toast';

export default function Import() {
  const { showToast } = useToast();
  const [sourceMode, setSourceMode] = useState<'instagram' | 'local'>('instagram');
  const [instaInput, setInstaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAddSource = async () => {
    if (!instaInput.trim()) {
      setError("Please enter a valid Instagram URL or username.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createSource('instagram', instaInput, instaInput);
      navigate('/sources');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full pt-8">
      <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Add Source</h1>
        <p className="text-white/50 text-lg">Register a new acquisition pipeline.</p>
      </div>

      {/* Source Selector */}
      <div className="flex gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button 
          onClick={() => setSourceMode('instagram')}
          className={`flex-1 p-6 rounded-3xl font-medium tracking-wide text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
            sourceMode === 'instagram' 
              ? 'bg-white/10 text-white border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(255,255,255,0.05)]' 
              : 'bg-white/[0.02] border border-white/5 text-white/50 hover:bg-white/[0.04] hover:text-white/80'
          }`}
        >
          <Instagram className="w-5 h-5" /> Instagram
        </button>
        <button 
          onClick={() => setSourceMode('local')}
          className={`flex-1 p-6 rounded-3xl font-medium tracking-wide text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
            sourceMode === 'local' 
              ? 'bg-white/10 text-white border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(255,255,255,0.05)]' 
              : 'bg-white/[0.02] border border-white/5 text-white/50 hover:bg-white/[0.04] hover:text-white/80'
          }`}
        >
          <HardDrive className="w-5 h-5" /> Local Folder
        </button>
      </div>

      {sourceMode === 'instagram' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="cred-card p-10 md:p-14">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] mb-8">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-8">Connect Instagram</h2>
            
            <div className="mb-10 relative">
              <label className="block text-xs uppercase tracking-widest text-white/40 font-semibold mb-3 ml-1">Profile URL or Username</label>
              <input 
                type="text" 
                value={instaInput}
                onChange={(e) => { setInstaInput(e.target.value); setError(''); }}
                placeholder="https://www.instagram.com/granny_crochet0/"
                className="cred-input w-full text-lg py-5 px-6"
              />
              {error && <div className="absolute -bottom-7 left-2 text-red-400 font-medium text-sm">{error}</div>}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleAddSource}
                disabled={loading}
                className="cred-btn cred-btn-accent px-10 py-4 text-lg w-full md:w-auto"
              >
                <PlusCircle className="w-5 h-5" /> {loading ? 'Provisioning...' : 'Add Source'}
              </button>
            </div>
          </div>
        </div>
      )}

      {sourceMode === 'local' && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <div 
            onClick={() => showToast('Local directory selection requires native filesystem API.', 'info')} 
            className="cred-card p-16 flex flex-col items-center justify-center text-center cursor-pointer group border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-500"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
              <UploadCloud className="w-10 h-10 text-white/40 group-hover:text-blue-400 transition-colors" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-white/90">Drop Files Here</h2>
            <p className="text-white/40 mb-10 max-w-sm">Drag and drop raw images or archives to begin local extraction.</p>
            
            <div className="flex items-center gap-6 w-full max-w-sm">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs uppercase tracking-widest text-white/30 font-semibold">or</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>
            
            <button className="cred-btn cred-btn-secondary mt-10 px-8 py-4">
              <Folder className="w-5 h-5" /> Select Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

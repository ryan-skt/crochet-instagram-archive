import { useEffect, useState } from 'react';
import { fetchStatus, fetchMedia } from '../services/api';
import type { Media } from '../services/mock';
import ArchiveImageCard from '../components/ArchiveImageCard';
import { ArrowRight, Upload, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [status, setStatus] = useState({ total_images: 0, classified: 0, review: 0, duplicates: 0 });
  const [recent, setRecent] = useState<Media[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatus().then((s: any) => setStatus(s));
    fetchMedia().then(m => setRecent(m.slice(0, 5)));
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Hero */}
      <div className="mb-16 md:mb-24 flex flex-col items-start relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow"></div>
        <div className="absolute top-40 left-20 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30">
            Crochet<br/>
            Image<br/>
            Archive
          </h1>
          <p className="text-lg md:text-xl max-w-2xl text-white/60 font-light leading-relaxed">
            A frictionless visual intelligence system for collecting, classifying, and organizing crochet imagery.
          </p>
        </div>
      </div>

      {/* System Status Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
        <div className="cred-card p-6 md:p-8 flex flex-col justify-between group">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold group-hover:text-blue-400 transition-colors">Total Images</h2>
          <div className="text-4xl md:text-6xl font-bold tracking-tight text-white">{status.total_images.toLocaleString()}</div>
        </div>
        <div className="cred-card p-6 md:p-8 flex flex-col justify-between group">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold group-hover:text-purple-400 transition-colors">Classified</h2>
          <div className="text-4xl md:text-6xl font-bold tracking-tight text-white">{status.classified.toLocaleString()}</div>
        </div>
        <div className="cred-card p-6 md:p-8 flex flex-col justify-between group bg-gradient-to-b from-yellow-500/10 to-transparent border-yellow-500/20">
          <h2 className="text-xs uppercase tracking-widest text-yellow-500/70 mb-4 font-semibold">Review Needed</h2>
          <div className="text-4xl md:text-6xl font-bold tracking-tight text-yellow-400">{status.review}</div>
        </div>
        <div className="cred-card p-6 md:p-8 flex flex-col justify-between group bg-gradient-to-b from-red-500/5 to-transparent">
          <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold">Duplicates</h2>
          <div className="text-4xl md:text-6xl font-bold tracking-tight text-white/80">{status.duplicates}</div>
        </div>
      </div>

      {/* Pipeline & Action */}
      <div className="flex flex-col xl:flex-row gap-6 mb-24 items-stretch animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <button 
          onClick={() => navigate('/import')}
          className="cred-card !bg-gradient-to-br from-blue-600 to-indigo-800 hover:from-blue-500 hover:to-indigo-700 flex-shrink-0 w-full xl:w-96 flex flex-col items-start justify-between p-10 group border-0 shadow-[0_0_40px_rgba(59,130,246,0.2)]"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md mb-12 group-hover:scale-110 transition-transform duration-500">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="font-bold text-3xl md:text-4xl tracking-tight text-white block mb-2">Import Media</span>
            <span className="text-white/70 font-medium">Add a new Instagram source</span>
          </div>
        </button>

        <div className="flex-1 cred-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-around gap-8 relative">
          <div className="flex flex-col items-center gap-4 animate-float" style={{ animationDelay: '0s' }}>
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] text-xl font-bold text-white/80">1</div>
            <div className="text-sm font-medium text-white/60 tracking-wide">Source</div>
          </div>
          <ArrowRight className="w-6 h-6 text-white/20 hidden md:block" />
          
          <div className="flex flex-col items-center gap-4 animate-float" style={{ animationDelay: '0.5s' }}>
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)] text-xl font-bold text-blue-400">2</div>
            <div className="text-sm font-medium text-blue-400/80 tracking-wide">Classify</div>
          </div>
          <ArrowRight className="w-6 h-6 text-white/20 hidden md:block" />

          <div className="flex flex-col items-center gap-4 animate-float" style={{ animationDelay: '1s' }}>
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.2)] text-xl font-bold text-green-400">3</div>
            <div className="text-sm font-medium text-green-400/80 tracking-wide">Organize</div>
          </div>
        </div>
      </div>

      {/* Two column layout for recent items & activity */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <div className="flex-[2]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Recent Imports</h2>
            <button onClick={() => navigate('/archive')} className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">View Archive &rarr;</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {recent.map((media, i) => (
              <div key={media.id} className={`${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <ArchiveImageCard media={media} onClick={() => navigate(`/archive/${media.id}`)} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-white/50" /> System Log
            </h2>
          </div>
          <div className="cred-card p-6 space-y-6">
            <div className="flex gap-4 group">
              <div className="text-xs font-mono text-white/40 pt-1">08:42</div>
              <div>
                <div className="font-medium text-white/90">24 images imported</div>
                <div className="text-sm text-white/50 mt-1">Source: granny_crochet0</div>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="text-xs font-mono text-white/40 pt-1">08:38</div>
              <div>
                <div className="font-medium text-white/90">21 images classified</div>
                <div className="text-sm text-blue-400/80 mt-1">Gemini Pro Vision</div>
              </div>
            </div>
            <div className="flex gap-4 group">
              <div className="text-xs font-mono text-yellow-500/60 pt-1">08:31</div>
              <div>
                <div className="font-medium text-yellow-400/90">3 items sent to review</div>
                <div className="text-sm text-white/50 mt-1">Confidence below threshold</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

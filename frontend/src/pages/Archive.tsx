import { useEffect, useState } from 'react';
import { fetchMedia } from '../services/api';
import type { Media } from '../services/mock';
import ArchiveImageCard from '../components/ArchiveImageCard';
import { Search, SlidersHorizontal, X, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function Archive() {
  const { showToast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedia().then(m => {
      setMediaItems(m);
      setTotal(m.length);
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Archive</h1>
          <p className="text-white/50">Browsing {total} classified assets.</p>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-4">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input 
              type="text" 
              placeholder="Search by tag, color, or source..." 
              className="cred-input w-full pl-12"
            />
          </div>
          <button 
            className={`cred-btn ${showFilters ? 'cred-btn-primary' : 'cred-btn-secondary'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden md:inline">Filters</span>
          </button>
          <button 
            onClick={() => showToast('Exporting data requires API implementation.', 'info')} 
            className="cred-btn cred-btn-secondary"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Filter Drawer */}
        <div className={`
          absolute md:relative z-20 inset-y-0 right-0 w-80 cred-card border-y-0 border-r-0 rounded-none md:rounded-3xl md:border transition-all duration-500 flex flex-col
          ${showFilters ? 'translate-x-0 md:mr-6 opacity-100' : 'translate-x-full md:translate-x-0 md:hidden opacity-0 md:opacity-100'}
        `}>
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Filters</h3>
            <button className="md:hidden text-white/50 hover:text-white" onClick={() => setShowFilters(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4">Source</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Instagram (granny_crochet0)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Local Import</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4">Category</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Garment</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Accessory</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">Amigurumi</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mediaItems.map((media, i) => (
              <div 
                key={`${media.id}-${i}`} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${(i % 12) * 50}ms` }}
              >
                <ArchiveImageCard media={media} onClick={() => navigate(`/archive/${media.id}`)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

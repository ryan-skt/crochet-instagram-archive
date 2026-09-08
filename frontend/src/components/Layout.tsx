import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Box, CheckSquare, Layers, Settings, Menu, X, PlusCircle, Network } from 'lucide-react';
import PrayerFlags from './PrayerFlags';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Box, id: '01' },
    { name: 'Archive', path: '/archive', icon: Box, id: '02' },
    { name: 'Review Queue', path: '/review', icon: CheckSquare, id: '03' },
    { name: 'Duplicates', path: '/duplicates', icon: Layers, id: '04' },
    { name: 'Add Source', path: '/import', icon: PlusCircle, id: '05' },
    { name: 'Sources', path: '/sources', icon: Network, id: '06' },
    { name: 'Settings', path: '/settings', icon: Settings, id: '07' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {/* Mobile Header - Glassmorphic */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          CrochetArchive
        </h1>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white/70 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar - Sleek dark pane */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col flex-shrink-0 transition-transform duration-500 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-32 p-8 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            Crochet<br/>Archive
          </h1>
          <button className="md:hidden text-white/50 hover:text-white relative z-10" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-4 ml-4">Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className={`w-5 h-5 ${item.path === location.pathname ? 'text-blue-400' : ''}`} />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-8 border-t border-white/5">
          <div className="cred-card p-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse"></div>
            <div className="text-sm font-medium text-white/80 tracking-wide">System Online</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto mt-20 md:mt-0 relative scroll-smooth">
        <PrayerFlags />
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-500" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <div className="animate-in fade-in duration-700 h-full p-4 pt-36 md:p-8 md:pt-36 lg:p-12 lg:pt-36 max-w-[1400px] mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

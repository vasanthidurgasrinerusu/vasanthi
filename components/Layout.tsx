
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeStep?: number;
  onNavClick?: (target: 'guideline' | 'feedback' | 'status') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeStep = 0, onNavClick }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] selection:bg-cyan-500/30">
      {/* Top Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-cyan-600 p-2 rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.4)]">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-futuristic font-black text-white italic tracking-tighter neon-text">PayNow Helper</span>
            </div>
            <div className="flex items-center gap-4">
               <span className="hidden md:block text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Node V3.0</span>
               <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Persistent "Three Lines" Navigation Sidebar */}
        <aside className="fixed bottom-0 w-full lg:relative lg:w-24 bg-slate-950/90 lg:bg-slate-950/40 border-t lg:border-t-0 lg:border-r border-white/10 backdrop-blur-xl lg:h-[calc(100vh-64px)] py-4 lg:py-8 flex lg:flex-col items-center justify-around lg:justify-between z-50 transition-all duration-500">
          
          <div className="hidden lg:flex flex-col items-center gap-1 opacity-20">
             <div className="w-8 h-1 bg-white/20 rounded-full"></div>
             <div className="w-4 h-1 bg-white/20 rounded-full"></div>
             <div className="w-6 h-1 bg-white/20 rounded-full"></div>
          </div>

          <nav className="flex lg:flex-col items-center gap-6 lg:gap-10 w-full lg:w-auto px-4 lg:px-0">
            {/* Line 1: Guideline */}
            <button 
              onClick={() => onNavClick?.('guideline')}
              className="group relative flex flex-col items-center gap-1.5 transition-all"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 border ${activeStep === 7 ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] border-cyan-400' : 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white border-cyan-400/20'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.782 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeStep === 7 ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`}>Guideline</span>
              <div className={`absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full hidden lg:block transition-all shadow-[0_0_10px_#22d3ee] ${activeStep === 7 ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>

            {/* Line 2: Feedback */}
            <button 
              onClick={() => onNavClick?.('feedback')}
              className="group relative flex flex-col items-center gap-1.5 transition-all"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 border ${activeStep === 6 ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-400' : 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white border-purple-400/20'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeStep === 6 ? 'text-purple-400' : 'text-slate-500 group-hover:text-purple-400'}`}>Feedback</span>
            </button>

            {/* Line 3: Status */}
            <button 
              onClick={() => onNavClick?.('status')}
              className="group relative flex flex-col items-center gap-1.5 transition-all"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 border ${activeStep === 5 ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] border-amber-400' : 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-white border-amber-400/20'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${activeStep === 5 ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`}>Status</span>
            </button>
          </nav>
          
          <div className="hidden lg:flex flex-col items-center gap-4">
             <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping absolute inset-0"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 relative"></div>
             </div>
             <div className="h-20 w-[1px] bg-gradient-to-b from-cyan-500/50 via-cyan-500/10 to-transparent"></div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow pb-24 lg:pb-0 overflow-x-hidden">
          {children}
        </main>
      </div>

      <footer className="bg-slate-950 border-t border-white/5 py-10 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-4">
          <div className="flex gap-6 opacity-30">
            <div className="w-12 h-0.5 bg-white"></div>
            <div className="w-12 h-0.5 bg-white"></div>
            <div className="w-12 h-0.5 bg-white"></div>
          </div>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">PayNow Eligibility Engine • Distributed AI Network • v3.0.4</p>
        </div>
      </footer>
    </div>
  );
};

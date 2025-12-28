
import React, { useState, useEffect } from 'react';
import { generateGuidelineImage } from '../services/geminiService';

interface Guideline {
  id: string;
  title: string;
  description: string;
  concept: string;
  imageUrl?: string;
  category: 'Critical' | 'Planning' | 'Security';
}

const initialGuidelines: Guideline[] = [
  { 
    id: 'safe-borrow', 
    title: 'Safe Borrowing', 
    description: 'The golden rule: Your loan payment should never exceed 35% of your take-home pay.',
    concept: 'A golden shield protecting a pile of glowing coins, balanced on a scale',
    category: 'Security'
  },
  { 
    id: 'credit-health', 
    title: 'Credit Health', 
    description: 'A higher score proves to banks that you are a reliable partner, lowering your interest rates.',
    concept: 'A glowing health heart with a rising graph inside, neon holographic pulse',
    category: 'Critical'
  },
  { 
    id: 'loan-terms', 
    title: 'Loan Terms', 
    description: 'Short terms save you money on interest; long terms give you breathing room for bills.',
    concept: 'An hourglass filled with glowing blue sand and floating calendars',
    category: 'Planning'
  },
  { 
    id: 'collateral-power', 
    title: 'Collateral Assets', 
    description: 'Using property or land as collateral is the single most powerful way to guarantee approval.',
    concept: 'A high-tech digital key hovering over a holographic plot of land',
    category: 'Critical'
  }
];

export const VisualGuidelines: React.FC = () => {
  const [guidelines, setGuidelines] = useState<Guideline[]>(initialGuidelines);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const loadImage = async (id: string, concept: string) => {
    setLoadingIds(prev => new Set(prev).add(id));
    const url = await generateGuidelineImage(concept);
    if (url) {
      setGuidelines(prev => prev.map(g => g.id === id ? { ...g, imageUrl: url } : g));
    }
    setLoadingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  useEffect(() => {
    // Automatically load the first two most important graphics
    loadImage(initialGuidelines[0].id, initialGuidelines[0].concept);
    loadImage(initialGuidelines[1].id, initialGuidelines[1].concept);
  }, []);

  return (
    <div className="glass p-6 rounded-[2.5rem] border-white/10 shadow-2xl space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-white uppercase tracking-widest font-futuristic">Knowledge Hub</h4>
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Mastering Loan Eligibility</p>
        </div>
        <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.782 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </header>
      
      <div className="space-y-6">
        {guidelines.map((g) => (
          <div key={g.id} className="group relative space-y-3">
            <div className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-500 ${g.imageUrl ? 'border-white/10' : 'border-dashed border-slate-700 bg-white/5'}`}>
              {g.imageUrl ? (
                <div className="aspect-square relative overflow-hidden bg-slate-900">
                  <img 
                    src={g.imageUrl} 
                    alt={g.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-3 left-3">
                    <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                      g.category === 'Critical' ? 'bg-red-500 text-white' : 
                      g.category === 'Planning' ? 'bg-cyan-500 text-white' : 'bg-green-500 text-white'
                    }`}>
                      {g.category}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center p-8 text-center bg-black/40">
                  {loadingIds.has(g.id) ? (
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-t-cyan-400 rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => loadImage(g.id, g.concept)}
                      className="group flex flex-col items-center gap-3"
                    >
                      <div className="p-4 rounded-full bg-white/5 border border-white/10 group-hover:bg-cyan-500 group-hover:border-cyan-400 transition-all">
                        <svg className="w-6 h-6 text-slate-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-cyan-400">Generate Guide</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-1 space-y-1">
              <h5 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{g.title}</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{g.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-center">
        <p className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest">Knowledge is Power</p>
      </div>
    </div>
  );
};


import React, { useState } from 'react';

interface Props {
  onComplete: () => void;
}

export const FeedbackForm: React.FC<Props> = ({ onComplete }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [isUseful, setIsUseful] = useState<boolean | null>(null);
  const [usefulReasons, setUsefulReasons] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reasons = [
    { id: 'docs', label: "Learned which documents I need", icon: '📄' },
    { id: 'criteria', label: "Understood bank criteria better", icon: '🏦' },
    { id: 'rejection', label: "Understood rejection risks", icon: '⚠️' },
    { id: 'voice', label: "Voice help clarified terms", icon: '🗣️' },
    { id: 'hope', label: "Felt more confident to apply", icon: '📈' }
  ];

  const toggleReason = (id: string) => {
    setUsefulReasons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="py-24 text-center space-y-8 animate-in zoom-in duration-700">
        <div className="w-28 h-28 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto border border-cyan-400/40 shadow-2xl shadow-cyan-500/20">
          <svg className="w-14 h-14 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-white font-futuristic">AUDIT COMPLETE</h2>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed text-lg">Your response helps us lower the 40% loan rejection rate for everyone. We've updated our guidelines based on your input.</p>
        </div>
        <button onClick={onComplete} className="px-16 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">Back to Start</button>
      </div>
    );
  }

  return (
    <div className="glass p-12 rounded-[3.5rem] border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-700 max-w-2xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-black text-white font-futuristic uppercase tracking-tighter">Impact Survey</h2>
        <p className="text-slate-400 text-lg">Was the answer given by the app useful or not?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="flex flex-col items-center gap-6">
           <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => setIsUseful(true)}
                className={`flex-1 px-10 py-5 rounded-2xl font-black text-lg transition-all border ${isUseful === true ? 'bg-green-500 border-green-500 text-white shadow-xl shadow-green-500/20' : 'bg-white/5 border-white/10 text-slate-500'}`}
              >
                YES, USEFUL
              </button>
              <button 
                type="button" 
                onClick={() => setIsUseful(false)}
                className={`flex-1 px-10 py-5 rounded-2xl font-black text-lg transition-all border ${isUseful === false ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/20' : 'bg-white/5 border-white/10 text-slate-500'}`}
              >
                NO, NOT USEFUL
              </button>
           </div>
        </div>

        {isUseful === true && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.4em] block text-center">If useful, how exactly was it useful?</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reasons.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleReason(r.id)}
                  className={`p-5 rounded-2xl text-left text-xs font-bold border transition-all flex items-center gap-4 ${usefulReasons.includes(r.id) ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-400 hover:border-cyan-400/30'}`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <span className="leading-snug">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
           <div className="flex justify-between items-center px-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Assistant Star Rating</label>
              <span className="text-cyan-400 font-black">{rating || 0} / 5</span>
           </div>
           <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} className={`w-14 h-14 rounded-2xl text-2xl transition-all flex items-center justify-center ${rating === star ? 'bg-cyan-500 text-white scale-125 shadow-2xl z-10' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                {['😟','😐','🙂','😊','🤩'][star-1]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">How can we make bank rules even clearer?</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-white/5 border border-slate-700 p-6 rounded-[2.5rem] text-white text-sm outline-none h-44 focus:border-cyan-400 transition-all placeholder:text-slate-700"
            placeholder="Describe your experience with the assistant here..."
          />
        </div>

        <button 
          type="submit" 
          disabled={!rating || isUseful === null} 
          className="w-full py-6 bg-cyan-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-lg hover:bg-cyan-500 transition-all disabled:opacity-20 shadow-2xl active:scale-[0.98]"
        >
          Send Audit Report
        </button>
      </form>
    </div>
  );
};

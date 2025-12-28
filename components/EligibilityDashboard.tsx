
import React from 'react';
import { EligibilityAnalysis } from '../types';

interface Props {
  analysis: EligibilityAnalysis;
  applicantPhoto?: string;
  onFinish: () => void;
}

export const EligibilityDashboard: React.FC<Props> = ({ analysis, applicantPhoto, onFinish }) => {
  const statusColor = analysis.status === 'Approved' ? 'text-green-400' : analysis.status === 'Review Required' ? 'text-yellow-400' : 'text-red-400';
  const bgColor = analysis.status === 'Approved' ? 'bg-green-500/10 border-green-500/20' : analysis.status === 'Review Required' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
      <div className={`p-8 rounded-3xl border-2 ${bgColor} relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 flex-grow text-center md:text-left">
            {applicantPhoto && (
              <div className="w-24 h-24 rounded-full border-4 border-white/10 overflow-hidden shadow-xl flex-shrink-0">
                <img src={applicantPhoto} alt="Applicant" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-3">
              <h2 className={`text-4xl font-black ${statusColor} font-futuristic`}>
                {analysis.status.toUpperCase()}
              </h2>
              <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                {analysis.feedback}
              </p>
            </div>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center min-w-[140px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Eligibility Score</span>
            <div className={`text-5xl font-black ${statusColor}`}>
              {analysis.score}<span className="text-sm">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
           {/* Detailed Eligibility Rejection Logic */}
           <div className="glass p-8 rounded-3xl border-red-500/30 bg-red-500/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-red-500/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                 </div>
                 <h3 className="text-xl font-bold text-white font-futuristic uppercase tracking-tighter">Why Rejection Happens</h3>
              </div>
              
              <div className="space-y-6">
                 {analysis.rejectionRisks.map((risk, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3 relative group overflow-hidden">
                       <div className="flex justify-between items-start">
                          <h4 className="text-md font-bold text-red-400">{risk.reason}</h4>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${risk.severity === 'High' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
                             {risk.severity} SEVERITY
                          </span>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[11px] text-slate-300 font-medium">
                            <span className="text-slate-500 uppercase text-[9px] block mb-1">Bank Criteria Logic:</span>
                            {risk.description}
                          </p>
                          <div className="bg-green-500/5 border border-green-500/10 p-3 rounded-xl">
                            <span className="text-green-400 text-[10px] font-bold uppercase block mb-1">Increase your chance:</span>
                            <p className="text-[11px] text-slate-400 italic">{risk.howToFix}</p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="glass p-8 rounded-3xl border-white/10 shadow-xl">
              <h3 className="text-lg font-bold text-cyan-400 mb-6 font-futuristic uppercase tracking-tight">Eligibility Boosters</h3>
              <div className="space-y-4">
                 {analysis.futureScenarios.map((scen, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-cyan-500/5 transition-all">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-white">{scen.label}</span>
                          <span className="text-cyan-400 font-bold text-xs">+{scen.probability}% Chance</span>
                       </div>
                       <p className="text-xs text-slate-400">{scen.impact}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-[2.5rem] bg-cyan-600/10 border-2 border-cyan-400/20 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 font-futuristic uppercase">Perfect Submission Guide</h3>
            <p className="text-[11px] text-slate-400 mb-6 italic">Follow these specific steps to avoid being part of the 40% rejection pool.</p>
            <div className="space-y-4">
               {analysis.formFillingSteps.map((step, i) => (
                 <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-400/40 transition-colors">
                   <div className="w-7 h-7 rounded-full bg-cyan-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-lg shadow-cyan-600/30">{i + 1}</div>
                   <p className="text-slate-200 text-xs leading-relaxed font-semibold">{step}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border-white/10">
            <h3 className="text-md font-bold text-purple-400 mb-4 uppercase tracking-[0.2em] font-futuristic">Final Recommendations</h3>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></div>
                  <span className="text-sm text-slate-300 font-medium leading-snug">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={onFinish}
            className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-xl hover:scale-[1.03] active:scale-95 transition-all shadow-2xl hover:shadow-white/20"
          >
            Finished! Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

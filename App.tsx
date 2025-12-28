
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { FormStep, LoanApplication, EligibilityAnalysis, LoanType } from './types';
import { analyzeEligibility, generateGuidelineImage } from './services/geminiService';
import { EligibilityDashboard } from './components/EligibilityDashboard';
import { AIGuide } from './components/AIGuide';
import { VisualGuidelines } from './components/VisualGuidelines';
import { FeedbackForm } from './components/FeedbackForm';
import { VoiceChat } from './components/VoiceChat';

const initialForm: LoanApplication = {
  fullName: '',
  email: '',
  income: 0,
  employmentStatus: 'Employed',
  loanAmount: 0,
  loanType: 'Personal',
  loanPurpose: '',
  existingDebt: 0,
  creditScoreCategory: 'Good',
  hasProperty: false,
  hasDocuments: [],
  photo: ''
};

// Internal component for the guideline cards on the selection screen
const SelectionGuidelines: React.FC = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const pillars = [
    { id: 'logic', title: 'Approval Logic', concept: 'Holographic circuit board with glowing checkmarks', desc: 'Understanding bank algorithms' },
    { id: 'collateral', title: 'Asset Power', concept: 'A futuristic diamond-shaped shield protecting a digital deed', desc: 'Boosting score with property' },
    { id: 'docs', title: 'Zero-Error Docs', concept: 'A glowing file folder with binary data streams', desc: 'Eliminating paperwork rejections' }
  ];

  useEffect(() => {
    pillars.forEach(async (p) => {
      const url = await generateGuidelineImage(p.concept);
      if (url) setImages(prev => ({ ...prev, [p.id]: url }));
    });
  }, []);

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-4">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] font-futuristic">Core Eligibility Pillars</h3>
        <div className="h-[1px] flex-grow bg-white/10"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pillars.map((p) => (
          <div key={p.id} className="group relative glass rounded-[2rem] border-white/5 overflow-hidden transition-all hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-400/5">
            <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden">
              {images[p.id] ? (
                <img src={images[p.id]} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <h4 className="text-white font-black text-sm uppercase tracking-tight group-hover:text-cyan-400 transition-colors">{p.title}</h4>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{p.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<FormStep>(FormStep.TYPE_SELECTION);
  const [formData, setFormData] = useState<LoanApplication>(initialForm);
  const [analysis, setAnalysis] = useState<EligibilityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loanDocs: Record<LoanType, string[]> = {
    'Personal': ['Pay Slips (3 months)', 'National ID / Passport', 'Address Proof', 'Bank Statements'],
    'Business': ['Business Registration Cert', 'Tax Returns (2 Years)', 'Audited Financials', 'Business Plan'],
    'Education': ['Admission Offer Letter', 'Fee Structure (Hospital/College)', 'Co-signer ID', 'Past Academic Transcripts'],
    'Health': ['Hospital Cost Estimate', 'Medical Recommendation Letter', 'National ID', 'Income Proof for Repayment'],
    'Home': ['Property Title Deed', 'Building Plan Approval', 'Property Valuation', 'Income Documents'],
    'Auto': ['Official Vehicle Invoice', 'Driver License', 'Income Proof', 'Insurance Quote']
  };

  const progress = useMemo(() => (step / 6) * 100, [step]);

  useEffect(() => {
    if (step === FormStep.SCANNING) {
      const interval = setInterval(() => {
        setScanningProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(FormStep.ANALYSIS), 500);
            return 100;
          }
          return prev + 5;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      const result = await analyzeEligibility(formData);
      setAnalysis(result);
    } catch (err) { console.error(err); }
    finally { setIsAnalyzing(false); }
  };

  const updateForm = (updates: Partial<LoanApplication>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateForm({ photo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const toggleDoc = (doc: string) => {
    setFormData(prev => ({
      ...prev,
      hasDocuments: prev.hasDocuments.includes(doc) 
        ? prev.hasDocuments.filter(d => d !== doc) 
        : [...prev.hasDocuments, doc]
    }));
  };

  const handleSidebarNav = (target: 'guideline' | 'feedback' | 'status') => {
    if (target === 'guideline') {
      setStep(FormStep.GUIDELINES);
    } else if (target === 'feedback') {
      setStep(FormStep.FEEDBACK);
    } else if (target === 'status') {
      if (analysis) {
        setStep(FormStep.ANALYSIS);
      } else {
        // Fallback to current progressive step if no analysis is ready
        if (step > FormStep.DOCUMENTS && step < FormStep.ANALYSIS) {
           // still scanning or analyzing
        } else {
           // Show current step
        }
      }
    }
  };

  return (
    <Layout activeStep={step} onNavClick={handleSidebarNav}>
      <div className="fixed top-16 left-0 w-full h-[2px] z-[60] bg-white/5 pointer-events-none">
        <div className="h-full bg-cyan-400 shadow-[0_0_20px_#22d3ee] transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          <div className="lg:col-span-8">
            {step === FormStep.GUIDELINES ? (
              <div className="space-y-8 animate-in zoom-in duration-500">
                <header className="flex items-center justify-between border-b border-white/10 pb-6">
                  <h1 className="text-4xl font-black text-white font-futuristic uppercase tracking-tighter">Knowledge Hub</h1>
                  <button onClick={() => setStep(FormStep.TYPE_SELECTION)} className="text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Close Hub
                  </button>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <VisualGuidelines />
                   <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
                      <h3 className="text-xl font-bold text-cyan-400 font-futuristic uppercase">Why guidelines matter</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">Most loan rejections (approx 40%) stem from simple misunderstandings of eligibility criteria. By following our AI-curated guidelines, you reduce risk by providing high-quality collateral and accurate documentation.</p>
                      <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-400/20">
                         <h4 className="text-white font-bold text-xs uppercase mb-2">Pro Tip:</h4>
                         <p className="text-xs text-cyan-200">Using land or property as collateral is the single most effective way to secure approval for high-limit loans.</p>
                      </div>
                   </div>
                </div>
              </div>
            ) : step === FormStep.FEEDBACK ? (
              <FeedbackForm onComplete={() => window.location.reload()} />
            ) : step === FormStep.ANALYSIS ? (
              <div className="glass p-8 md:p-12 rounded-[3rem] border-white/5 relative overflow-hidden min-h-[600px] shadow-2xl">
                {isAnalyzing ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center space-y-8">
                     <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-cyan-400/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
                     </div>
                     <div className="space-y-3">
                        <h3 className="text-3xl font-black text-white font-futuristic uppercase tracking-tighter">Analyzing Eligibility Criteria</h3>
                        <p className="text-slate-400 text-sm max-w-sm">Comparing your assets, documents, and income against bank approval logic.</p>
                     </div>
                  </div>
                ) : analysis ? (
                  <EligibilityDashboard analysis={analysis} applicantPhoto={formData.photo} onFinish={() => setStep(FormStep.FEEDBACK)} />
                ) : <div className="text-center py-20"><button onClick={() => setStep(FormStep.TYPE_SELECTION)} className="bg-white text-black px-8 py-3 rounded-full font-bold">Restart</button></div>}
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in duration-700">
                <header className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-cyan-400 text-[10px] tracking-[0.5em] uppercase border border-cyan-400/30 px-3 py-1 rounded-full">Phase {step + 1} / 5</span>
                    <div className="h-[1px] flex-grow bg-white/10"></div>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-white font-futuristic leading-[1.1] uppercase tracking-tighter">
                    {step === FormStep.TYPE_SELECTION ? "Start Your Journey" : 
                     step === FormStep.PERSONAL ? "Identity Details" :
                     step === FormStep.ASSETS ? "Financial Audit" :
                     step === FormStep.DOCUMENTS ? "Verify Readiness" : "Processing"}
                  </h1>
                </header>

                <div className={`glass rounded-[2.5rem] border-white/10 shadow-2xl relative group overflow-hidden ${step === FormStep.TYPE_SELECTION ? 'p-6 md:p-10 pb-0 md:pb-0' : 'p-6 md:p-10'}`}>
                  <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                     <svg className="w-64 h-64 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  </div>

                  {step === FormStep.TYPE_SELECTION && (
                    <div className="space-y-10 relative z-10">
                       <div className="space-y-4">
                          <h3 className="text-xl font-bold text-white uppercase tracking-tight font-futuristic">Select Your Loan Path</h3>
                          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">PayNow analyzes different criteria for each loan type. Selecting the correct category ensures your analysis is 100% accurate to banking standards.</p>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                          {(['Personal', 'Business', 'Education', 'Health', 'Home', 'Auto'] as LoanType[]).map(type => (
                             <button
                               key={type}
                               onClick={() => { updateForm({ loanType: type }); setStep(FormStep.PERSONAL); }}
                               className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-5 transition-all group relative overflow-hidden ${formData.loanType === type ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'border-white/5 bg-white/5 hover:border-cyan-400/40 hover:scale-[1.02]'}`}
                             >
                                <div className={`p-4 rounded-2xl shadow-2xl transition-all duration-500 ${formData.loanType === type ? 'bg-cyan-500 text-white scale-110 shadow-cyan-500/30' : 'bg-slate-800 text-slate-500 group-hover:text-cyan-400'}`}>
                                   {type === 'Personal' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth={2.5}/></svg>}
                                   {type === 'Business' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={2.5}/></svg>}
                                   {type === 'Education' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.782 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth={2.5}/></svg>}
                                   {type === 'Health' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth={2.5}/></svg>}
                                   {type === 'Home' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth={2.5}/></svg>}
                                   {type === 'Auto' && <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth={2.5}/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth={2.5}/></svg>}
                                </div>
                                <div className="text-center">
                                  <span className="font-black text-xs uppercase tracking-widest block">{type}</span>
                                  <span className="text-[9px] text-slate-500 font-black uppercase mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">Select Category</span>
                                </div>
                             </button>
                          ))}
                       </div>
                       
                       <SelectionGuidelines />
                    </div>
                  )}

                  {step === FormStep.PERSONAL && (
                    <div className="space-y-10 relative z-10">
                      <div className="flex flex-col items-center">
                        <div onClick={() => fileInputRef.current?.click()} className="w-40 h-40 rounded-full border-4 border-dashed border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden relative group bg-white/5 transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                          {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" alt="Profile" /> : (
                            <div className="text-center">
                               <svg className="w-12 h-12 text-slate-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth={1.5}/></svg>
                               <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Identify Profile</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-cyan-500/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                             <span className="text-white font-black text-[10px] uppercase tracking-widest">Change Photo</span>
                          </div>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        <p className="mt-5 text-[11px] text-slate-500 uppercase tracking-[0.2em] font-black text-center">Verify identity to reduce processing time by 80%</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Full Legal Name</label>
                           <input type="text" placeholder="As written in Government ID" className="w-full bg-slate-950/50 border-2 border-white/5 p-5 rounded-3xl text-white outline-none focus:border-cyan-400 transition-all font-bold placeholder:text-slate-800" value={formData.fullName} onChange={e => updateForm({fullName: e.target.value})} />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Contact Email</label>
                           <input type="email" placeholder="active@mailbox.com" className="w-full bg-slate-950/50 border-2 border-white/5 p-5 rounded-3xl text-white outline-none focus:border-cyan-400 transition-all font-bold placeholder:text-slate-800" value={formData.email} onChange={e => updateForm({email: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-4 pt-6">
                        <button onClick={() => setStep(FormStep.TYPE_SELECTION)} className="flex-1 py-5 text-slate-500 font-black uppercase tracking-widest hover:text-white transition-all text-xs">Categories</button>
                        <button onClick={() => setStep(FormStep.ASSETS)} className="flex-[3] py-5 bg-cyan-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-cyan-600/40 hover:bg-cyan-500 hover:scale-[1.01] transition-all active:scale-95">Initiate Financial Audit</button>
                      </div>
                    </div>
                  )}

                  {step === FormStep.ASSETS && (
                    <div className="space-y-10 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Stable Monthly Income ($)</label>
                          <input type="number" className="w-full bg-slate-950/50 border-2 border-white/5 p-5 rounded-3xl text-white outline-none focus:border-cyan-400 transition-all text-xl font-black" value={formData.income || ''} onChange={e => updateForm({income: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Monthly Debt Obligation ($)</label>
                          <input type="number" className="w-full bg-slate-950/50 border-2 border-white/5 p-5 rounded-3xl text-white outline-none focus:border-cyan-400 transition-all text-xl font-black" value={formData.existingDebt || ''} onChange={e => updateForm({existingDebt: Number(e.target.value)})} />
                        </div>
                        <div className="space-y-3 md:col-span-2">
                          <div className="flex justify-between items-center mb-1">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Requested Funding ($)</label>
                             <span className="text-[9px] font-bold text-cyan-500/60 uppercase">High Intensity Liquidity</span>
                          </div>
                          <input type="number" className="w-full bg-slate-950/50 border-2 border-white/5 p-6 rounded-[2rem] text-cyan-400 font-black text-5xl outline-none focus:border-cyan-400 transition-all placeholder:text-slate-900" placeholder="0.00" value={formData.loanAmount || ''} onChange={e => updateForm({loanAmount: Number(e.target.value)})} />
                        </div>
                      </div>
                      <div className={`p-8 rounded-[3rem] border-2 transition-all duration-700 ${formData.hasProperty ? 'border-cyan-400 bg-cyan-400/5 shadow-[0_0_50px_rgba(34,211,238,0.1)]' : 'border-white/5 bg-white/5'}`}>
                         <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-3 text-center md:text-left">
                               <h4 className="font-black text-white text-2xl uppercase tracking-tighter neon-text">Asset Collateralization</h4>
                               <p className="text-xs text-slate-400 max-w-sm leading-relaxed">Providing property, land, or vehicles as security can reduce risk rejection probability by 45%. This is the most effective way to secure high-value loans.</p>
                            </div>
                            <button onClick={() => updateForm({hasProperty: !formData.hasProperty})} className={`px-14 py-6 rounded-[2rem] font-black text-[11px] transition-all uppercase tracking-[0.3em] whitespace-nowrap border-2 ${formData.hasProperty ? 'bg-cyan-500 border-cyan-400 text-white shadow-2xl shadow-cyan-500/50' : 'bg-transparent border-slate-800 text-slate-500 hover:text-white hover:border-cyan-400'}`}>
                               {formData.hasProperty ? 'Asset Verified' : 'Attach Asset'}
                            </button>
                         </div>
                      </div>
                      <div className="flex gap-4 pt-6">
                        <button onClick={() => setStep(FormStep.PERSONAL)} className="flex-1 py-5 text-slate-500 font-black uppercase tracking-widest text-xs">Back</button>
                        <button onClick={() => setStep(FormStep.DOCUMENTS)} className="flex-[3] py-5 bg-cyan-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-cyan-600/40">Enter Document Phase</button>
                      </div>
                    </div>
                  )}

                  {step === FormStep.DOCUMENTS && (
                    <div className="space-y-10 relative z-10">
                      <div className="space-y-8">
                         <div className="text-center md:text-left space-y-3">
                            <h4 className="text-2xl font-black text-white uppercase tracking-tight font-futuristic">Readiness Protocol</h4>
                            <p className="text-sm text-slate-500 max-w-2xl">Missing documentation accounts for 40% of all initial rejections. PayNow validates these prerequisites before you submit to a real lender.</p>
                         </div>
                         <div className="grid grid-cols-1 gap-4">
                            {loanDocs[formData.loanType].map(doc => (
                              <button key={doc} onClick={() => toggleDoc(doc)} className={`p-6 md:p-8 rounded-[2.5rem] border-2 flex items-center justify-between transition-all group ${formData.hasDocuments.includes(doc) ? 'border-green-500 bg-green-500/10 text-white shadow-xl shadow-green-500/10' : 'border-white/5 bg-white/5 text-slate-500 hover:border-cyan-400/30'}`}>
                                 <div className="flex items-center gap-6">
                                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${formData.hasDocuments.includes(doc) ? 'bg-green-500 border-green-500 shadow-xl shadow-green-500/40' : 'border-slate-800 group-hover:border-cyan-400'}`}>
                                       {formData.hasDocuments.includes(doc) && <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                                    </div>
                                    <span className="text-sm md:text-base font-black uppercase tracking-tight group-hover:text-white transition-colors">{doc}</span>
                                 </div>
                                 <span className={`text-[10px] font-black tracking-[0.3em] uppercase hidden sm:block ${formData.hasDocuments.includes(doc) ? 'text-green-400' : 'text-slate-700'}`}>
                                    {formData.hasDocuments.includes(doc) ? 'Validated' : 'Pending'}
                                 </span>
                              </button>
                            ))}
                         </div>
                      </div>
                      <div className="flex gap-4 pt-6">
                        <button onClick={() => setStep(FormStep.ASSETS)} className="flex-1 py-5 text-slate-500 font-black uppercase tracking-widest text-xs">Back</button>
                        <form onSubmit={handleSubmit} className="flex-[3]">
                          <button type="submit" onClick={() => setStep(FormStep.SCANNING)} className="w-full py-5 bg-purple-600 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-purple-600/30 hover:scale-[1.01] active:scale-95 transition-all">Submit Final Analysis</button>
                        </form>
                      </div>
                    </div>
                  )}

                  {step === FormStep.SCANNING && (
                    <div className="py-24 text-center space-y-12 relative z-10">
                       <div className="relative w-40 h-40 mx-auto">
                          <div className="absolute inset-0 border-[6px] border-cyan-400/10 rounded-full"></div>
                          <div className="absolute inset-0 border-[6px] border-t-cyan-400 rounded-full animate-spin shadow-[0_0_40px_rgba(34,211,238,0.3)]"></div>
                          <div className="absolute inset-0 flex items-center justify-center font-black text-cyan-400 text-3xl font-futuristic tracking-tighter">
                             {scanningProgress}<span className="text-sm">%</span>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h3 className="text-3xl font-black text-white uppercase tracking-[0.6em] font-futuristic neon-text">AI Risk Matrix Scan</h3>
                          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">Cross-referencing applicant data with global liquidity protocols for {formData.loanType} eligibility.</p>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8 h-fit">
            <div className="sticky top-24 space-y-8 pb-10">
              <VoiceChat userName={formData.fullName || 'Applicant'} />
              <AIGuide application={formData} />
              <VisualGuidelines />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default App;

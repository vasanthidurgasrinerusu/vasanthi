
import React, { useState, useRef, useEffect } from 'react';
import { getAdvisorAdvice } from '../services/geminiService';
import { LoanApplication } from '../types';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const AIGuide: React.FC<{ application: LoanApplication }> = ({ application }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! I'm your loan helper. I'm here to answer any questions you have in simple terms. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await getAdvisorAdvice(userMsg, application);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting. Can you ask again?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] glass rounded-3xl border-white/10 shadow-xl overflow-hidden">
      <div className="bg-cyan-600 p-5 text-white flex items-center gap-3">
         <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
           <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
           </svg>
         </div>
         <h3 className="font-bold text-sm tracking-wide">Friendly Loan Helper</h3>
      </div>

      <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto space-y-4 scroll-smooth bg-black/10">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none' 
                : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex gap-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 p-2 text-cyan-400 hover:text-white transition-colors disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

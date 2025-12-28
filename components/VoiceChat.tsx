
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface Props {
  userName: string;
}

export const VoiceChat: React.FC<Props> = ({ userName }) => {
  const [isActive, setIsActive] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const inputContext = new AudioContext({ sampleRate: 16000 });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          const source = inputContext.createMediaStreamSource(stream);
          const processor = inputContext.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
          };
          source.connect(processor);
          processor.connect(inputContext.destination);
          setIsConnecting(false);
          setIsActive(true);
        },
        onmessage: async (msg: LiveServerMessage) => {
          const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData && audioContextRef.current) {
            const buffer = await decodeAudioData(decode(audioData), audioContextRef.current);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
        },
        onclose: () => setIsActive(false),
        onerror: () => setIsActive(false),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `You are a helpful loan assistant named PayNow Bot. Speak to ${userName} in ${language}. Use simple terms and be encouraging. Help them understand complex loan terms through voice.`,
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    sessionRef.current?.close();
    setIsActive(false);
  };

  return (
    <div className="glass p-5 rounded-3xl border-cyan-400/20 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
          Voice Assistant
        </h4>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white/5 text-[10px] border border-white/10 rounded px-2 py-1 outline-none text-slate-300"
        >
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
          <option>Hindi</option>
          <option>Arabic</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        {!isActive ? (
          <button 
            onClick={startSession}
            disabled={isConnecting}
            className="flex-1 bg-cyan-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-cyan-500 transition-all disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"/></svg>
                Start Voice Chat
              </>
            )}
          </button>
        ) : (
          <button 
            onClick={stopSession}
            className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500/30 transition-all"
          >
            Stop Assistant
          </button>
        )}
      </div>
      <p className="text-[9px] text-slate-500 text-center leading-tight">
        Speak in your language for a real-time conversation about your loan.
      </p>
    </div>
  );
};

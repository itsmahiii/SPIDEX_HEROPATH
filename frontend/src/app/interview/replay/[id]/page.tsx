"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function InterviewReplayPage() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const savedTranscript = localStorage.getItem("heropath_last_transcript");
    if (savedTranscript) {
      try {
        setMessages(JSON.parse(savedTranscript));
      } catch (e) {}
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 h-full max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl text-[#F2F0EA]" style={{ textShadow: '3px 3px 0 #0B0B0F' }}>
            INTERVIEW REPLAY
          </h1>
          <p className="text-[#F5D90A] font-bold mt-2">Past Session Transcript & Analysis</p>
        </div>
        <Link href="/dashboard" className="uppercase font-bold text-sm text-[#F2F0EA] hover:text-[#F71B6A] underline">
          ← Back to HQ
        </Link>
      </div>

      <div className="comic-panel flex-1 flex flex-col overflow-hidden bg-[#2E1A47]/40 border-[4px] border-[#0B0B0F] min-h-[500px]">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 20%, transparent 20%)', backgroundSize: '10px 10px' }}>
          
          {messages.length === 0 ? (
            <div className="text-[#F2F0EA] text-center p-8 opacity-70">
              No recent transcript found. Complete a Danger Room session first.
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' ? (
                  <div className="bg-[#2E1A47] border-[3px] border-[#0B0B0F] p-5 max-w-[80%] relative shadow-[4px_4px_0_#0B0B0F]">
                    <div className="absolute -left-3 top-5 w-4 h-4 bg-[#2E1A47] border-l-[3px] border-b-[3px] border-[#0B0B0F] transform rotate-45"></div>
                    <p className="font-bold text-[#F71B6A] text-sm uppercase mb-2 tracking-widest border-b-[2px] border-[#0B0B0F]/50 pb-1">INTERVIEWER_BOT</p>
                    <p className="text-[#F2F0EA] font-sans leading-relaxed">{msg.content}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-end max-w-[80%]">
                    <div className="bg-[#0B0B0F] border-[3px] border-[#F2F0EA] p-5 relative shadow-[4px_4px_0_#F71B6A]">
                      <div className="absolute -right-3 top-5 w-4 h-4 bg-[#0B0B0F] border-r-[3px] border-t-[3px] border-[#F2F0EA] transform rotate-45"></div>
                      <p className="font-bold text-[#F5D90A] text-sm uppercase mb-2 tracking-widest border-b-[2px] border-[#F2F0EA]/30 pb-1">YOU</p>
                      <p className="text-[#F2F0EA] font-sans leading-relaxed">{msg.content}</p>
                    </div>
                    {msg.feedback && (
                      <div className="mt-3 bg-[#F71B6A] text-[#0B0B0F] border-[3px] border-[#0B0B0F] p-3 text-xs font-bold uppercase rotate-[-1deg] shadow-[3px_3px_0_#0B0B0F]">
                        {msg.feedback}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {messages.length > 0 && (
          <div className="bg-[#0B0B0F] p-4 text-center border-t-[4px] border-[#0B0B0F]">
            <button className="text-[#F5D90A] font-bold text-sm uppercase hover:underline" onClick={() => window.print()}>
              🖨️ Export as PDF
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

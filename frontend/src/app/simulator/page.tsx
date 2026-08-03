"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Simulator() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [interviewerMode, setInterviewerMode] = useState<string>("Technical");
  const [hasStarted, setHasStarted] = useState(false);

  const startInterview = async () => {
    setHasStarted(true);
    setIsTyping(true);
    try {
      const profile = JSON.parse(localStorage.getItem("heropath_onboarding") || "{}");
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [], 
          profile, 
          resumeSummary: "Experienced candidate looking for new challenges.",
          interviewerMode 
        })
      });
      const data = await res.json();
      if (data.role) {
        setMessages([data]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input, feedback: null }
    ];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const profile = JSON.parse(localStorage.getItem("heropath_onboarding") || "{}");
      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, profile, interviewerMode })
      });
      const data = await res.json();
      
      if (data.role) {
        // Update user message with feedback if provided
        if (data.feedback) {
          newMessages[newMessages.length - 1].feedback = data.feedback;
        }
        setMessages([...newMessages, { role: data.role, content: data.content, feedback: null }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEndSession = async () => {
    setIsTyping(true);
    try {
      const res = await fetch("/api/interview/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      const data = await res.json();
      if (data.delta) {
        localStorage.setItem("heropath_last_delta", JSON.stringify(data.delta));
      }
      if (data.weakSpots) {
        localStorage.setItem("heropath_weak_spots", JSON.stringify(data.weakSpots));
      }
      localStorage.setItem("heropath_last_transcript", JSON.stringify(messages));
      router.push("/interview/summary/latest");
    } catch (e) {
      console.error(e);
      alert("Failed to end session properly.");
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 h-full max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl text-[#F2F0EA]" style={{ textShadow: '3px 3px 0 #0B0B0F' }}>
            THE DANGER ROOM
          </h1>
          <p className="mt-2 text-[#F5D90A] font-bold tracking-wider">Live Mock Interview Simulation</p>
        </div>
        <Link href="/dashboard" className="uppercase font-bold text-sm text-[#F2F0EA] hover:text-[#F71B6A] underline">
          ← Back to HQ
        </Link>
        <button onClick={handleEndSession} className="uppercase font-bold text-sm text-[#F71B6A] hover:text-[#F2F0EA] border-[2px] border-[#F71B6A] px-3 py-1">
          End Session ◼
        </button>
      </div>

      <div className="comic-panel flex-1 flex flex-col overflow-hidden bg-[#2E1A47]/40 border-[4px] border-[#0B0B0F]">
        {!hasStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
            <h2 className="text-3xl text-[#F5D90A] mb-8 border-b-[3px] border-[#0B0B0F] pb-2">CHOOSE YOUR INTERVIEWER</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
              {['HR', 'Technical', 'Manager', 'CEO'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInterviewerMode(mode)}
                  className={`border-[3px] border-[#0B0B0F] p-6 text-center transition-all ${
                    interviewerMode === mode 
                      ? 'bg-[#F71B6A] text-[#0B0B0F] shadow-[4px_4px_0_#F5D90A] translate-y-[-4px]' 
                      : 'bg-[#0B0B0F]/50 text-[#F2F0EA] hover:bg-[#0B0B0F]/80 shadow-[4px_4px_0_#0B0B0F]'
                  }`}
                >
                  <h3 className="font-bold text-xl uppercase tracking-widest">{mode}</h3>
                  <p className="text-sm mt-2 opacity-80">
                    {mode === 'HR' && "Focuses on culture & teamwork"}
                    {mode === 'Technical' && "Strict technical deep-dive"}
                    {mode === 'Manager' && "Focuses on leadership & delivery"}
                    {mode === 'CEO' && "Focuses on vision & strategy"}
                  </p>
                </button>
              ))}
            </div>
            <button 
              onClick={startInterview}
              className="btn-primary px-12 py-4 text-2xl animate-pulse"
            >
              ENTER SIMULATION
            </button>
          </div>
        ) : (
          <>
            {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 20%, transparent 20%)', backgroundSize: '10px 10px' }}>
          {messages.map((msg, idx) => (
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
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#2E1A47] border-[3px] border-[#0B0B0F] p-4 text-[#F71B6A] font-bold text-sm animate-pulse shadow-[4px_4px_0_#0B0B0F]">
                INTERVIEWER_BOT IS TYPING...
              </div>
            </div>
          )}
        </div>

            {/* Input Area */}
            <div className="p-4 border-t-[4px] border-[#0B0B0F] bg-[#0B0B0F]/90">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-4 max-w-4xl mx-auto w-full"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your response..." 
                  className="flex-1 bg-[#0B0B0F] border-[3px] border-[#F2F0EA] p-4 focus:outline-none focus:border-[#F71B6A] text-[#F2F0EA] font-sans text-lg"
                  aria-label="Interview response input"
                  disabled={isTyping}
                  suppressHydrationWarning
                />
                <button 
                  type="submit" 
                  className="btn-primary text-xl px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed" 
                  aria-label="Send response"
                  disabled={!input.trim() || isTyping}
                  suppressHydrationWarning
                >
                  SEND
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

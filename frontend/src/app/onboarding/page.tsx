"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [stage, setStage] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [biggestFear, setBiggestFear] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if onboarding is already completed
    const existing = localStorage.getItem("heropath_onboarding");
    if (existing) {
      router.push("/resume");
    }
  }, [router]);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = { stage, target_role: targetRole, biggest_fear: biggestFear };
      
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        localStorage.setItem("heropath_onboarding", JSON.stringify(payload));
        router.push("/resume");
      } else {
        alert("Failed to save profile. Try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 justify-center items-center h-full max-w-3xl mx-auto w-full">
      
      <div className="flex w-full justify-between mb-8 px-4">
        {[1, 2, 3].map((num) => (
          <div key={num} className={`h-2 flex-1 mx-1 ${step >= num ? 'bg-[#F71B6A]' : 'bg-[#0B0B0F]/50'} border-[2px] border-[#0B0B0F] transition-colors duration-300`}></div>
        ))}
      </div>

      <div className="comic-panel w-full flex flex-col p-8 md:p-12 min-h-[400px]">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl mb-6 text-[#F5D90A] border-b-[3px] border-[#0B0B0F] pb-4">
              ORIGIN STORY: PART 1
            </h2>
            <h3 className="text-xl text-[#F2F0EA] mb-6">What stage are you at in your journey?</h3>
            <div className="flex flex-col gap-4">
              {['Student', 'Recent Grad', 'Career Switcher'].map((opt) => (
                <label 
                  key={opt}
                  className={`border-[3px] border-[#0B0B0F] p-4 cursor-pointer flex items-center gap-4 transition-colors ${stage === opt ? 'bg-[#F71B6A] text-[#0B0B0F]' : 'bg-[#0B0B0F]/30 text-[#F2F0EA] hover:bg-[#0B0B0F]/50'}`}
                >
                  <input 
                    type="radio" 
                    name="stage" 
                    value={opt} 
                    checked={stage === opt}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-5 h-5 accent-[#0B0B0F]"
                  />
                  <span className="font-bold text-lg uppercase tracking-wider">{opt}</span>
                </label>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleNext} 
                disabled={!stage}
                className="btn-primary px-8 py-3 disabled:opacity-50"
              >
                NEXT →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl mb-6 text-[#F5D90A] border-b-[3px] border-[#0B0B0F] pb-4">
              ORIGIN STORY: PART 2
            </h2>
            <h3 className="text-xl text-[#F2F0EA] mb-2">What role are you training for?</h3>
            <p className="text-[#F2F0EA]/70 mb-6 text-sm">We'll use this to tailor your gap analysis.</p>
            <input 
              type="text" 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-4 text-[#F2F0EA] focus:outline-none focus:border-[#F71B6A] font-sans text-lg"
              autoFocus
            />
            <div className="mt-8 flex justify-between">
              <button onClick={handleBack} className="uppercase font-bold text-sm text-[#F2F0EA] hover:text-[#F71B6A] underline">
                ← BACK
              </button>
              <button 
                onClick={handleNext} 
                disabled={!targetRole.trim()}
                className="btn-primary px-8 py-3 disabled:opacity-50"
              >
                NEXT →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl mb-6 text-[#F5D90A] border-b-[3px] border-[#0B0B0F] pb-4">
              ORIGIN STORY: PART 3
            </h2>
            <h3 className="text-xl text-[#F2F0EA] mb-2">What is your biggest fear about interviews?</h3>
            <p className="text-[#F2F0EA]/70 mb-6 text-sm">Be honest. Our AI uses this to coach you better.</p>
            <textarea 
              value={biggestFear}
              onChange={(e) => setBiggestFear(e.target.value)}
              placeholder="e.g. Freezing up on technical questions, or sounding too scripted..."
              className="w-full bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-4 text-[#F2F0EA] focus:outline-none focus:border-[#F71B6A] font-sans text-lg min-h-[120px] resize-none"
              autoFocus
            />
            <div className="mt-8 flex justify-between items-center">
              <button onClick={handleBack} className="uppercase font-bold text-sm text-[#F2F0EA] hover:text-[#F71B6A] underline">
                ← BACK
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={!biggestFear.trim() || isSubmitting}
                className="btn-primary px-8 py-3 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? "SAVING..." : "ENTER THE SYSTEM →"}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

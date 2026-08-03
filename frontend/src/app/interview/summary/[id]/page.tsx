"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function InterviewSummaryPage() {
  const [delta, setDelta] = useState<any>(null);

  useEffect(() => {
    const savedDelta = localStorage.getItem("heropath_last_delta");
    if (savedDelta) {
      try {
        setDelta(JSON.parse(savedDelta));
      } catch (e) {}
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 justify-center items-center h-full max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <h1 className="text-4xl md:text-5xl mb-6 text-[#F2F0EA] text-center" style={{ textShadow: '3px 3px 0 #0B0B0F' }}>
        SESSION COMPLETE
      </h1>

      {delta ? (
        <div className="comic-panel w-full flex flex-col p-8 bg-[#2E1A47] border-[4px] border-[#0B0B0F] shadow-[8px_8px_0_#F5D90A]">
          <h2 className="text-2xl mb-4 border-b-[3px] border-[#0B0B0F] pb-2 text-[#F5D90A]">
            CONFIDENCE DELTA
          </h2>
          <p className="text-lg text-[#F2F0EA] mb-6 italic">
            "Since your last session: {delta.one_line_summary}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-4 text-[#F2F0EA]">
              <h3 className="font-bold uppercase tracking-wider text-sm mb-2 text-[#F5D90A] flex items-center gap-2">
                <span className="text-xl">📈</span> Improved Areas
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {delta.improved_areas?.map((area: string, idx: number) => (
                  <li key={idx} className="text-sm">{area}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-4 text-[#F2F0EA]">
              <h3 className="font-bold uppercase tracking-wider text-sm mb-2 text-[#F71B6A] flex items-center gap-2">
                <span className="text-xl">⚠️</span> Still Needs Work
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {delta.still_weak_areas?.map((area: string, idx: number) => (
                  <li key={idx} className="text-sm">{area}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="comic-panel w-full flex flex-col p-8 bg-[#0B0B0F] border-[4px] border-[#F2F0EA] text-center">
           <h2 className="text-2xl mb-4 text-[#F5D90A]">FIRST SESSION LOGGED</h2>
           <p className="text-[#F2F0EA]">Complete another session to unlock Confidence Delta tracking!</p>
        </div>
      )}

      <div className="mt-8">
        <Link href="/dashboard">
          <button className="btn-primary px-8 py-4 text-xl">
            RETURN TO DASHBOARD
          </button>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MatchPredictorPage() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [error, setError] = useState("");

  const dreamCompanies = [
    "Google", "Microsoft", "Amazon", "OpenAI", "NVIDIA", "Zoho", "TCS"
  ];

  useEffect(() => {
    // Load latest resume from versions
    const savedVersions = localStorage.getItem("heropath_resume_versions");
    if (savedVersions) {
      try {
        const versions = JSON.parse(savedVersions);
        if (versions.length > 0) {
          setResumeData(versions[0].data);
        }
      } catch (e) {}
    }
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeData) {
      setError("No resume found. Please upload a resume first via The Oracle.");
      return;
    }
    if (!jobDescription.trim() && !selectedCompany) {
      setError("Please provide a Job Description or select a Dream Company.");
      return;
    }

    setIsLoading(true);
    setError("");
    setMatchResult(null);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          jobDescription: jobDescription.trim(),
          company: selectedCompany
        })
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      setMatchResult(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 h-full max-w-5xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl text-[#F2F0EA]" style={{ textShadow: '3px 3px 0 #0B0B0F' }}>
            MATCH PREDICTOR
          </h1>
          <p className="text-[#F5D90A] font-bold mt-2">Test your profile against real-world targets.</p>
        </div>
        <Link href="/dashboard" className="uppercase font-bold text-sm text-[#F2F0EA] hover:text-[#F71B6A] underline">
          ← Back to HQ
        </Link>
      </div>

      {!resumeData && (
        <div className="bg-[#F71B6A] text-[#0B0B0F] p-4 font-bold uppercase mb-6 shadow-[4px_4px_0_#0B0B0F]">
          ⚠️ No resume detected. <Link href="/resume" className="underline hover:text-[#F2F0EA]">Upload a resume in The Oracle first.</Link>
        </div>
      )}

      {error && (
        <div className="bg-[#F71B6A] text-[#0B0B0F] p-4 font-bold uppercase mb-6 shadow-[4px_4px_0_#0B0B0F]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Col: Inputs */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="comic-panel p-6">
            <h2 className="text-xl mb-4 border-b-[3px] border-[#0B0B0F] pb-2 text-[#F5D90A]">
              1. DREAM COMPANY
            </h2>
            <div className="flex flex-wrap gap-3">
              {dreamCompanies.map(company => (
                <button
                  key={company}
                  type="button"
                  onClick={() => {
                    setSelectedCompany(company);
                    setJobDescription("");
                  }}
                  className={`border-[2px] border-[#0B0B0F] px-4 py-2 font-bold uppercase transition-all ${
                    selectedCompany === company 
                      ? 'bg-[#F71B6A] text-[#0B0B0F] shadow-[3px_3px_0_#0B0B0F] translate-y-[-2px]' 
                      : 'bg-[#0B0B0F]/50 text-[#F2F0EA] hover:bg-[#F71B6A]/50'
                  }`}
                >
                  {company}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center font-bold text-[#F2F0EA] text-2xl">OR</div>

          <div className="comic-panel p-6">
            <h2 className="text-xl mb-4 border-b-[3px] border-[#0B0B0F] pb-2 text-[#F71B6A]">
              2. PASTE JOB DESCRIPTION
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setSelectedCompany("");
              }}
              className="w-full h-48 bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-4 text-[#F2F0EA] font-sans focus:border-[#F71B6A] focus:outline-none transition-colors resize-none"
              placeholder="Paste the raw text of the job description here..."
            />
          </div>

          <button 
            onClick={handlePredict}
            disabled={isLoading || (!jobDescription && !selectedCompany) || !resumeData}
            className="btn-primary py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "CALCULATING..." : "PREDICT MATCH"}
          </button>
        </div>

        {/* Right Col: Results */}
        <div className="md:col-span-7">
          {matchResult ? (
            <div className="comic-panel p-6 h-full flex flex-col gap-6 bg-[#2E1A47]/40 animate-in fade-in zoom-in duration-500">
              <h2 className="text-2xl border-b-[3px] border-[#0B0B0F] pb-2 text-[#F2F0EA]">
                TARGET: <span className="text-[#F5D90A]">{selectedCompany || "CUSTOM JD"}</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0B0B0F] border-[3px] border-[#F71B6A] p-4 text-center shadow-[4px_4px_0_#0B0B0F]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#F71B6A] mb-2">ATS Match Score</h3>
                  <div className="text-5xl font-bold text-[#F2F0EA]">{matchResult.ats_match_score}%</div>
                </div>
                <div className="bg-[#0B0B0F] border-[3px] border-[#F5D90A] p-4 text-center shadow-[4px_4px_0_#0B0B0F]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5D90A] mb-2">Interview Prob.</h3>
                  <div className="text-5xl font-bold text-[#F2F0EA]">{matchResult.interview_probability}%</div>
                </div>
              </div>

              <div className="bg-[#0B0B0F]/50 border-[3px] border-[#0B0B0F] p-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F71B6A] mb-3">Missing Critical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missing_skills?.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-[#0B0B0F] border-[2px] border-[#F71B6A] px-3 py-1 text-xs font-bold text-[#F2F0EA]">
                      {skill}
                    </span>
                  ))}
                  {(!matchResult.missing_skills || matchResult.missing_skills.length === 0) && (
                    <span className="text-[#F2F0EA]/50 text-sm">None detected!</span>
                  )}
                </div>
              </div>

              <div className="bg-[#0B0B0F]/50 border-[3px] border-[#0B0B0F] p-4 flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5D90A] mb-3">Readiness Roadmap</h3>
                <ul className="flex flex-col gap-3">
                  {matchResult.roadmap?.map((step: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-[#F2F0EA]">
                      <span className="text-[#F71B6A] font-bold">[{idx + 1}]</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="comic-panel p-6 h-full flex items-center justify-center border-dashed border-[#0B0B0F] bg-transparent opacity-50">
              <p className="text-[#F2F0EA] font-bold uppercase text-center">
                Select a target and run the predictor<br/>to see your match analysis.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

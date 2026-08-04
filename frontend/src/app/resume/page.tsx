"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ResumeOraclePage() {
  const calculatePercentile = (score: number, role: string) => {
    const benchmarks: Record<string, {p25: number, p50: number, p75: number}> = {
      "data analyst": { p25: 45, p50: 62, p75: 78 },
      "software engineer": { p25: 40, p50: 58, p75: 75 },
      "default": { p25: 40, p50: 55, p75: 70 }
    };
    const b = benchmarks[role.toLowerCase()] || benchmarks["default"];
    let pct = 0;
    if (score <= b.p25) pct = (score / b.p25) * 25;
    else if (score <= b.p50) pct = 25 + ((score - b.p25) / (b.p50 - b.p25)) * 25;
    else if (score <= b.p75) pct = 50 + ((score - b.p50) / (b.p75 - b.p50)) * 25;
    else pct = 75 + ((score - b.p75) / (100 - b.p75)) * 25;
    return Math.min(Math.max(Math.round(pct), 1), 99);
  };

  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState("");
  const [hasOnboardingProfile, setHasOnboardingProfile] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    const existing = localStorage.getItem("heropath_onboarding");
    if (existing) {
      try {
        const profile = JSON.parse(existing);
        if (profile.target_role) {
          setTargetRole(profile.target_role);
          setHasOnboardingProfile(true);
        }
      } catch (e) {}
    }
    const savedVersions = localStorage.getItem("heropath_resume_versions");
    if (savedVersions) {
      try {
        setVersions(JSON.parse(savedVersions));
      } catch (e) {}
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !targetRole) {
      setError("Please provide both a resume file and a target role.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Convert File to Base64 to avoid Vercel FormData binary corruption bugs
      const arrayBuffer = await file.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString('base64');

      const response = await fetch("/api/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileBase64: base64String,
          fileName: file.name,
          targetRole: targetRole,
        }),
      });

      let result;
      const textResponse = await response.text();
      try {
        result = JSON.parse(textResponse);
      } catch (e) {
        throw new Error(`Server returned an invalid response (Status ${response.status}). This usually means the server timed out or crashed.`);
      }

      if (!response.ok) {
        throw new Error(result?.error || "Failed to parse resume");
      }

      const newVersion = {
        id: Date.now().toString(),
        targetRole,
        date: new Date().toISOString(),
        data: result.data
      };
      const updatedVersions = [newVersion, ...versions];
      setVersions(updatedVersions);
      localStorage.setItem("heropath_resume_versions", JSON.stringify(updatedVersions));
      setParsedData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 h-full max-w-4xl mx-auto w-full">
      <h1 className="text-4xl md:text-5xl mb-2 text-[#F2F0EA]" style={{ textShadow: '3px 3px 0 #0B0B0F' }}>
        THE ORACLE
      </h1>
      <p className="mb-8 text-[#F5D90A] font-bold">Upload your resume. Discover your true potential.</p>
      
      {!parsedData ? (
        <div className="flex flex-col gap-6">
          {versions.length > 0 && (
            <div className="comic-panel p-6" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl mb-4 border-b-[3px] border-[#0B0B0F] pb-2 text-[#F5D90A]">
                PAST RESUME VERSIONS
              </h2>
              <div className="flex flex-col gap-3">
                {versions.map((v, idx) => (
                  <button 
                    key={v.id}
                    onClick={() => {
                      setTargetRole(v.targetRole);
                      setParsedData(v.data);
                    }}
                    className="flex justify-between items-center bg-[#0B0B0F]/50 border-[2px] border-[#0B0B0F] p-4 hover:bg-[#F71B6A] hover:text-[#0B0B0F] transition-colors text-left"
                  >
                    <div>
                      <div className="font-bold uppercase tracking-wider">{v.targetRole} Resume</div>
                      <div className="text-xs opacity-70 mt-1">{new Date(v.date).toLocaleDateString()}</div>
                    </div>
                    <div className="font-bold">LOAD →</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="comic-panel p-8" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl mb-6 border-b-[3px] border-[#0B0B0F] pb-2 text-[#F71B6A] uppercase font-bold">
              Upload New Resume
            </h2>
          <form onSubmit={handleUpload} className="flex flex-col gap-6">
            
            {!hasOnboardingProfile && (
              <div className="flex flex-col gap-2">
                <label className="font-bold uppercase tracking-wider text-sm text-[#F2F0EA]">
                  Target Job Role
                </label>
                <input 
                  type="text" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Developer" 
                  className="bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-4 text-[#F2F0EA] font-sans focus:border-[#F71B6A] focus:outline-none transition-colors"
                  required={!hasOnboardingProfile}
                  suppressHydrationWarning
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="font-bold uppercase tracking-wider text-sm text-[#F2F0EA]">
                Resume (PDF)
              </label>
              <div className="border-[3px] border-dashed border-[#0B0B0F] bg-[#0B0B0F]/30 p-8 text-center hover:bg-[#0B0B0F]/50 transition-colors relative cursor-pointer">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <span className="text-4xl mb-4 block text-[#F71B6A]">↑</span>
                <p className="font-bold uppercase tracking-wider text-sm mb-1 text-[#F2F0EA]">
                  {file ? file.name : "Drag & Drop PDF"}
                </p>
                <p className="text-xs opacity-70 text-[#F2F0EA]">{file ? "File selected" : "Click to browse"}</p>
              </div>
            </div>

            {error && (
              <div className="bg-[#F71B6A]/20 border-[3px] border-[#F71B6A] p-4 text-[#F2F0EA] font-bold">
                ⚠️ {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary w-full mt-4 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !file}
              suppressHydrationWarning
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-[#F2F0EA] border-t-transparent rounded-full"></span>
                  Consulting The Oracle...
                </>
              ) : (
                "Analyze Resume"
              )}
            </button>

          </form>
        </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="comic-panel p-6 bg-[#2E1A47]/80 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-2xl mb-4 border-b-[3px] border-[#0B0B0F] pb-2 text-[#F5D90A]">
                CANDIDATE SUMMARY
              </h2>
              <p className="text-lg leading-relaxed text-[#F2F0EA]">
                {parsedData.summary}
              </p>
            </div>
            
            {parsedData.match_score && (
              <div className="w-full md:w-1/3 bg-[#0B0B0F] border-[3px] border-[#F71B6A] p-4 flex flex-col justify-center items-center text-center shadow-[4px_4px_0_#0B0B0F]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F71B6A] mb-2">Match Score</h3>
                <div className="text-5xl font-bold text-[#F2F0EA] mb-4">{parsedData.match_score}/100</div>
                <div className="text-xs text-[#F2F0EA]/80 px-2 group relative">
                  Your score is higher than roughly <span className="font-bold text-[#F5D90A]">{calculatePercentile(parsedData.match_score, targetRole)}%</span> of profiles targeting {targetRole || "this role"}.
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#F2F0EA] text-[#0B0B0F] text-[10px] font-bold border-[2px] border-[#0B0B0F] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Based on aggregate reference data — live peer comparison coming soon.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="comic-panel p-6 bg-[#2E1A47]/80">
              <h2 className="text-xl mb-4 border-b-[3px] border-[#0B0B0F] pb-2 text-[#F71B6A]">
                DETECTED SKILLS
              </h2>
              <div className="flex flex-wrap gap-2">
                {parsedData.skills?.map((skill: string, idx: number) => (
                  <span key={idx} className="bg-[#0B0B0F] border-[2px] border-[#0B0B0F] px-3 py-1 text-sm font-bold text-[#F2F0EA]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="comic-panel p-6 bg-[#2E1A47]/80">
              <h2 className="text-xl mb-4 border-b-[3px] border-[#0B0B0F] pb-2 text-[#F5D90A]">
                EXPERIENCE CLAIMS
              </h2>
              <ul className="flex flex-col gap-3">
                {parsedData.experience_claims?.map((claim: any, idx: number) => (
                  <li key={idx} className="bg-[#0B0B0F]/50 border-l-[3px] border-[#F71B6A] p-3 text-sm text-[#F2F0EA]">
                    {claim.claim}
                    {claim.metric && (
                      <span className="block mt-2 font-bold text-[#F5D90A]">
                        METRIC: {claim.metric}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {parsedData.verifiable_claims && parsedData.verifiable_claims.length > 0 && (
            <div className="comic-panel p-6 bg-[#2E1A47]/80 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <h2 className="text-xl mb-4 border-b-[3px] border-[#0B0B0F] pb-2 text-[#F5D90A] flex justify-between items-end">
                <span>VERIFIABLE CLAIMS</span>
                <span className="text-xs bg-[#0B0B0F] text-[#F71B6A] px-2 py-1 border-[2px] border-[#0B0B0F]">CREDIBILITY: PENDING</span>
              </h2>
              <ul className="flex flex-col gap-2">
                {parsedData.verifiable_claims.map((claim: string, idx: number) => (
                  <li key={idx} className="flex justify-between items-center bg-[#0B0B0F]/50 border-[2px] border-[#0B0B0F] p-3 text-sm text-[#F2F0EA]">
                    <span className="flex-1 pr-4">{claim}</span>
                    <Link href="/simulator">
                      <button className="text-xs uppercase font-bold text-[#F71B6A] hover:text-[#F5D90A] transition-colors whitespace-nowrap border-[2px] border-[#F71B6A] hover:border-[#F5D90A] px-2 py-1">
                        Verify in Simulator →
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={() => setParsedData(null)} 
              className="uppercase font-bold text-sm text-[#F2F0EA] hover:text-[#F71B6A] underline"
            >
              ← Upload Another
            </button>
            <Link href="/dashboard">
              <button className="btn-primary">
                Proceed to Dashboard →
              </button>
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}

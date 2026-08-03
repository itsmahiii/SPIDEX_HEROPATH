"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BrandAnalyzerPage() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<any>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedInText, setLinkedInText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [brandResult, setBrandResult] = useState<any>(null);
  const [error, setError] = useState("");

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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeData) {
      setError("No resume found. Please upload a resume first via The Oracle.");
      return;
    }
    if (!githubUrl && !portfolioUrl && !linkedInText) {
      setError("Please provide at least one link or text to analyze.");
      return;
    }

    setIsLoading(true);
    setError("");
    setBrandResult(null);

    try {
      const res = await fetch("/api/analyze/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          githubUrl: githubUrl.trim(),
          portfolioUrl: portfolioUrl.trim(),
          linkedInText: linkedInText.trim()
        })
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      
      setBrandResult(result.data);
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
            BRAND ANALYZER
          </h1>
          <p className="text-[#F71B6A] font-bold mt-2 uppercase tracking-widest">Digital Footprint Scanner</p>
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
          <form onSubmit={handleAnalyze} className="comic-panel p-6 flex flex-col gap-6">
            <h2 className="text-xl border-b-[3px] border-[#0B0B0F] pb-2 text-[#F5D90A]">
              YOUR DIGITAL ASSETS
            </h2>
            
            <div className="flex flex-col gap-2">
              <label className="font-bold uppercase tracking-wider text-sm text-[#F2F0EA]">GitHub URL</label>
              <input 
                type="url" 
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username" 
                className="bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-3 text-[#F2F0EA] font-sans focus:border-[#F71B6A] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold uppercase tracking-wider text-sm text-[#F2F0EA]">Portfolio URL</label>
              <input 
                type="url" 
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourwebsite.com" 
                className="bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-3 text-[#F2F0EA] font-sans focus:border-[#F71B6A] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold uppercase tracking-wider text-sm text-[#F2F0EA] flex justify-between">
                <span>LinkedIn Profile Text</span>
                <span className="text-[10px] text-[#F71B6A]">(*Anti-Scraping Bypass)</span>
              </label>
              <textarea 
                value={linkedInText}
                onChange={(e) => setLinkedInText(e.target.value)}
                placeholder="Paste the text from your LinkedIn 'About' and 'Experience' sections here..." 
                className="bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-3 text-[#F2F0EA] font-sans focus:border-[#F71B6A] focus:outline-none transition-colors h-32 resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading || (!githubUrl && !portfolioUrl && !linkedInText) || !resumeData}
              className="btn-primary py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "SCANNING..." : "ANALYZE BRAND"}
            </button>
          </form>
        </div>

        {/* Right Col: Results */}
        <div className="md:col-span-7">
          {brandResult ? (
            <div className="comic-panel p-6 h-full flex flex-col gap-6 bg-[#2E1A47]/40 animate-in fade-in zoom-in duration-500">
              
              <div className="flex justify-between items-center border-b-[3px] border-[#0B0B0F] pb-4">
                <h2 className="text-2xl text-[#F2F0EA]">BRAND SCORE</h2>
                <div className="text-5xl font-bold text-[#F5D90A] bg-[#0B0B0F] p-3 border-[3px] border-[#F5D90A] shadow-[4px_4px_0_#0B0B0F]">
                  {brandResult.brand_score}<span className="text-xl text-[#F2F0EA]/50">/100</span>
                </div>
              </div>

              <div className="bg-[#0B0B0F]/80 p-4 border-l-[4px] border-[#F5D90A]">
                <p className="text-[#F2F0EA] font-bold text-lg italic">
                  "{brandResult.overall_verdict}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0B0B0F] border-[3px] border-[#22C55E] p-4 shadow-[4px_4px_0_#0B0B0F]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#22C55E] mb-3">Brand Strengths</h3>
                  <ul className="flex flex-col gap-2">
                    {brandResult.strengths?.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-[#F2F0EA]">
                        <span className="text-[#22C55E]">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-[#0B0B0F] border-[3px] border-[#F71B6A] p-4 shadow-[4px_4px_0_#0B0B0F]">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#F71B6A] mb-3">Blind Spots</h3>
                  <ul className="flex flex-col gap-2">
                    {brandResult.weaknesses?.map((item: string, idx: number) => (
                      <li key={idx} className="flex gap-2 text-sm text-[#F2F0EA]">
                        <span className="text-[#F71B6A]">✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[#0B0B0F]/50 border-[3px] border-[#0B0B0F] p-4 flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#F5D90A] mb-3">Actionable Improvements</h3>
                <ul className="flex flex-col gap-3">
                  {brandResult.actionable_improvements?.map((step: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-[#F2F0EA]">
                      <span className="bg-[#F5D90A] text-[#0B0B0F] font-bold px-2 py-0.5 text-xs h-fit">{idx + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="comic-panel p-6 h-full flex items-center justify-center border-dashed border-[#0B0B0F] bg-transparent opacity-50">
              <p className="text-[#F2F0EA] font-bold uppercase text-center">
                Enter your links and scan<br/>to generate your Brand Score.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [glitchActive, setGlitchActive] = useState(false);
  const [weakSpots, setWeakSpots] = useState<any[]>([]);
  const [whatIfSkill, setWhatIfSkill] = useState("");
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState<any>(null);
  const [salaryResult, setSalaryResult] = useState<any>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [challengeLoading, setChallengeLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const savedVersions = localStorage.getItem("heropath_resume_versions");
      if (savedVersions) {
        try {
          const versions = JSON.parse(savedVersions);
          if (versions.length > 0) {
            setSalaryLoading(true);
            setChallengeLoading(true);
            const resumeData = versions[0].data;
            
            // Fetch Salary
            fetch("/api/salary", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ resumeData })
            }).then(r => r.json()).then(d => {
              if (d.data) setSalaryResult(d.data);
              setSalaryLoading(false);
            });

            // Fetch Challenge
            fetch("/api/challenge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ resumeData })
            }).then(r => r.json()).then(d => {
              if (d.data) setChallenge(d.data);
              setChallengeLoading(false);
            });
          }
        } catch (e) {}
      }
    };
    fetchDashboardData();
  }, []);

  const handleWhatIf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatIfSkill) return;
    setWhatIfLoading(true);
    setWhatIfResult(null);
    try {
      const savedVersions = localStorage.getItem("heropath_resume_versions");
      let resumeData = null;
      if (savedVersions) {
        const versions = JSON.parse(savedVersions);
        if (versions.length > 0) resumeData = versions[0].data;
      }
      if (!resumeData) throw new Error("No resume found in Oracle.");

      const res = await fetch("/api/simulator/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, addedSkill: whatIfSkill })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWhatIfResult(data.data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setWhatIfLoading(false);
    }
  };

  useEffect(() => {
    const savedSpots = localStorage.getItem("heropath_weak_spots");
    if (savedSpots) {
      try {
        setWeakSpots(JSON.parse(savedSpots));
      } catch (e) {}
    }
  }, []);

  const triggerGlitch = () => {
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 300); // match animation duration
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 h-full max-w-7xl mx-auto w-full">
      <h1 className="text-4xl md:text-5xl mb-8 text-[#F2F0EA]" style={{ textShadow: '3px 3px 0 #0B0B0F' }}>
        HERO DASHBOARD
      </h1>
      
      {/* Comic Page Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
        
        {/* Panel 1: The Oracle (Resume Upload) */}
        <div 
          className="comic-panel md:col-span-5 flex flex-col p-6 h-[400px]"
          style={{ animationDelay: '0.1s' }}
        >
          <h2 className="text-2xl mb-4 border-b-[3px] border-[#0B0B0F] pb-2 text-[#F5D90A]">
            THE ORACLE
          </h2>
          <Link href="/resume" className="flex-1 border-[3px] border-dashed border-[#0B0B0F] bg-[#0B0B0F]/30 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-[#0B0B0F]/50 transition-colors focus-visible:outline-none">
            <span className="text-3xl mb-2 text-[#F71B6A]">↑</span>
            <p className="font-bold uppercase tracking-wider text-sm mb-1">Upload Resume Data</p>
            <p className="text-xs opacity-70">Go to Upload Page</p>
          </Link>
          <Link href="/match" className="mt-4 border-[3px] border-[#0B0B0F] bg-[#F71B6A] text-[#0B0B0F] font-bold uppercase text-center py-2 hover:bg-[#F5D90A] transition-colors focus-visible:outline-none shadow-[3px_3px_0_#0B0B0F]">
            Launch Match Predictor →
          </Link>
          <Link href="/brand" className="mt-2 border-[3px] border-[#0B0B0F] bg-[#22C55E] text-[#0B0B0F] font-bold uppercase text-center py-2 hover:bg-[#F5D90A] transition-colors focus-visible:outline-none shadow-[3px_3px_0_#0B0B0F]">
            Brand Scanner →
          </Link>
          {/* Mock Parsed Cards */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="bg-[#0B0B0F]/80 border-2 border-[#0B0B0F] p-3 text-sm flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 20%, transparent 20%)', backgroundSize: '4px 4px' }}></div>
              <span className="font-bold relative z-10 text-[#F2F0EA]">Front-End XP: Level 5</span>
              <span className="text-[#F5D90A] relative z-10 font-bold">MATCH</span>
            </div>
            <div className="bg-[#0B0B0F]/80 border-2 border-[#0B0B0F] p-3 text-sm flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 20%, transparent 20%)', backgroundSize: '4px 4px' }}></div>
              <span className="font-bold relative z-10 text-[#F2F0EA]">System Design: Level 1</span>
              <span className="text-[#F71B6A] relative z-10 font-bold">GAP</span>
            </div>
          </div>

          {weakSpots.length > 0 && (
            <div className="mt-4 pt-4 border-t-[3px] border-[#0B0B0F]">
              <h3 className="font-bold uppercase tracking-wider text-sm mb-2 text-[#F71B6A]">
                FOCUS AREAS
              </h3>
              <div className="flex flex-wrap gap-2">
                {weakSpots.map((spot, idx) => (
                  <div key={idx} className="group relative">
                    <span className="bg-[#F71B6A] text-[#0B0B0F] font-bold text-xs px-2 py-1 uppercase cursor-help shadow-[2px_2px_0_#0B0B0F]">
                      {spot.tag}
                    </span>
                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-[#F2F0EA] text-[#0B0B0F] text-[10px] font-bold border-[2px] border-[#0B0B0F] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {spot.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Skill Tree (Roadmap) */}
        <div 
          className={`comic-panel md:col-span-7 flex flex-col p-6 h-[400px] ${glitchActive ? 'glitch-active' : ''}`}
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex justify-between items-end mb-4 border-b-[3px] border-[#0B0B0F] pb-2">
            <h2 className="text-2xl text-[#F5D90A]">SKILL TREE</h2>
            <button onClick={triggerGlitch} className="text-xs uppercase font-bold text-[#F71B6A] hover:underline" aria-label="Simulate Gap Detection Glitch">
              Simulate Glitch
            </button>
          </div>
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold uppercase mb-1">
              <span>Overall Readiness</span>
              <span>45%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '45%' }}></div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-thin">
            {/* Week 1 Panel */}
            <div className="bg-[#0B0B0F]/40 border-[3px] border-[#0B0B0F] p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm uppercase text-[#F2F0EA]">Week 1: CSS Architecture</h3>
                <p className="text-xs mt-1 text-[#F2F0EA]/70">Master BEM and Utility Classes</p>
              </div>
              <div className="cleared-stamp transform rotate-[-15deg]">CLEARED</div>
            </div>
            {/* Week 2 Panel */}
            <div className="bg-[#0B0B0F]/80 border-[3px] border-[#F71B6A] p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm uppercase text-[#F71B6A]">Week 2: State Management</h3>
                <p className="text-xs mt-1 text-[#F2F0EA]/70">Redux & Context API</p>
              </div>
              <span className="text-xs font-bold uppercase text-[#F5D90A]">In Progress</span>
            </div>
            {/* Week 3 Panel */}
            <div className="bg-[#0B0B0F]/40 border-[3px] border-[#0B0B0F] p-4 flex justify-between items-center opacity-50">
              <div>
                <h3 className="font-bold text-sm uppercase text-[#F2F0EA]">Week 3: System Design</h3>
                <p className="text-xs mt-1 text-[#F2F0EA]/70">Scaling the architecture</p>
              </div>
              <span className="text-[20px]">🔒</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Salary Predictor */}
        <div 
          className="comic-panel md:col-span-12 flex flex-col p-6 bg-[#0B0B0F]/90 border-[4px] border-[#F5D90A]"
          style={{ animationDelay: '0.25s' }}
        >
          <div className="flex justify-between items-end mb-4 border-b-[3px] border-[#F5D90A] pb-2">
            <h2 className="text-2xl text-[#F5D90A]">MARKET VALUE ESTIMATE</h2>
            <span className="text-xs font-bold text-[#F71B6A] uppercase tracking-widest px-2 py-1 bg-[#0B0B0F]">Based on Resume</span>
          </div>
          {salaryLoading ? (
            <div className="text-center p-4 text-[#F5D90A] animate-pulse">Calculating Market Value...</div>
          ) : salaryResult ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-xs uppercase font-bold text-[#F2F0EA]/50 mb-1">Base Expectation</h3>
                <div className="text-3xl font-bold text-[#F2F0EA]">{salaryResult.min_salary}</div>
              </div>
              <div className="text-center bg-[#F5D90A] text-[#0B0B0F] p-4 border-[3px] border-[#0B0B0F] shadow-[4px_4px_0_#F71B6A] transform -translate-y-2">
                <h3 className="text-sm uppercase font-bold text-[#0B0B0F]/70 mb-1">Target Average</h3>
                <div className="text-5xl font-bold text-[#0B0B0F]">{salaryResult.avg_salary}</div>
              </div>
              <div className="text-center">
                <h3 className="text-xs uppercase font-bold text-[#F2F0EA]/50 mb-1">High-End Potential</h3>
                <div className="text-3xl font-bold text-[#F2F0EA]">{salaryResult.max_salary}</div>
              </div>
              <div className="md:col-span-3 mt-2">
                <h3 className="text-xs uppercase font-bold text-[#F71B6A] mb-2 border-t-[2px] border-[#F71B6A]/30 pt-4">Boost Your Value</h3>
                <div className="flex flex-wrap gap-2">
                  {salaryResult.high_paying_skills_to_learn?.map((skill: string, i: number) => (
                    <span key={i} className="bg-[#2E1A47] border-[2px] border-[#F71B6A] px-3 py-1 text-xs font-bold text-[#F2F0EA]">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4 text-[#F2F0EA]/50 italic">Upload a resume to unlock salary prediction.</div>
          )}
        </div>

        {/* Panel 4: The Danger Room (Interview Chat) */}
        <div 
          className="comic-panel md:col-span-12 flex flex-col p-6 min-h-[400px]"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex justify-between items-end mb-4 border-b-[3px] border-[#0B0B0F] pb-2">
            <h2 className="text-2xl text-[#F5D90A]">THE DANGER ROOM</h2>
            <div className="flex gap-4">
              <Link href="/interview/replay/latest" className="text-xs uppercase font-bold text-[#F2F0EA] hover:text-[#F71B6A] hover:underline focus-visible:outline-none">
                View Last Replay
              </Link>
              <Link href="/simulator" className="text-xs uppercase font-bold text-[#F71B6A] hover:underline focus-visible:outline-none">
                Enter Full Simulator →
              </Link>
            </div>
          </div>
          <div className="flex-1 bg-[#0B0B0F]/20 border-[3px] border-[#0B0B0F] p-4 flex flex-col gap-6 overflow-y-auto mb-4">
            
            {/* AI Question */}
            <div className="flex justify-start">
              <div className="bg-[#2E1A47] border-[3px] border-[#0B0B0F] p-4 max-w-[80%] relative">
                <div className="absolute -left-2 top-4 w-4 h-4 bg-[#2E1A47] border-l-[3px] border-b-[3px] border-[#0B0B0F] transform rotate-45"></div>
                <p className="font-bold text-[#F71B6A] text-xs uppercase mb-1">INTERVIEWER_BOT</p>
                <p className="text-sm">I see on your resume that you improved performance by 30%. Could you walk me through the specific metrics you tracked and the bottleneck you identified?</p>
              </div>
            </div>

            {/* User Answer */}
            <div className="flex justify-end">
              <div className="flex flex-col items-end max-w-[80%]">
                <div className="bg-[#0B0B0F] border-[3px] border-[#F2F0EA] p-4 relative">
                  <div className="absolute -right-2 top-4 w-4 h-4 bg-[#0B0B0F] border-r-[3px] border-t-[3px] border-[#F2F0EA] transform rotate-45"></div>
                  <p className="font-bold text-[#F5D90A] text-xs uppercase mb-1">YOU</p>
                  <p className="text-sm text-[#F2F0EA]">Well, we noticed the load time was slow, so I implemented lazy loading for images and minified our CSS. That seemed to fix it mostly.</p>
                </div>
                {/* Feedback Verdict Strip */}
                <div className="mt-2 bg-[#F71B6A] text-[#0B0B0F] border-[3px] border-[#0B0B0F] p-2 text-xs font-bold uppercase rotate-[1deg] w-11/12 shadow-[2px_2px_0_#0B0B0F]">
                  ⚠️ VERDICT: Vague answer. Mention the specific profiling tool used (e.g., Lighthouse) and the initial vs final load times in seconds.
                </div>
              </div>
            </div>

          </div>

          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Type your response... (or use voice)" 
              className="flex-1 bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-3 text-sm focus:outline-none focus:border-[#F71B6A] text-[#F2F0EA] font-sans"
              aria-label="Interview response input"
            />
            <button className="btn-primary" aria-label="Send response">
              SEND
            </button>
          </div>
        </div>

        {/* Panel 5: Daily AI Challenge */}
        <div 
          className="comic-panel md:col-span-12 flex flex-col p-6"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex justify-between items-end mb-4 border-b-[3px] border-[#0B0B0F] pb-2">
            <h2 className="text-2xl text-[#22C55E]">DAILY AI CHALLENGE</h2>
            <span className="text-xs font-bold text-[#F2F0EA] uppercase tracking-widest bg-[#0B0B0F] px-2 py-1">Gamification Engine</span>
          </div>
          
          {challengeLoading ? (
            <div className="text-center p-4 text-[#22C55E] animate-pulse">Generating your custom challenge...</div>
          ) : challenge ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-[#F2F0EA]">{challenge.challenge_title}</h3>
                <span className={`text-xs font-bold px-2 py-1 uppercase ${challenge.difficulty === 'Hard' ? 'bg-[#F71B6A] text-[#0B0B0F]' : 'bg-[#F5D90A] text-[#0B0B0F]'}`}>
                  {challenge.difficulty}
                </span>
              </div>
              <div className="bg-[#0B0B0F] p-6 border-[3px] border-[#22C55E] shadow-[4px_4px_0_#0B0B0F]">
                <p className="text-lg text-[#F2F0EA]">{challenge.question}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm font-bold text-[#22C55E]">Hints:</span>
                {challenge.hints?.map((hint: string, i: number) => (
                  <span key={i} className="text-sm text-[#F2F0EA]/70 italic border-l-2 border-[#22C55E] pl-2">{hint}</span>
                ))}
              </div>
              <Link href="/simulator" className="btn-primary mt-4 self-start bg-[#22C55E] hover:bg-[#F2F0EA]">
                TEST ME IN DANGER ROOM
              </Link>
            </div>
          ) : (
             <div className="text-center p-4 text-[#F2F0EA]/50 italic">Upload a resume to unlock daily challenges.</div>
          )}
        </div>

        {/* Panel 6: What-If Simulator */}
        <div 
          className="comic-panel md:col-span-12 flex flex-col p-6"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex justify-between items-end mb-4 border-b-[3px] border-[#0B0B0F] pb-2">
            <h2 className="text-2xl text-[#F2F0EA]">WHAT-IF SIMULATOR</h2>
            <span className="text-xs font-bold text-[#F5D90A] uppercase tracking-widest bg-[#0B0B0F] px-2 py-1">AI Prediction Engine</span>
          </div>
          
          <form onSubmit={handleWhatIf} className="flex gap-4 mb-6">
            <input 
              type="text" 
              value={whatIfSkill}
              onChange={(e) => setWhatIfSkill(e.target.value)}
              placeholder="e.g. AWS Certified Solutions Architect, GraphQL, Master's Degree" 
              className="flex-1 bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-4 text-[#F2F0EA] font-sans focus:outline-none focus:border-[#F71B6A]"
              disabled={whatIfLoading}
            />
            <button type="submit" disabled={!whatIfSkill.trim() || whatIfLoading} className="btn-primary py-4 px-8 disabled:opacity-50">
              {whatIfLoading ? "SIMULATING..." : "SIMULATE"}
            </button>
          </form>

          {whatIfResult && (
            <div className="bg-[#2E1A47]/40 border-[3px] border-[#0B0B0F] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in">
              <div className="bg-[#0B0B0F] border-[3px] border-[#F71B6A] p-4 shadow-[4px_4px_0_#0B0B0F] flex flex-col justify-center text-center">
                <h3 className="text-xs uppercase font-bold text-[#F71B6A] mb-2">ATS Score Impact</h3>
                <div className="text-5xl font-bold text-[#F2F0EA]">+{whatIfResult.new_ats_score_increase}%</div>
              </div>
              <div className="bg-[#0B0B0F] border-[3px] border-[#F5D90A] p-4 shadow-[4px_4px_0_#0B0B0F] flex flex-col justify-center text-center">
                <h3 className="text-xs uppercase font-bold text-[#F5D90A] mb-2">Est. Salary Bump</h3>
                <div className="text-5xl font-bold text-[#F2F0EA] text-[#22C55E]">{whatIfResult.salary_bump_estimate}</div>
              </div>
              <div className="bg-[#0B0B0F]/50 border-[2px] border-[#0B0B0F] p-4">
                <h3 className="text-xs uppercase font-bold text-[#F2F0EA] mb-2">Roles Unlocked</h3>
                <ul className="text-sm text-[#F2F0EA] list-disc list-inside">
                  {whatIfResult.new_roles_unlocked?.map((role: string, i: number) => (
                    <li key={i}>{role}</li>
                  ))}
                </ul>
                <p className="mt-4 text-xs italic opacity-80 text-[#F2F0EA] leading-relaxed">
                  "{whatIfResult.simulation_summary}"
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

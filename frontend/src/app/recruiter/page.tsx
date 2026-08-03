"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function RecruiterPortalPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    // In a real app, this would fetch from a database table like `users` or `resumes`.
    // For this MVP, we will mock it using the locally saved resume versions as distinct candidates.
    const savedVersions = localStorage.getItem("heropath_resume_versions");
    if (savedVersions) {
      try {
        const versions = JSON.parse(savedVersions);
        // Map versions to mock "candidates"
        const mockCandidates = versions.map((v: any, i: number) => ({
          id: v.id || i,
          name: i === 0 ? "You (Current User)" : `Candidate 00${i}`,
          targetRole: v.targetRole || "Unknown",
          date: new Date(v.date).toLocaleDateString(),
          skills: v.data.skills || [],
          experience: v.data.experience_claims?.length || 0,
          atsScore: Math.floor(Math.random() * 30) + 70 // Mock ATS score for demo
        }));
        setCandidates(mockCandidates);
      } catch (e) {}
    } else {
      // Provide some dummy candidates if none exist locally
      setCandidates([
        { id: '1', name: 'Alice Smith', targetRole: 'Frontend Developer', date: '10/24/2023', skills: ['React', 'Next.js', 'CSS'], experience: 3, atsScore: 92 },
        { id: '2', name: 'Bob Jones', targetRole: 'Backend Engineer', date: '10/25/2023', skills: ['Node.js', 'PostgreSQL', 'AWS'], experience: 5, atsScore: 88 },
        { id: '3', name: 'Charlie Day', targetRole: 'Fullstack Dev', date: '10/26/2023', skills: ['React', 'Node.js', 'MongoDB'], experience: 2, atsScore: 75 },
      ]);
    }
  }, []);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.skills.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole ? c.targetRole.toLowerCase().includes(filterRole.toLowerCase()) : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 h-full max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl text-[#F2F0EA]" style={{ textShadow: '3px 3px 0 #0B0B0F' }}>
            RECRUITER COMMAND
          </h1>
          <p className="text-[#F71B6A] font-bold mt-2 uppercase tracking-widest">Candidate Discovery & Analytics</p>
        </div>
        <Link href="/" className="uppercase font-bold text-sm text-[#F2F0EA] hover:text-[#F71B6A] underline">
          ← Back to Main App
        </Link>
      </div>

      {/* Filters */}
      <div className="comic-panel p-6 mb-8 flex flex-col md:flex-row gap-4 bg-[#0B0B0F]/80">
        <div className="flex-1">
          <label className="text-xs uppercase font-bold text-[#F2F0EA] mb-2 block">Search by Name or Skill</label>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g. React, Node, Candidate Name..."
            className="w-full bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-3 text-[#F2F0EA] focus:border-[#F71B6A] focus:outline-none transition-colors"
          />
        </div>
        <div className="md:w-1/3">
          <label className="text-xs uppercase font-bold text-[#F2F0EA] mb-2 block">Filter by Target Role</label>
          <input 
            type="text" 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            placeholder="e.g. Frontend"
            className="w-full bg-[#0B0B0F] border-[3px] border-[#0B0B0F] p-3 text-[#F2F0EA] focus:border-[#F71B6A] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((candidate, idx) => (
          <div key={candidate.id} className="comic-panel p-6 flex flex-col hover:border-[#F5D90A] transition-colors cursor-pointer group" style={{ animationDelay: \`\${idx * 0.1}s\` }}>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#F2F0EA] group-hover:text-[#F5D90A] transition-colors">{candidate.name}</h3>
                <p className="text-sm font-bold text-[#F71B6A] uppercase tracking-wider">{candidate.targetRole}</p>
              </div>
              <div className="bg-[#0B0B0F] border-[2px] border-[#22C55E] p-2 text-center shadow-[2px_2px_0_#0B0B0F]">
                <div className="text-[10px] font-bold text-[#22C55E] uppercase leading-none mb-1">ATS Match</div>
                <div className="text-xl font-bold text-[#F2F0EA] leading-none">{candidate.atsScore}%</div>
              </div>
            </div>

            <div className="flex-1 mb-4">
              <h4 className="text-xs uppercase font-bold text-[#F2F0EA]/50 mb-2">Top Skills</h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.slice(0, 5).map((skill: string, i: number) => (
                  <span key={i} className="bg-[#2E1A47] border-[1px] border-[#F2F0EA]/20 px-2 py-1 text-xs text-[#F2F0EA]">{skill}</span>
                ))}
                {candidate.skills.length > 5 && (
                  <span className="px-2 py-1 text-xs text-[#F2F0EA]/50">+{candidate.skills.length - 5} more</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center border-t-[3px] border-[#0B0B0F] pt-4 mt-auto">
              <div className="text-xs text-[#F2F0EA]/50 uppercase font-bold">
                {candidate.experience} Claims Verified
              </div>
              <button className="text-xs font-bold uppercase text-[#F5D90A] hover:underline">
                View Full Profile →
              </button>
            </div>

          </div>
        ))}

        {filteredCandidates.length === 0 && (
          <div className="col-span-full comic-panel p-12 text-center bg-transparent border-dashed border-[#0B0B0F]">
            <p className="text-xl font-bold text-[#F2F0EA]/50 uppercase">No candidates match your filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}

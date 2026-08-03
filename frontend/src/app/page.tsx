import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 justify-center items-center h-full">
      <div 
        className="comic-panel w-full max-w-4xl flex flex-col items-center justify-center p-12 text-center"
        style={{ animationDelay: '0.1s', minHeight: '60vh' }}
      >
        <h1 className="text-5xl md:text-7xl mb-6 text-[#F2F0EA]" style={{ textShadow: '4px 4px 0 #0B0B0F' }}>
          TRAIN THE NEXT HERO
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-2xl text-[#F2F0EA] bg-[#0B0B0F]/50 p-4 border-[3px] border-[#0B0B0F]">
          Your personalized career mentor. Level up your skills, conquer interviews, and unlock your potential.
        </p>
        <Link href="/onboarding">
          <button className="btn-primary text-xl px-8 py-4 mb-4 w-full md:w-auto">
            Candidate Login
          </button>
        </Link>
        <Link href="/recruiter">
          <button className="bg-[#2E1A47] text-[#F2F0EA] border-[3px] border-[#0B0B0F] text-xl px-8 py-4 uppercase font-bold hover:bg-[#F5D90A] hover:text-[#0B0B0F] transition-colors shadow-[4px_4px_0_#0B0B0F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#0B0B0F] w-full md:w-auto">
            Recruiter Portal
          </button>
        </Link>
      </div>
    </div>
  );
}

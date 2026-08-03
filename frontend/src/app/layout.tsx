import "./globals.css";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HeroPath - Train the Next Hero",
  description: "AI career mentor app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b-[3px] border-[#0B0B0F] bg-[#2E1A47]">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="display-font text-xl text-[#F2F0EA] tracking-tight">
              HeroPath
            </div>
            <nav className="flex items-center gap-6 text-sm font-bold uppercase tracking-wider">
              <Link href="/" className="hover:text-[#F71B6A] transition-colors focus-visible:outline-none">HQ</Link>
              <Link href="/resume" className="hover:text-[#F71B6A] transition-colors focus-visible:outline-none">Upload</Link>
              <Link href="/simulator" className="hover:text-[#F71B6A] transition-colors focus-visible:outline-none">Simulator</Link>
              <Link href="/dashboard" className="hover:text-[#F71B6A] transition-colors focus-visible:outline-none">Dashboard</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}

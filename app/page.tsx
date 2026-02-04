"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0b1120] font-sans text-white">
      
      {/* --- HEADER (Nav Bar) --- */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0b1120]/80 backdrop-blur-md z-20 border-b border-white/10 fixed top-0 w-full">
        <span className="text-xl font-black text-[#eab308] italic tracking-tighter uppercase">
          LuckyBet
        </span>
        <div className="flex gap-4">
            <Link href="/login">
                <Button variant="ghost" className="text-stone-300 hover:text-white hover:bg-white/10">
                    Login
                </Button>
            </Link>
            <Link href="/signup">
                <Button size="sm" className="bg-[#eab308] hover:bg-[#ca8a04] text-black font-bold">
                    Sign Up
                </Button>
            </Link>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 text-center overflow-hidden min-h-screen">
        
        {/* VIDEO BACKGROUND */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 h-full w-full object-cover opacity-40 grayscale"
        >
          {/* MAKE SURE THIS FILE IS IN YOUR PUBLIC FOLDER */}
          <source src="/41795-431406988_medium.mp4" type="video/mp4" />
        </video>

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1120]/30 via-transparent to-[#0b1120]" />

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col items-center max-w-3xl">
          <h1 className="mb-4 text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl uppercase italic">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eab308] to-[#a16207]">
                100% Welcome Bonus
            </span>
          </h1>
          
          <p className="mb-8 text-stone-300 text-lg md:text-2xl font-medium drop-shadow-md max-w-xl">
            Join the premium online gaming experience. Up to <span className="text-white font-bold">$500</span> on your first deposit.
          </p>
          
          <Link href="/login">
            <Button size="lg" className="h-16 px-10 text-xl bg-[#eab308] hover:bg-[#ca8a04] text-black font-black rounded-full shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105 transition-transform">
              PLAY NOW
            </Button>
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="absolute bottom-0 w-full px-6 py-4 text-center text-[10px] uppercase tracking-widest text-stone-600 bg-[#0b1120] z-20">
        18+ | Gamble responsibly | LuckyBet Inc
      </footer>
    </main>
  );
}
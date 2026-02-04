import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      
      {/* --- HEADER (Nav Bar) --- */}
      {/* Keeping this separate ensures the video does not bleed into it */}
      <header className="flex items-center justify-between px-6 py-4 bg-background z-20 shadow-sm relative">
        <span className="text-lg font-bold text-primary">LuckyBet</span>
        {/* LINKED TO SIGNUP PAGE */} 
        <Link href="/signup">
            <Button size="sm">Sign Up</Button>
        </Link>
      </header>

      {/* --- HERO SECTION --- */}
      {/* Added 'relative' and 'overflow-hidden' to contain the video */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 text-center overflow-hidden">
        
        {/* VIDEO BACKGROUND */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 h-full w-full object-cover grayscale opacity-60"
        >
          
          <source 
            src="/41795-431406988_medium.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* DARK OVERLAY */}
        {/* This creates a dark tint so white text is readable over the video */}
        <div className="absolute inset-0 bg-black/50" />

        {/* CONTENT */}
        {/* Added 'relative z-10' to ensure text sits ON TOP of the video */}
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="mb-2 text-4xl font-bold text-white tracking-tight drop-shadow-md">
            100% Welcome Bonus
          </h1>
          <p className="mb-6 text-gray-200 text-lg drop-shadow-sm">
            Up to $500 on your first deposit
          </p>
          
          {/* LINKED TO LOGIN PAGE */}
          <Link href="/login">
            <Button size="lg" className="font-bold text-lg px-8 py-6">
              Play Now
            </Button>
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground bg-background z-20">
        18+ | Gamble responsibly
      </footer>
    </main>
  );
}
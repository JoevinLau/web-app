"use client";

import Link from "next/link";
import { Play, ChevronRight } from "lucide-react"; // Removed Dices
import { Button } from "@/components/ui/button";

export default function GamesPage() {
  const games = [
    {
      id: 1,
      name: "Blackjack",
      description: "Classic 21. Beat the dealer.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvNEIn5RR7y2eJV8uF2tIvAHL2uApnB9RN3aJ6iR82&s",
      link: "/Blackjack" 
    },
    {
      id: 2,
      name: "Glass Bridge",
      description: "50/50 Survival. Double your money or fall.",
      image: "", // Placeholder as requested
      link: "/Glassfloor" 
    },
    {
      id: 3,
      name: "Plinko",
      description: "Every peg is a decision. Every drop is fate. Win big or lose it all.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS40ff7k3qG5m_cIMwv0S254kJhlV7hAziuQ&s",
      link: "/Plinko" 
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
      
      {/* --- HEADER (MATCHING GAME THEME) --- */}
      <div className="h-14 bg-stone-950 px-4 flex justify-between items-center border-b border-stone-800 shadow-xl sticky top-0 z-50">
        
        {/* Left: Logo */}
        <div className="flex items-center justify-between px-6 py-4">
            <span className="text-lg font-bold text-primary">LuckyBet</span>
        </div>

        {/* Right: Wallet & Deposit */}
        {/* Removed unused wallet icon placeholder */}
      </div>

      {/* --- GAMES LIST SECTION --- */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* Section Title */}
        <div className="flex items-center gap-2 mb-8 border-b border-stone-800 pb-4">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white">Featured Games</h2>
          <ChevronRight className="h-6 w-6 text-yellow-500" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="group relative bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10"
            >
              {/* Photo Area */}
              <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                {game.image ? (
                    <img 
                      src={game.image} 
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                ) : (
                    // Placeholder block for missing image
                    <div className="w-full h-full flex items-center justify-center bg-stone-800 border-b border-stone-700">
                        <span className="text-stone-600 font-mono text-xs uppercase tracking-widest">[ Image Placeholder ]</span>
                    </div>
                )}
                
                {/* Overlay Play Button */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Link href={game.link}>
                    <Button size="lg" className="gap-2 font-bold rounded-full bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[4px] transition-all">
                      <Play className="h-5 w-5" />
                      Play Now
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Card Text Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold mb-1 text-white group-hover:text-yellow-400 transition-colors">{game.name}</h3>
                <p className="text-stone-400 text-sm font-medium">{game.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
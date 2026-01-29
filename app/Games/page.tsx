import Link from "next/link";
import { Wallet, Play, CreditCard, ChevronRight } from "lucide-react";
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
  id: 2, // New ID
  name: "Glass Bridge",
  description: "50/50 Survival. Double your money or fall.",
  image: "data:image/jpeg;base64,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", // Glass-themed image
  link: "/Glassfloor" 
    },
  ];

  return (

    <div className="min-h-screen bg-slate-950 text-foreground p-8 font-sans">
      
      {/* --- TOP BAR --- */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            LuckyBet
          </h1>
        </div>

        {/* Wallet Display */}
        <div className="mt-4 md:mt-0 flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 text-green-400">
            <Wallet className="h-5 w-5" />
            <span className="font-bold text-xl">$1,250.00</span>
          </div>
          
          {/* 2. REPLACED STANDARD BUTTON WITH YOUR APP'S BUTTON */}
          <Button variant="default" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Deposit
          </Button>
        </div>
      </header>

      {/* --- GAMES SECTION --- */}
      <main>
        <div className="flex items-center gap-2 mb-8">
          <h2 className="text-2xl font-semibold">Featured Games</h2>
          <ChevronRight className="h-6 w-6 text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <div 
              key={game.id} 
              className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10"
            >
              {/* Photo Area */}
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Link href={game.link}>
                    {/* 3. USING THE APP BUTTON COMPONENT HERE TOO */}
                    <Button size="lg" className="gap-2 font-bold rounded-full">
                      <Play className="h-5 w-5" />
                      Play Now
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Card Text Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{game.name}</h3>
                {/* Updated to text-muted-foreground to match homepage subtitle */}
                <p className="text-muted-foreground text-sm">{game.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
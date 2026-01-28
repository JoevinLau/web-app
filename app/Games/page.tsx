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
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, Play, ChevronRight, LogOut, X, CreditCard, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GamesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  // --- 1. CHECK LOGIN & FETCH BALANCE ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
        router.push("/Login");
        return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchBalance(parsedUser.id);
  }, []);

  async function fetchBalance(userId: number) {
      try {
          const res = await fetch('/api/wallet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, action: 'balance' })
          });
          const data = await res.json();
          if (data.balance !== undefined) setBalance(parseFloat(data.balance));
      } catch (err) {
          console.error("Failed to fetch balance");
      }
  }

  // --- 2. LOGOUT FUNCTION ---
  const handleLogout = () => {
      localStorage.removeItem("user"); // Clear data
      router.push("/"); // Redirect
  };

  // --- 3. WALLET FUNCTIONS ---
  async function handleTransaction(type: 'deposit' | 'withdraw') {
      if (type === 'deposit' && !depositAmount) return;

      const res = await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              userId: user.id, 
              action: type, 
              amount: type === 'deposit' ? depositAmount : 0 
          })
      });

      const data = await res.json();
      if (data.balance !== undefined) {
          setBalance(data.balance);
          alert(data.message);
          setDepositAmount("");
          if (type === 'withdraw') setIsWalletOpen(false); // Close on withdraw
      }
  }

  const games = [
    { id: 1, name: "Blackjack", description: "Classic 21. Beat the dealer.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvNEIn5RR7y2eJV8uF2tIvAHL2uApnB9RN3aJ6iR82&s", link: "/Blackjack" },
    { id: 2, name: "Glass Bridge", description: "50/50 Survival. Double your money or fall.", image: "", link: "/Glassfloor" },
    { id: 3, name: "Plinko", description: "Every peg is a decision. Every drop is fate.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS40ff7k3qG5m_cIMwv0S254kJhlV7hAziuQ&s", link: "/Plinko" }
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans relative">
      
      {/* --- HEADER --- */}
      <div className="h-14 bg-stone-950 px-4 flex justify-between items-center border-b border-stone-800 shadow-xl sticky top-0 z-40">
        <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-primary px-2">LuckyBet</span>
        </div>

        <div className="flex items-center gap-3">
            {/* Wallet Button */}
            <button 
                onClick={() => setIsWalletOpen(true)}
                className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border border-yellow-500/30 text-yellow-400 font-mono font-bold text-sm hover:bg-yellow-500/10 transition-colors"
            >
                <Wallet className="h-4 w-4" />
                <span>${balance.toFixed(2)}</span>
            </button>
            
            {/* Logout Button */}
            <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleLogout}
                className="text-stone-400 hover:text-red-400 hover:bg-red-500/10"
            >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
            </Button>
        </div>
      </div>

      {/* --- GAMES LIST --- */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto z-10">
        <div className="flex items-center gap-2 mb-8 border-b border-stone-800 pb-4">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white">Featured Games</h2>
          <ChevronRight className="h-6 w-6 text-yellow-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.id} className="group relative bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10">
              <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                {game.image ? (
                    <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-800 border-b border-stone-700">
                        <span className="text-stone-600 font-mono text-xs uppercase tracking-widest">[ Image Placeholder ]</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <Link href={game.link}>
                    <Button size="lg" className="gap-2 font-bold rounded-full bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[4px] transition-all">
                      <Play className="h-5 w-5" /> Play Now
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-1 text-white group-hover:text-yellow-400 transition-colors">{game.name}</h3>
                <p className="text-stone-400 text-sm font-medium">{game.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- WALLET MODAL (POPUP) --- */}
      {isWalletOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1a2333] border border-stone-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                  
                  {/* Close Button */}
                  <button onClick={() => setIsWalletOpen(false)} className="absolute top-4 right-4 text-stone-500 hover:text-white">
                      <X className="h-6 w-6" />
                  </button>

                  <h2 className="text-2xl font-black text-white mb-1 uppercase italic">My Wallet</h2>
                  <p className="text-stone-400 text-sm mb-6">Manage your funds securely</p>

                  <div className="bg-[#0f1728] rounded-xl p-4 mb-6 border border-stone-800 flex justify-between items-center">
                      <span className="text-stone-400 font-bold uppercase text-xs">Current Balance</span>
                      <span className="text-3xl font-mono font-bold text-yellow-400">${balance.toFixed(2)}</span>
                  </div>

                  <div className="space-y-4">
                      {/* DEPOSIT SECTION */}
                      <div className="p-4 bg-stone-900/50 rounded-xl border border-stone-800">
                          <label className="text-xs font-bold text-green-500 uppercase mb-2 block">Deposit Funds</label>
                          <div className="flex gap-2">
                              <input 
                                  type="number" 
                                  value={depositAmount} 
                                  onChange={(e) => setDepositAmount(e.target.value)}
                                  placeholder="Amount (e.g. 100)"
                                  className="w-full bg-black border border-stone-700 rounded-lg px-4 text-white font-mono focus:border-green-500 outline-none"
                              />
                              <Button onClick={() => handleTransaction('deposit')} className="bg-green-600 hover:bg-green-500 font-bold">
                                  <ArrowDownToLine className="h-4 w-4" />
                              </Button>
                          </div>
                      </div>

                      {/* WITHDRAW SECTION */}
                      <div className="p-4 bg-stone-900/50 rounded-xl border border-stone-800">
                          <label className="text-xs font-bold text-red-500 uppercase mb-2 block">Withdraw Funds</label>
                          <p className="text-stone-400 text-xs mb-3">Cash out your entire balance directly to your bank.</p>
                          <Button 
                              onClick={() => handleTransaction('withdraw')} 
                              disabled={balance <= 0}
                              className="w-full bg-stone-800 hover:bg-red-900/50 hover:text-red-400 hover:border-red-500 border border-transparent font-bold transition-all"
                          >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Withdraw All (${balance.toFixed(2)})
                          </Button>
                      </div>
                  </div>

              </div>
          </div>
      )}

    </div>
  );
}
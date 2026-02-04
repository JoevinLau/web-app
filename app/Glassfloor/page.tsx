"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Skull, Footprints, Wallet, X, ArrowDownToLine, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- CONFIGURATION ---
const TOTAL_STEPS = 9; 
const MULTIPLIER = 2; 
const CARD_WIDTH = 96; 
const GAP = 16;        
const STRIDE = CARD_WIDTH + GAP; 

export default function GlassGamePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Game State
  const [safePath, setSafePath] = useState<number[]>([]); 
  const [currentStep, setCurrentStep] = useState(0);
  const [gameState, setGameState] = useState<"betting" | "playing" | "gameover" | "cashed_out">("betting");
  const [userMoves, setUserMoves] = useState<(number | null)[]>(Array(TOTAL_STEPS).fill(null));
  
  // Wallet State
  const [balance, setBalance] = useState(0); 
  const [bet, setBet] = useState(10);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
        router.push("/login");
        return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    updateBalance(parsedUser.id);
  }, []);

  async function updateBalance(id: number) {
      const res = await fetch('/api/wallet', {
          method: 'POST',
          body: JSON.stringify({ userId: id, action: 'balance' })
      });
      const data = await res.json();
      if (data.balance !== undefined) setBalance(parseFloat(data.balance));
  }

  // --- 2. GAME ACTIONS (Linked to DB) ---
  const startGame = async () => {
    if (bet > balance) {
        alert("Insufficient funds! Please deposit money.");
        setIsWalletOpen(true);
        return;
    }

    // Call API to deduct bet
    const res = await fetch('/api/wallet', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, action: 'bet', amount: bet })
    });
    const data = await res.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    // Success: Update local state and start game
    setBalance(data.balance);
    
    // Generate Path
    const newPath = Array.from({ length: TOTAL_STEPS }, () => Math.random() < 0.5 ? 0 : 1);
    setSafePath(newPath);
    setCurrentStep(0);
    setUserMoves(Array(TOTAL_STEPS).fill(null));
    setGameState("playing");
  };

  const handleCashOut = async (stepsCompleted = currentStep) => {
    if (stepsCompleted === 0) return;
    const winnings = bet * Math.pow(MULTIPLIER, stepsCompleted);

    // Call API to add winnings
    const res = await fetch('/api/wallet', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, action: 'payout', amount: winnings })
    });
    const data = await res.json();
    
    if (data.balance !== undefined) setBalance(data.balance);
    setGameState("cashed_out");
  };

  const handleJump = (choice: number) => {
    const newMoves = [...userMoves];
    newMoves[currentStep] = choice;
    setUserMoves(newMoves);

    if (choice === safePath[currentStep]) {
      // WIN STEP
      if (currentStep + 1 >= TOTAL_STEPS) handleCashOut(currentStep + 1);
      else setCurrentStep((prev) => prev + 1);
    } else {
      // LOSE
      setGameState("gameover");
    }
  };

  const handleReset = () => {
      setGameState("betting");
      setCurrentStep(0); 
      setUserMoves(Array(TOTAL_STEPS).fill(null));
  };

  // --- 3. WALLET POPUP LOGIC ---
  async function handleTransaction(type: 'deposit' | 'withdraw') {
      if (type === 'deposit' && !depositAmount) return;
      const res = await fetch('/api/wallet', {
          method: 'POST',
          body: JSON.stringify({ userId: user.id, action: type, amount: depositAmount })
      });
      const data = await res.json();
      if (data.balance !== undefined) {
          setBalance(data.balance);
          alert(data.message);
          setDepositAmount("");
      }
  }

  const currentWinnings = currentStep > 0 ? bet * Math.pow(MULTIPLIER, currentStep) : 0;
  const potentialWin = bet * Math.pow(MULTIPLIER, currentStep + 1);

  // --- RENDER STEP COMPONENT ---
  const renderStep = (index: number) => {
    const isCurrentCol = index === currentStep && gameState === "playing";
    const isPast = index < currentStep;
    const showResult = gameState === "gameover" || gameState === "cashed_out" || isPast;
    
    const safeIsTop = safePath[index] === 0;
    const userChoseTop = userMoves[index] === 0;
    const userChoseBottom = userMoves[index] === 1;

    return (
        <div key={index} className={`flex flex-col gap-4 shrink-0 transition-opacity duration-500 ${index > currentStep ? "opacity-40" : "opacity-100"}`}>
            <div className={`text-center text-[10px] font-mono font-bold uppercase mb-1 ${index === currentStep ? "text-yellow-400" : "text-green-800/50"}`}>
                Step {index + 1}
            </div>

            {/* TOP BUTTON */}
            <button
                disabled={!isCurrentCol}
                onClick={() => handleJump(0)}
                className={`
                    w-24 h-24 rounded-xl border-4 flex items-center justify-center relative transition-all duration-300 shadow-xl
                    ${isCurrentCol ? "bg-blue-500/20 border-blue-400/50 hover:bg-blue-400/30 scale-105 shadow-blue-500/20 cursor-pointer animate-pulse" : "bg-black/20 border-black/10"}
                    ${showResult && safeIsTop ? "bg-green-500/20 border-green-500" : ""}
                    ${showResult && !safeIsTop ? "bg-red-500/10 border-transparent opacity-20" : ""}
                    ${gameState === "gameover" && index === currentStep && userChoseTop && !safeIsTop ? "bg-red-600 border-red-500 animate-shake" : ""}
                `}
            >
                {isCurrentCol && <span className="absolute -top-3 bg-blue-500 text-black text-[10px] font-bold px-2 rounded-full shadow-lg">JUMP</span>}
                {showResult && safeIsTop && <Footprints className="w-8 h-8 text-green-400 rotate-90" />}
                {gameState === "gameover" && index === currentStep && userChoseTop && !safeIsTop && <Skull className="w-8 h-8 text-white animate-bounce" />}
            </button>

            {/* BOTTOM BUTTON */}
            <button
                disabled={!isCurrentCol}
                onClick={() => handleJump(1)}
                className={`
                    w-24 h-24 rounded-xl border-4 flex items-center justify-center relative transition-all duration-300 shadow-xl
                    ${isCurrentCol ? "bg-blue-500/20 border-blue-400/50 hover:bg-blue-400/30 scale-105 shadow-blue-500/20 cursor-pointer animate-pulse" : "bg-black/20 border-black/10"}
                    ${showResult && !safeIsTop ? "bg-green-500/20 border-green-500" : ""}
                    ${showResult && safeIsTop ? "bg-red-500/10 border-transparent opacity-20" : ""}
                    ${gameState === "gameover" && index === currentStep && userChoseBottom && safeIsTop ? "bg-red-600 border-red-500 animate-shake" : ""}
                `}
            >
                {showResult && !safeIsTop && <Footprints className="w-8 h-8 text-green-400 rotate-90" />}
                {gameState === "gameover" && index === currentStep && userChoseBottom && safeIsTop && <Skull className="w-8 h-8 text-white animate-bounce" />}
            </button>

            <div className="text-center">
                <span className="text-[10px] font-mono text-green-900/70 font-bold bg-green-500/10 px-2 py-0.5 rounded">{Math.pow(MULTIPLIER, index + 1)}x</span>
            </div>
        </div>
    );
  };

  return (
    <div className="h-screen w-full bg-stone-900 flex flex-col font-sans overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="h-14 bg-stone-950 px-4 flex justify-between items-center border-b border-stone-800 shadow-xl z-20 shrink-0">
        <Link href="/Games">
          <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Lobby</span>
          </Button>
        </Link>
        <div className="text-yellow-500 font-bold tracking-widest text-sm uppercase">Glass Bridge</div>
        
        {/* Wallet Button */}
        <button 
            onClick={() => setIsWalletOpen(true)}
            className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-400 font-mono font-bold text-sm hover:bg-yellow-500/10 transition-colors"
        >
            <Wallet className="h-4 w-4" />
            <span>${balance.toFixed(2)}</span>
        </button>
      </div>

      {/* --- GAME BOARD --- */}
      <div className="flex-1 relative w-full bg-[#1a472a] shadow-inner flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none" />

        {/* MOBILE VIEW */}
        <div className="md:hidden relative z-10 w-full h-full flex items-center overflow-hidden">
           <div className="flex items-center transition-transform duration-500 ease-out" style={{ transform: `translateX(calc(50vw - ${CARD_WIDTH / 2}px - ${currentStep * STRIDE}px))` }}>
              <div className="w-12 h-64 border-r-4 border-dashed border-white/10 flex items-center justify-center mr-8"><span className="text-white/20 font-bold -rotate-90 text-xs tracking-widest">START</span></div>
              <div className="flex gap-4">{Array.from({ length: TOTAL_STEPS }).map((_, i) => renderStep(i))}</div>
              <div className="w-24 h-64 border-l-4 border-dashed border-yellow-500/30 bg-yellow-500/5 flex items-center justify-center ml-8 rounded-r-3xl"><span className="text-yellow-500 font-bold -rotate-90 text-sm tracking-widest animate-pulse">GOAL</span></div>
           </div>
        </div>

        {/* PC VIEW */}
        <div className="hidden md:flex relative z-10 w-full h-full items-center justify-center overflow-hidden">
           <div className="flex items-center gap-8">
              <div className="h-64 border-r-4 border-dashed border-white/10 flex items-center justify-center pr-4"><span className="text-white/20 font-bold -rotate-90 text-xs tracking-widest">START</span></div>
              <div className="flex gap-6">{Array.from({ length: TOTAL_STEPS }).map((_, i) => renderStep(i))}</div>
              <div className="h-64 border-l-4 border-dashed border-yellow-500/30 flex items-center justify-center pl-4 bg-yellow-500/5 rounded-r-2xl"><span className="text-yellow-500 font-bold -rotate-90 text-sm tracking-widest">GOAL</span></div>
           </div>
        </div>
      </div>

      {/* --- CONTROLS --- */}
      <div className="bg-stone-900/95 border-t border-stone-700 backdrop-blur-md p-4 pb-8 z-30">
        <div className="max-w-md mx-auto w-full">
            <div className="flex justify-between items-center mb-4 px-2">
               <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{gameState === "playing" ? "Potential Win" : "Result"}</div>
               <div className={`text-xl font-mono font-bold ${gameState === "gameover" ? "text-red-500" : "text-white"}`}>
                  {gameState === "playing" ? `$${potentialWin.toFixed(0)}` : gameState === "gameover" ? "CRASHED" : gameState === "cashed_out" ? `WON $${currentWinnings}` : "READY"}
               </div>
            </div>

            {gameState === "betting" ? (
               <div className="flex gap-2 h-12">
                  <div className="relative flex-1">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-bold">$</span>
                     <input type="number" value={bet} onChange={(e) => setBet(Number(e.target.value))} className="w-full h-full bg-black/40 border border-stone-600 rounded-lg pl-8 pr-4 text-white font-mono font-bold focus:border-yellow-500 outline-none text-lg"/>
                  </div>
                  <Button onClick={startGame} className="h-full bg-green-600 hover:bg-green-500 text-white font-black px-8 text-lg rounded-lg shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-[4px] transition-all">PLAY</Button>
               </div>
            ) : gameState === "playing" ? (
               <Button onClick={() => handleCashOut()} disabled={currentStep === 0} className="w-full h-14 text-lg font-black bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0">
                  {currentStep === 0 ? "JUMP TO START" : `TAKE $${currentWinnings.toFixed(0)}`}
               </Button>
            ) : (
               <Button onClick={handleReset} className="w-full h-14 text-lg font-black bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-[4px] transition-all animate-pulse">NEW ROUND</Button>
            )}
        </div>
      </div>

      {/* --- WALLET MODAL --- */}
      {isWalletOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1a2333] border border-stone-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                  <button onClick={() => setIsWalletOpen(false)} className="absolute top-4 right-4 text-stone-500 hover:text-white"><X className="h-6 w-6" /></button>
                  <h2 className="text-2xl font-black text-white mb-1 uppercase italic">My Wallet</h2>
                  <div className="bg-[#0f1728] rounded-xl p-4 mb-6 border border-stone-800 flex justify-between items-center">
                      <span className="text-stone-400 font-bold uppercase text-xs">Current Balance</span>
                      <span className="text-3xl font-mono font-bold text-yellow-400">${balance.toFixed(2)}</span>
                  </div>
                  <div className="space-y-4">
                      <div className="p-4 bg-stone-900/50 rounded-xl border border-stone-800">
                          <label className="text-xs font-bold text-green-500 uppercase mb-2 block">Deposit Funds</label>
                          <div className="flex gap-2">
                              <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Amount" className="w-full bg-black border border-stone-700 rounded-lg px-4 text-white font-mono focus:border-green-500 outline-none" />
                              <Button onClick={() => handleTransaction('deposit')} className="bg-green-600 hover:bg-green-500 font-bold"><ArrowDownToLine className="h-4 w-4" /></Button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
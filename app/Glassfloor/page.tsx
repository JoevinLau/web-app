"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, HandCoins, Skull, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- CONFIGURATION ---
const TOTAL_STEPS = 9; 
const MULTIPLIER = 2; 

export default function GlassGamePage() {
  // --- STATE ---
  const [safePath, setSafePath] = useState<number[]>([]); 
  const [currentStep, setCurrentStep] = useState(0);
  const [gameState, setGameState] = useState<"betting" | "playing" | "gameover" | "cashed_out">("betting");
  const [balance, setBalance] = useState(1000); 
  const [bet, setBet] = useState(10);
  
  // Track user moves: 0 = Top, 1 = Bottom
  const [userMoves, setUserMoves] = useState<(number | null)[]>(Array(TOTAL_STEPS).fill(null));

  // --- GAME LOGIC ---
  const startGame = () => {
    if (bet > balance) return alert("Not enough money!");
    
    // 0 = Top, 1 = Bottom
    const newPath = Array.from({ length: TOTAL_STEPS }, () => Math.random() < 0.5 ? 0 : 1);
    
    setBalance((prev) => prev - bet);
    setSafePath(newPath);
    setCurrentStep(0);
    setUserMoves(Array(TOTAL_STEPS).fill(null));
    setGameState("playing");
  };

  const handleJump = (choice: number) => {
    const newMoves = [...userMoves];
    newMoves[currentStep] = choice;
    setUserMoves(newMoves);

    if (choice === safePath[currentStep]) {
      // WIN
      if (currentStep + 1 >= TOTAL_STEPS) handleCashOut(currentStep + 1);
      else setCurrentStep((prev) => prev + 1);
    } else {
      // LOSE
      setGameState("gameover");
    }
  };

  const handleCashOut = (stepsCompleted = currentStep) => {
    if (stepsCompleted === 0) return;
    const winnings = bet * Math.pow(MULTIPLIER, stepsCompleted);
    setBalance((prev) => prev + winnings);
    setGameState("cashed_out");
  };

  const currentWinnings = currentStep > 0 ? bet * Math.pow(MULTIPLIER, currentStep) : 0;
  const potentialWin = bet * Math.pow(MULTIPLIER, currentStep + 1);

  return (
    <div className="h-screen w-full bg-stone-900 flex flex-col font-sans overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="h-14 bg-stone-950 px-4 flex justify-between items-center border-b border-stone-800 shadow-xl z-20 shrink-0">
        <Link href="/Games">
          <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white gap-2 pl-0 md:pl-4">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden md:inline">Lobby</span>
          </Button>
        </Link>
        <div className="text-yellow-500 font-bold tracking-widest text-sm uppercase hidden md:block">
          Glass Bridge • 2x Multiplier
        </div>
        <div className="flex items-center gap-3">
            <span className="text-stone-400 text-sm uppercase tracking-wider hidden sm:inline">Balance</span>
            <div className="bg-black/50 px-4 py-1 rounded-full border border-yellow-500/30 text-yellow-400 font-mono font-bold text-sm">
            ${balance.toFixed(0)}
            </div>
        </div>
      </div>

      {/* --- THE TABLE (Green Felt) --- */}
      {/* Changed p-8 to p-2 md:p-8 to save space on mobile */}
      <div className="flex-1 relative w-full bg-[#1a472a] shadow-inner flex flex-col items-center justify-center p-2 md:p-8 overflow-hidden">
        {/* Felt Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none" />

        {/* --- HORIZONTAL BRIDGE CONTAINER --- */}
        <div className="relative z-10 w-full max-w-6xl overflow-x-auto pb-4 no-scrollbar">
           
           {/* Step Labels (Top) */}
           <div className="flex gap-2 md:gap-4 mb-2 pl-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                 // Changed w-24 to w-16 md:w-24 to match button width
                 <div key={i} className={`w-16 md:w-24 text-center text-[10px] md:text-xs font-mono font-bold ${i === currentStep ? "text-yellow-400 animate-bounce" : "text-green-800"}`}>
                    Step {i + 1}
                 </div>
              ))}
           </div>

           {/* THE BRIDGE COLUMNS */}
           <div className="flex gap-2 md:gap-4 items-center pl-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
                 const isCurrentCol = index === currentStep && gameState === "playing";
                 const isPast = index < currentStep;
                 const showResult = gameState === "gameover" || gameState === "cashed_out" || isPast;
                 
                 const safeIsTop = safePath[index] === 0;
                 const userChoseTop = userMoves[index] === 0;
                 const userChoseBottom = userMoves[index] === 1;

                 return (
                    // Changed gap-4 to gap-2 md:gap-4 for tighter mobile layout
                    <div key={index} className={`flex flex-col gap-2 md:gap-4 shrink-0 transition-opacity duration-500 ${index > currentStep ? "opacity-40" : "opacity-100"}`}>
                       
                       {/* TOP OPTION (0) */}
                       <button
                          disabled={!isCurrentCol}
                          onClick={() => handleJump(0)}
                          className={`
                             /* RESPONSIVE SIZE: w-16 h-16 on mobile, w-24 h-24 on desktop */
                             w-16 h-16 md:w-24 md:h-24 
                             rounded-xl border-4 flex items-center justify-center relative transition-all duration-200
                             ${isCurrentCol 
                                ? "bg-blue-400/20 border-blue-400/50 hover:bg-blue-400/30 hover:-translate-y-1 shadow-lg cursor-pointer" 
                                : "bg-black/20 border-black/10"}
                             ${showResult && safeIsTop ? "bg-green-500/20 border-green-500" : ""}
                             ${showResult && !safeIsTop ? "bg-red-500/10 border-transparent opacity-30" : ""}
                             ${gameState === "gameover" && index === currentStep && userChoseTop && !safeIsTop ? "bg-red-600 border-red-500 animate-pulse" : ""}
                          `}
                       >
                          {/* Icons - Scaled down for mobile */}
                          {isCurrentCol && <div className="text-blue-200 text-[10px] md:text-xs font-bold uppercase">Top</div>}
                          {showResult && safeIsTop && <Footprints className="w-5 h-5 md:w-8 md:h-8 text-green-400 rotate-90" />}
                          {gameState === "gameover" && index === currentStep && userChoseTop && !safeIsTop && <Skull className="w-5 h-5 md:w-8 md:h-8 text-white" />}
                       </button>

                       {/* BOTTOM OPTION (1) */}
                       <button
                          disabled={!isCurrentCol}
                          onClick={() => handleJump(1)}
                          className={`
                             w-16 h-16 md:w-24 md:h-24
                             rounded-xl border-4 flex items-center justify-center relative transition-all duration-200
                             ${isCurrentCol 
                                ? "bg-blue-400/20 border-blue-400/50 hover:bg-blue-400/30 hover:translate-y-1 shadow-lg cursor-pointer" 
                                : "bg-black/20 border-black/10"}
                             ${showResult && !safeIsTop ? "bg-green-500/20 border-green-500" : ""}
                             ${showResult && safeIsTop ? "bg-red-500/10 border-transparent opacity-30" : ""}
                             ${gameState === "gameover" && index === currentStep && userChoseBottom && safeIsTop ? "bg-red-600 border-red-500 animate-pulse" : ""}
                          `}
                       >
                          {isCurrentCol && <div className="text-blue-200 text-[10px] md:text-xs font-bold uppercase">Bottom</div>}
                          {showResult && !safeIsTop && <Footprints className="w-5 h-5 md:w-8 md:h-8 text-green-400 rotate-90" />}
                          {gameState === "gameover" && index === currentStep && userChoseBottom && safeIsTop && <Skull className="w-5 h-5 md:w-8 md:h-8 text-white" />}
                       </button>

                       {/* Multiplier Tag */}
                       <div className="text-center">
                          <span className="text-[10px] md:text-xs font-mono text-green-900 font-bold bg-green-500/20 px-1 md:px-2 py-0.5 md:py-1 rounded">
                             {Math.pow(MULTIPLIER, index + 1)}x
                          </span>
                       </div>
                    </div>
                 );
              })}
              
              {/* FINISH LINE */}
              <div className="h-40 md:h-52 w-4 bg-yellow-500/20 border-l-2 border-dashed border-yellow-500/50 flex items-center justify-center">
                 <span className="text-yellow-500 font-bold -rotate-90 whitespace-nowrap tracking-widest text-[10px] md:text-xs">GOAL</span>
              </div>
           </div>
        </div>

      </div>

      {/* --- CONTROLS BAR (Bottom) --- */}
      <div className="bg-stone-900/95 border-t border-stone-700 backdrop-blur-md p-4 pb-6 md:pb-8 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 md:gap-8">
            
            {/* LEFT: STATUS TEXT (Hidden on mobile to save space) */}
            <div className="flex-1 hidden md:block">
               {gameState === "playing" ? (
                  <div>
                     <p className="text-stone-400 text-xs uppercase">Current Potential Win</p>
                     <p className="text-2xl font-mono text-white">${currentWinnings.toFixed(0)} <span className="text-stone-500 text-sm">→ Next: ${potentialWin.toFixed(0)}</span></p>
                  </div>
               ) : (
                  <div>
                     <p className="text-stone-400 text-xs uppercase">Game Status</p>
                     <p className={`text-xl font-bold ${gameState === "gameover" ? "text-red-500" : "text-white"}`}>
                        {gameState === "gameover" ? "CRASHED" : gameState === "cashed_out" ? "CASHED OUT" : "WAITING FOR BET"}
                     </p>
                  </div>
               )}
            </div>

            {/* MIDDLE: ACTION BUTTONS - Optimized for mobile */}
            <div className="flex-1 flex justify-center w-full">
               {gameState === "betting" ? (
                  <div className="flex items-center gap-2 md:gap-4 w-full max-w-md">
                     <div className="flex-1 flex items-center bg-black/40 rounded-lg border border-stone-600 px-3 py-2 md:px-4">
                        <span className="text-green-500 font-bold mr-2">$</span>
                        <input 
                           type="number" 
                           value={bet} 
                           onChange={(e) => setBet(Number(e.target.value))}
                           className="bg-transparent text-white font-mono text-lg md:text-xl w-full focus:outline-none"
                        />
                     </div>
                     <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 md:px-8">
                        <Play className="w-5 h-5 mr-0 md:mr-2" /> <span className="hidden md:inline">PLAY</span> <span className="md:hidden">GO</span>
                     </Button>
                  </div>
               ) : gameState === "playing" ? (
                  <Button 
                     onClick={() => handleCashOut()} 
                     disabled={currentStep === 0}
                     size="lg" 
                     className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold w-full max-w-xs"
                  >
                     <HandCoins className="w-5 h-5 mr-2" /> 
                     {currentStep === 0 ? "JUMP TO START" : `TAKE $${currentWinnings.toFixed(0)}`}
                  </Button>
               ) : (
                  <Button onClick={() => setGameState("betting")} size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full px-8 md:px-12 animate-pulse w-full md:w-auto">
                     NEW ROUND
                  </Button>
               )}
            </div>

            {/* RIGHT: SPACER */}
            <div className="flex-1 hidden md:block text-right"></div>
        </div>
      </div>

    </div>
  );
}
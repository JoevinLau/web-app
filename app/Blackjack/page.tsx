"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- TYPES ---
type Card = { suit: string; value: string; weight: number };
type GameState = "betting" | "playing" | "dealerTurn" | "gameOver";

// --- ASSETS (Chips) ---
const CHIPS = [
  { value: 10, color: "bg-blue-600 border-blue-400", label: "$10" },
  { value: 50, color: "bg-red-600 border-red-400", label: "$50" },
  { value: 100, color: "bg-green-600 border-green-400", label: "$100" },
  { value: 500, color: "bg-black border-stone-500", label: "$500" },
];

// --- GAME LOGIC HELPERS ---
const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

// Red striped background pattern
const RED_STRIPE_BG = "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 20px)";

const createDeck = () => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      let weight = parseInt(value);
      if (["J", "Q", "K"].includes(value)) weight = 10;
      if (value === "A") weight = 11;
      deck.push({ suit, value, weight });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const calculateScore = (hand: Card[]) => {
  let score = hand.reduce((acc, card) => acc + card.weight, 0);
  let aces = hand.filter((c) => c.value === "A").length;
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
};

export default function BlackjackPage() {
  // --- STATE ---
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameState>("betting");
  const [balance, setBalance] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);
  const [message, setMessage] = useState("");

  // --- ACTIONS ---

  const addToBet = (amount: number) => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      setCurrentBet(prev => prev + amount);
    }
  };

  const clearBet = () => {
    setBalance(prev => prev + currentBet);
    setCurrentBet(0);
  };

  // Wrapped in useCallback to satisfy linter dependencies if needed
  const handleGameOver = useCallback((pHand: Card[], dHand: Card[], bet: number, blackjack = false) => {
    const pScore = calculateScore(pHand);
    const dScore = calculateScore(dHand);
    setGameState("gameOver");

    if (blackjack) {
      setMessage("BLACKJACK! Pays 3:2");
      setBalance((prev) => prev + bet + (bet * 1.5));
    } else if (pScore > 21) {
      setMessage("BUST! Dealer Wins");
    } else if (dScore > 21) {
      setMessage("DEALER BUST! You Win");
      setBalance((prev) => prev + (bet * 2));
    } else if (pScore > dScore) {
      setMessage("YOU WIN!");
      setBalance((prev) => prev + (bet * 2));
    } else if (pScore < dScore) {
      setMessage("DEALER WINS");
    } else {
      setMessage("PUSH - Bet Returned");
      setBalance((prev) => prev + bet);
    }
  }, []);

  const handleDeal = () => {
    if (currentBet === 0) {
      setMessage("Please place a bet!");
      return;
    }

    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];

    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState("playing");
    setMessage("");

    if (calculateScore(pHand) === 21) {
       // Short wait so you can see your cards before winning
       setTimeout(() => {
          handleGameOver(pHand, dHand, currentBet, true);
       }, 600);
    }
  };

  const handleHit = () => {
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];
    setDeck(newDeck);
    setPlayerHand(newHand);
  };

  const handleStand = () => {
    setGameState("dealerTurn");
  };

  // Watch for Player Score
  useEffect(() => {
    if (gameState === "playing") {
        const score = calculateScore(playerHand);
        // Scenario A: BUST
        if (score > 21) {
            const timer = setTimeout(() => {
                setGameState("gameOver");
                setMessage("BUST! You went over 21.");
            }, 500);
            return () => clearTimeout(timer);
        }
        // Scenario B: AUTO-STAND ON 21
        if (score === 21 && playerHand.length > 2) {
            const timer = setTimeout(() => {
                setGameState("dealerTurn");
            }, 500); 
            return () => clearTimeout(timer);
        }
    }
  }, [playerHand, gameState]);

  // Dealer Logic
  useEffect(() => {
    if (gameState === "dealerTurn") {
      const dHand = [...dealerHand];
      const dDeck = [...deck];
      
      const playDealer = async () => {
        // Small pause before dealer starts drawing
        await new Promise((resolve) => setTimeout(resolve, 800)); 

        while (calculateScore(dHand) < 17) {
          // Pause between each card draw so it's not instant
          await new Promise((resolve) => setTimeout(resolve, 1000)); 
          dHand.push(dDeck.pop()!);
          setDealerHand([...dHand]);
        }
        
        await new Promise((resolve) => setTimeout(resolve, 500));
        setDeck(dDeck);
        handleGameOver(playerHand, dHand, currentBet);
      };
      playDealer();
    }
  }, [gameState]); // Removed the failing eslint-disable comment

  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setCurrentBet(0);
    setGameState("betting");
    setMessage("");
  };

  // HELPER: Get Color String
  const getCardColorStyle = (suit: string) => (suit === "♥" || suit === "♦" ? "#dc2626" : "black");

  // HELPER: Render Card Content
  const renderCardContent = (card: Card) => (
    <div className="relative w-full h-full flex flex-col justify-between p-2 font-bold" style={{ color: getCardColorStyle(card.suit) }}>
        <span className="text-lg self-start leading-none">{card.value}</span>
        <span className="text-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{card.suit}</span>
        <span className="text-lg self-end rotate-180 leading-none">{card.value}</span>
    </div>
  );

  return (
    <div className="h-screen w-full bg-stone-900 flex flex-col font-sans overflow-hidden">
      
      {/* --- TOP HEADER --- */}
      <div className="h-14 bg-stone-950 px-4 flex justify-between items-center border-b border-stone-800 shadow-xl z-20 shrink-0">
        <Link href="/Games">
          <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white gap-2">
            <ArrowLeft className="h-4 w-4" /> Lobby
          </Button>
        </Link>
        <div className="text-yellow-500 font-bold tracking-widest text-sm uppercase hidden md:block">
          Blackjack Pays 3 to 2
        </div>
        <div className="flex items-center gap-3">
            <span className="text-stone-400 text-sm uppercase tracking-wider">Balance</span>
            <div className="bg-black/50 px-4 py-1 rounded-full border border-yellow-500/30 text-yellow-400 font-mono font-bold">
            ${balance.toFixed(0)}
            </div>
        </div>
      </div>

      {/* --- THE TABLE --- */}
      <div className="flex-1 relative w-full bg-[#1a472a] shadow-inner overflow-hidden flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none" />

        {/* --- DEALER AREA --- */}
        <div className="flex-1 flex flex-col items-center justify-center pt-8 relative z-10">
          <div className="flex gap-4 transform scale-90 md:scale-100 transition-transform">
            {dealerHand.length === 0 && gameState === "betting" ? (
                <div className="w-20 h-28 border-2 border-white/10 rounded-lg bg-white/5" />
            ) : (
                dealerHand.map((card, i) => {
                    const isHoleCard = i === 0;
                    const isPlaying = gameState === "playing";
                    const showRedBack = isHoleCard && isPlaying;
                    
                    let cardClasses = "w-20 md:w-24 h-28 md:h-36 rounded-lg shadow-2xl flex items-center justify-center";
                    
                    if (showRedBack) {
                        cardClasses += ` bg-[#7f1d1d] border-[#fca5a5] border-2`;
                    } else {
                        cardClasses += " bg-white";
                    }

                    return (
                        <div 
                            key={i}
                            className={cardClasses}
                            style={showRedBack ? { backgroundImage: RED_STRIPE_BG } : {}}
                        >
                            {!showRedBack && renderCardContent(card)}
                        </div>
                    );
                })
            )}
          </div>
          
          {(gameState === "dealerTurn" || gameState === "gameOver") && (
             <div className="mt-2 text-green-100 font-bold text-sm bg-black/40 px-3 py-0.5 rounded-full animate-in fade-in zoom-in duration-500">
                Dealer: {calculateScore(dealerHand)}
             </div>
          )}
        </div>

        {/* --- CENTER MESSAGE --- */}
        <div className="h-10 flex items-center justify-center z-20">
            {message && (
                <div className="bg-black/60 text-white px-6 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-lg animate-in zoom-in duration-300">
                    <span className="font-bold tracking-wider">{message}</span>
                </div>
            )}
        </div>

        {/* --- PLAYER AREA --- */}
        <div className="flex-1 flex flex-col items-center justify-start relative z-10">
            <div className="flex gap-4 mb-4 transform scale-90 md:scale-100">
                {playerHand.map((card, i) => (
                    <div 
                        key={i} 
                        className="w-20 md:w-24 h-28 md:h-36 bg-white rounded-lg shadow-2xl flex flex-col justify-between p-2 relative"
                    >
                          {renderCardContent(card)}
                    </div>
                ))}
            </div>

            {playerHand.length > 0 && (
                <div className="mb-4 text-green-100 font-bold text-sm bg-black/40 px-3 py-0.5 rounded-full">
                    You: {calculateScore(playerHand)}
                </div>
            )}
        </div>

        {/* --- CONTROLS --- */}
        <div className="bg-stone-900/90 border-t border-stone-700 backdrop-blur-md p-4 pb-8 z-30">
            <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
                {gameState === "betting" ? (
                    <div className="flex flex-col items-center w-full gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-stone-400 text-sm font-bold uppercase">Current Bet</span>
                            <div className="text-3xl font-mono text-white border-b-2 border-yellow-500 min-w-[100px] text-center">${currentBet}</div>
                            {currentBet > 0 && (
                                <button onClick={clearBet} className="text-red-400 hover:text-red-300 transition"><Undo2 className="w-5 h-5" /></button>
                            )}
                        </div>
                        <div className="flex gap-3 md:gap-6">
                            {CHIPS.map((chip) => (
                                <button
                                    key={chip.value}
                                    onClick={() => addToBet(chip.value)}
                                    disabled={balance < chip.value}
                                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-dashed shadow-xl flex items-center justify-center transform active:scale-90 hover:-translate-y-1 transition-all ${chip.color} ${balance < chip.value ? "opacity-50 grayscale cursor-not-allowed" : "hover:shadow-yellow-500/20"}`}
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/10">
                                        <span className="text-white font-bold text-xs md:text-sm drop-shadow-md">{chip.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <Button onClick={handleDeal} disabled={currentBet === 0} size="lg" className="w-full md:w-64 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-lg rounded-full shadow-lg shadow-green-900/50 mt-2">DEAL CARDS</Button>
                    </div>
                ) : gameState === "gameOver" ? (
                    <Button onClick={resetGame} size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg rounded-full px-12 animate-pulse">PLACE NEW BET</Button>
                ) : (
                    <div className="flex gap-6 w-full max-w-md">
                        <Button onClick={handleHit} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white h-14 rounded-xl font-bold text-xl shadow-[0_4px_0_rgb(30,58,138)] active:shadow-none active:translate-y-[4px] transition-all">HIT</Button>
                        <Button onClick={handleStand} className="flex-1 bg-red-600 hover:bg-red-500 text-white h-14 rounded-xl font-bold text-xl shadow-[0_4px_0_rgb(153,27,27)] active:shadow-none active:translate-y-[4px] transition-all">STAND</Button>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
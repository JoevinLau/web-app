"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  val: number;
}

interface Peg {
  x: number;
  y: number;
}

// 15 Multipliers = 14 Rows
// 17 Multipliers = 16 Rows
const MULTIPLIERS = {
  low: [5.6, 2.1, 1.1, 1, 0.5, 1, 0.3, 0.5, 1, 0.3, 0.5, 1, 1.1, 2.1, 5.6],
  medium: [13, 3, 1.3, 0.7, 0.4, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.7, 1.3, 3, 13],
  high: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
};

const getSlotColor = (multiplier: number) => {
  if (multiplier >= 10) return "#ef4444"; // Red-500
  if (multiplier >= 3) return "#f97316";  // Orange-500
  if (multiplier >= 1) return "#eab308";  // Yellow-500
  return "#facc15";                       // Yellow-400
};

const PlinkoGame: React.FC = () => {
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [betAmount, setBetAmount] = useState(1);
  const [balance, setBalance] = useState(1000);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [pegs, setPegs] = useState<Peg[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);

  // Determine rows based on risk (Low/Med = 14, High = 16)
  const rows = risk === "high" ? 16 : 14;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const autoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Physics Refs
  const ballsRef = useRef<Ball[]>([]);
  const ballIdRef = useRef(0);
  const balanceRef = useRef(balance);
  const betRef = useRef(betAmount);

  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { betRef.current = betAmount; }, [betAmount]);

  // --- COMPACT DIMENSIONS ---
  const SPACING = 30; 
  const CANVAS_WIDTH = 650; 
  const CANVAS_HEIGHT = 60 + (rows * SPACING) + 50; 
  
  const PEG_RADIUS = 3;
  const BALL_RADIUS = 5.5; 
  const GRAVITY = 0.18;    
  const FRICTION = 0.98;
  const BOUNCE = 0.55;

  const multipliers = risk === "high" ? MULTIPLIERS.high : risk === "medium" ? MULTIPLIERS.medium : MULTIPLIERS.low;

  // 1. Generate Pegs
  useEffect(() => {
    const newPegs: Peg[] = [];
    const startY = 50; 
    
    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 3;
      const rowWidth = (pegsInRow - 1) * SPACING;
      const startX = (CANVAS_WIDTH - rowWidth) / 2;

      for (let col = 0; col < pegsInRow; col++) {
        newPegs.push({
          x: startX + col * SPACING,
          y: startY + row * SPACING,
        });
      }
    }
    setPegs(newPegs);
  }, [rows]);

  // 2. Drop Logic
  const dropBall = useCallback(() => {
    if (balanceRef.current < betRef.current) {
        setIsAutoRunning(false);
        return;
    }
    setBalance((prev) => prev - betRef.current);

    const dropX = CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 8;

    const newBall: Ball = {
      id: ballIdRef.current++,
      x: dropX,
      y: 20, 
      vx: (Math.random() - 0.5) * 1.5,
      vy: 0,
      active: true,
      val: betRef.current,
    };

    ballsRef.current = [...ballsRef.current, newBall];
  }, []);

  // 3. Auto Mode
  useEffect(() => {
    if (isAutoRunning && mode === "auto") {
        autoIntervalRef.current = setInterval(dropBall, 200);
    } else {
        if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    }
    return () => { if (autoIntervalRef.current) clearInterval(autoIntervalRef.current); };
  }, [isAutoRunning, mode, dropBall]);

  useEffect(() => setIsAutoRunning(false), [mode, risk]);

  // 4. Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Slot Y Position
    const slotY = 50 + (rows * SPACING) + 20; 

    const gameLoop = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Background (Dark Navy for the game board itself)
      ctx.fillStyle = "#0f1728"; 
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Pegs
      ctx.fillStyle = "white";
      pegs.forEach((peg) => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Multipliers
      const boxWidth = SPACING - 4;
      const boxHeight = 22;
      
      const bottomRowPegs = rows + 2; 
      const bottomRowWidth = (bottomRowPegs - 1) * SPACING;
      const startX = (CANVAS_WIDTH - bottomRowWidth) / 2;

      multipliers.forEach((mult, i) => {
        const x = startX + (i * SPACING) + (SPACING / 2);
        const y = slotY; 

        ctx.fillStyle = getSlotColor(mult);
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(x - boxWidth / 2, y, boxWidth, boxHeight, 4);
        } else {
            ctx.rect(x - boxWidth / 2, y, boxWidth, boxHeight);
        }
        ctx.fill();
        
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = "#000";
        ctx.font = "bold 9px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${mult}x`, x, y + boxHeight/2 + 1);
      });

      // Physics Update
      const updatedBalls = ballsRef.current.map((ball) => {
          if (!ball.active) return ball;
          let newBall = { ...ball };

          newBall.vy += GRAVITY;
          newBall.vx *= FRICTION;
          newBall.x += newBall.vx;
          newBall.y += newBall.vy;

          if (newBall.x < 0) { newBall.x = 0; newBall.vx *= -0.5; }
          if (newBall.x > CANVAS_WIDTH) { newBall.x = CANVAS_WIDTH; newBall.vx *= -0.5; }

          pegs.forEach((peg) => {
            const dx = newBall.x - peg.x;
            const dy = newBall.y - peg.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < BALL_RADIUS + PEG_RADIUS) {
              const angle = Math.atan2(dy, dx);
              const overlap = (BALL_RADIUS + PEG_RADIUS) - dist;
              newBall.x += Math.cos(angle) * overlap;
              newBall.y += Math.sin(angle) * overlap;

              const speed = Math.sqrt(newBall.vx**2 + newBall.vy**2);
              const bounceSpeed = speed * BOUNCE;
              const randomDeflection = (Math.random() - 0.5) * 1.5; 
              
              newBall.vx = Math.cos(angle + randomDeflection) * bounceSpeed + (Math.random() - 0.5);
              newBall.vy = Math.sin(angle) * bounceSpeed;
            }
          });

          if (newBall.y > slotY) {
             const relativeX = newBall.x - startX;
             const index = Math.floor(relativeX / SPACING);

             if (index >= 0 && index < multipliers.length) {
                 const win = newBall.val * multipliers[index];
                 setBalance(prev => prev + win);
                 setLastWin(win);
             }
             newBall.active = false;
          }
          
          if (newBall.y > CANVAS_HEIGHT) newBall.active = false;

          return newBall;
      }).filter(b => b.active);

      ballsRef.current = updatedBalls;

      // Draw Balls
      ballsRef.current.forEach((ball) => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24"; 
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ball.x - 1.5, ball.y - 1.5, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [pegs, multipliers, rows, CANVAS_HEIGHT]);

  return (
    <div className="h-screen w-full bg-[#0b1120] flex flex-col font-sans text-white overflow-hidden">
      
      {/* --- HEADER (MATCHING BLACKJACK THEME) --- */}
      <div className="h-14 bg-stone-950 px-4 flex justify-between items-center border-b border-stone-800 shadow-xl z-20 shrink-0">
        <Link href="/Games">
          <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white gap-2">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden md:inline">Lobby</span>
          </Button>
        </Link>
        <div className="text-yellow-500 font-bold tracking-widest text-sm uppercase hidden md:block">
          Plinko
        </div>
        <div className="flex items-center gap-3">
            <span className="text-stone-400 text-sm uppercase tracking-wider hidden sm:inline">Balance</span>
            <div className="bg-black/50 px-4 py-1 rounded-full border border-yellow-500/30 text-yellow-400 font-mono font-bold text-sm">
            ${balance.toFixed(2)}
            </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 overflow-hidden">
        
        <div className="flex flex-col-reverse lg:flex-row gap-4 w-full max-w-5xl items-stretch h-full lg:h-auto max-h-[90vh]">
          
          {/* LEFT PANEL: CONTROLS */}
          <Card className="lg:w-72 p-4 bg-[#1a2333] border-none shadow-xl flex flex-col gap-4 rounded-xl shrink-0 overflow-y-auto">
              
              {/* Mode */}
              <div className="bg-[#0f1728] p-1 rounded-full border border-gray-800">
                  <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as any)} className="w-full">
                      <ToggleGroupItem value="manual" className="flex-1 rounded-full h-8 text-xs data-[state=on]:bg-[#22c55e] data-[state=on]:text-black text-gray-400 font-bold transition-all">Manual</ToggleGroupItem>
                      <ToggleGroupItem value="auto" className="flex-1 rounded-full h-8 text-xs data-[state=on]:bg-[#22c55e] data-[state=on]:text-black text-gray-400 font-bold transition-all">Auto</ToggleGroupItem>
                  </ToggleGroup>
              </div>

              {/* Bet Input */}
              <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bet Amount</label>
                  <div className="flex gap-1">
                      <div className="relative flex-1">
                          <input 
                              type="number"
                              min={1}
                              value={betAmount}
                              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                              className="w-full bg-[#0f1728] border border-gray-700 rounded-md py-2 pl-3 pr-2 font-bold text-white text-sm focus:border-[#22c55e] focus:outline-none transition-colors"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#22c55e] font-black text-xs pointer-events-none">$</span>
                      </div>
                      <Button variant="outline" onClick={() => setBetAmount(b => Math.max(1, b/2))} className="bg-[#2f3b52] border-none text-white hover:bg-[#3f4b62] h-9 px-2 text-xs font-bold">½</Button>
                      <Button variant="outline" onClick={() => setBetAmount(b => b*2)} className="bg-[#2f3b52] border-none text-white hover:bg-[#3f4b62] h-9 px-2 text-xs font-bold">2×</Button>
                  </div>
              </div>

              {/* Risk Select */}
              <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Risk Level</label>
                  <ToggleGroup type="single" value={risk} onValueChange={(v) => v && setRisk(v as any)} className="w-full gap-1">
                      <ToggleGroupItem value="low" className="flex-1 h-8 text-xs bg-[#2f3b52] data-[state=on]:bg-[#22c55e] data-[state=on]:text-black text-white font-bold rounded-md transition-all">Low</ToggleGroupItem>
                      <ToggleGroupItem value="medium" className="flex-1 h-8 text-xs bg-[#2f3b52] data-[state=on]:bg-[#eab308] data-[state=on]:text-black text-white font-bold rounded-md transition-all">Med</ToggleGroupItem>
                      <ToggleGroupItem value="high" className="flex-1 h-8 text-xs bg-[#2f3b52] data-[state=on]:bg-[#ef4444] data-[state=on]:text-white text-white font-bold rounded-md transition-all">High</ToggleGroupItem>
                  </ToggleGroup>
              </div>

              {/* Action Button */}
              {mode === 'manual' ? (
                  <Button 
                      onClick={dropBall} 
                      disabled={balance < betAmount}
                      className="w-full h-12 text-lg font-black bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-[2px] transition-all rounded-md mt-2"
                  >
                      BET
                  </Button>
              ) : (
                  <Button 
                      onClick={() => setIsAutoRunning(!isAutoRunning)}
                      className={`w-full h-12 text-lg font-black shadow-[0_4px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[2px] transition-all rounded-md mt-2 text-black ${
                          isAutoRunning 
                          ? "bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[0_4px_0_rgb(185,28,28)]" 
                          : "bg-[#22c55e] hover:bg-[#16a34a] shadow-[0_4px_0_rgb(21,128,61)]"
                      }`}
                  >
                      {isAutoRunning ? "STOP AUTO" : "START AUTO"}
                  </Button>
              )}

              {/* Stats */}
              <div className="space-y-1 pt-2 border-t border-gray-800">
                   {lastWin !== null && (
                      <div className="flex justify-between items-center text-xs animate-in fade-in slide-in-from-top-1">
                          <span className="text-gray-400 font-bold">Last Win</span>
                          <span className={`font-mono font-bold text-sm ${lastWin > 0 ? "text-[#eab308]" : "text-gray-500"}`}>
                              ${lastWin.toFixed(2)}
                          </span>
                      </div>
                   )}
              </div>
          </Card>

          {/* RIGHT PANEL: GAME BOARD */}
          <Card className="flex-1 bg-[#1a2333] border-none shadow-xl p-2 flex justify-center items-center overflow-hidden rounded-xl">
              <div className="w-full flex justify-center overflow-x-auto overflow-y-hidden">
                  <canvas
                      ref={canvasRef}
                      width={CANVAS_WIDTH}
                      height={CANVAS_HEIGHT}
                      className="max-w-full h-auto rounded-lg"
                      style={{ maxHeight: '70vh' }}
                  />
              </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default PlinkoGame;
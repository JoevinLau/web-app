"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// --- TYPES ---
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

interface FloatText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  alpha: number;
}

// 14 ROWS for ALL MODES
const MULTIPLIERS = {
  low: [5.6, 2.1, 1.1, 1, 0.5, 1, 0.3, 0.5, 1, 0.3, 0.5, 1, 1.1, 2.1, 5.6],
  medium: [13, 3, 1.3, 0.7, 0.4, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.7, 1.3, 3, 13],
  high: [110, 25, 12, 6, 3, 1.5, 0.5, 0.2, 0.5, 1.5, 3, 6, 12, 25, 110],
};

const getSlotColor = (multiplier: number) => {
  if (multiplier >= 10) return "#ef4444"; // Red
  if (multiplier >= 3) return "#f97316";  // Orange
  if (multiplier >= 1) return "#eab308";  // Yellow
  return "#facc15";                       // Light Yellow
};

const PlinkoGame: React.FC = () => {
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [betAmount, setBetAmount] = useState(1);
  const [balance, setBalance] = useState(1000);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [pegs, setPegs] = useState<Peg[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);

  // Fixed 14 rows
  const rows = 14;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const autoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const ballsRef = useRef<Ball[]>([]);
  const floatsRef = useRef<FloatText[]>([]);
  const ballIdRef = useRef(0);
  const floatIdRef = useRef(0);
  
  const balanceRef = useRef(balance);
  const betRef = useRef(betAmount);

  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { betRef.current = betAmount; }, [betAmount]);

  // --- PC-OPTIMIZED DIMENSIONS ---
  // We keep these large so PC looks crisp. Mobile will scale this down via CSS.
  const SPACING = 40; 
  const CANVAS_WIDTH = 800; 
  const CANVAS_HEIGHT = 60 + (rows * SPACING) + 60; 
  
  const PEG_RADIUS = 4;
  const BALL_RADIUS = 7; 
  const GRAVITY = 0.25;    
  const FRICTION = 0.98;
  const BOUNCE = 0.6;

  const multipliers = risk === "high" ? MULTIPLIERS.high : risk === "medium" ? MULTIPLIERS.medium : MULTIPLIERS.low;

  // 1. Generate Pegs
  useEffect(() => {
    const newPegs: Peg[] = [];
    const startY = 60; 
    
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

    const dropX = CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 10;

    const newBall: Ball = {
      id: ballIdRef.current++,
      x: dropX,
      y: 20, 
      vx: (Math.random() - 0.5) * 2,
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

    const slotY = 60 + (rows * SPACING) + 20; 

    const gameLoop = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
      const boxWidth = SPACING - 6;
      const boxHeight = 28;
      const bottomRowPegs = rows + 2; 
      const bottomRowWidth = (bottomRowPegs - 1) * SPACING;
      const startX = (CANVAS_WIDTH - bottomRowWidth) / 2;

      multipliers.forEach((mult, i) => {
        const x = startX + (i * SPACING) + (SPACING / 2);
        const y = slotY; 

        ctx.fillStyle = getSlotColor(mult);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x - boxWidth / 2, y, boxWidth, boxHeight, 4);
        else ctx.rect(x - boxWidth / 2, y, boxWidth, boxHeight);
        ctx.fill();
        
        ctx.fillStyle = "#000";
        ctx.font = "bold 13px Arial"; // Slightly larger font for visibility when scaled down
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${mult}x`, x, y + boxHeight/2 + 1);
      });

      // Physics
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
                 const multiplier = multipliers[index];
                 const win = newBall.val * multiplier;
                 setBalance(prev => prev + win);
                 setLastWin(win);
                 floatsRef.current.push({
                    id: floatIdRef.current++,
                    x: newBall.x,
                    y: newBall.y - 20,
                    text: `+$${win.toFixed(2)}`,
                    color: win >= newBall.val ? "#22c55e" : "#ef4444",
                    life: 1.0,
                    alpha: 1
                 });
             }
             newBall.active = false;
          }
          if (newBall.y > CANVAS_HEIGHT) newBall.active = false;
          return newBall;
      }).filter(b => b.active);

      ballsRef.current = updatedBalls;

      ballsRef.current.forEach((ball) => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#fbbf24"; 
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ball.x - 2, ball.y - 2, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fill();
      });

      const updatedFloats = floatsRef.current.map(f => {
          f.y -= 1;
          f.life -= 0.02;
          f.alpha = Math.max(0, f.life);
          ctx.save();
          ctx.globalAlpha = f.alpha;
          ctx.fillStyle = f.color;
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.shadowColor = "black";
          ctx.shadowBlur = 3;
          ctx.fillText(f.text, f.x, f.y);
          ctx.restore();
          return f;
      }).filter(f => f.life > 0);
      floatsRef.current = updatedFloats;

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [pegs, multipliers, rows, CANVAS_HEIGHT]);

  return (
    <div className="h-screen w-full bg-[#0b1120] flex flex-col font-sans text-white overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="h-14 bg-stone-950 px-4 flex justify-between items-center border-b border-stone-800 shadow-xl z-20 shrink-0">
        <Link href="/Games">
          <Button variant="ghost" size="sm" className="text-stone-400 hover:text-white gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Lobby</span>
          </Button>
        </Link>
        <div className="text-yellow-500 font-bold tracking-widest text-sm uppercase">
          Plinko
        </div>
        <div className="bg-black/50 px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-400 font-mono font-bold text-sm">
           ${balance.toFixed(2)}
        </div>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden">
        
        {/* ========================================================= */}
        {/* PC SIDEBAR (HIDDEN ON MOBILE) */}
        {/* ========================================================= */}
        <div className="hidden lg:flex w-80 bg-[#1a2333] border-r border-stone-800 p-6 flex-col gap-6 z-10 shrink-0 overflow-y-auto">
            <div className="pb-4 border-b border-stone-800">
                <h2 className="text-xl font-black text-white tracking-wide">CONTROLS</h2>
            </div>

            {/* Mode & Stats */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Game Mode</label>
                <div className="bg-[#0f1728] p-1 rounded-lg border border-stone-800">
                    <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as any)} className="w-full">
                        <ToggleGroupItem value="manual" className="flex-1 h-9 text-xs data-[state=on]:bg-[#22c55e] data-[state=on]:text-black text-stone-400 font-bold transition-all">Manual</ToggleGroupItem>
                        <ToggleGroupItem value="auto" className="flex-1 h-9 text-xs data-[state=on]:bg-[#22c55e] data-[state=on]:text-black text-stone-400 font-bold transition-all">Auto</ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>

            {/* Bet Input */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Bet Amount</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="number" min={1} value={betAmount}
                            onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-[#0f1728] border border-stone-700 rounded-md h-11 pl-8 pr-2 font-bold text-white text-sm focus:border-[#22c55e] outline-none transition-colors"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#22c55e] font-black text-sm">$</span>
                    </div>
                    <Button variant="outline" onClick={() => setBetAmount(b => Math.max(1, b/2))} className="bg-[#2f3b52] border-none text-white hover:bg-[#3f4b62] h-11 w-11 p-0 text-xs font-bold rounded-md">½</Button>
                    <Button variant="outline" onClick={() => setBetAmount(b => b*2)} className="bg-[#2f3b52] border-none text-white hover:bg-[#3f4b62] h-11 w-11 p-0 text-xs font-bold rounded-md">2×</Button>
                </div>
            </div>

            {/* Risk Select */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Risk Level</label>
                <ToggleGroup type="single" value={risk} onValueChange={(v) => v && setRisk(v as any)} className="w-full gap-2">
                    <ToggleGroupItem value="low" className="flex-1 h-10 text-xs bg-[#2f3b52] data-[state=on]:bg-[#22c55e] data-[state=on]:text-black text-white font-bold rounded-md transition-all">Low</ToggleGroupItem>
                    <ToggleGroupItem value="medium" className="flex-1 h-10 text-xs bg-[#2f3b52] data-[state=on]:bg-[#eab308] data-[state=on]:text-black text-white font-bold rounded-md transition-all">Med</ToggleGroupItem>
                    <ToggleGroupItem value="high" className="flex-1 h-10 text-xs bg-[#2f3b52] data-[state=on]:bg-[#ef4444] data-[state=on]:text-white text-white font-bold rounded-md transition-all">High</ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* Play Button */}
            <div className="mt-2">
                {mode === 'manual' ? (
                    <Button onClick={dropBall} disabled={balance < betAmount} className="w-full h-14 text-lg font-black bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-[4px] transition-all rounded-lg">
                        BET
                    </Button>
                ) : (
                    <Button onClick={() => setIsAutoRunning(!isAutoRunning)} className={`w-full h-14 text-lg font-black shadow-[0_4px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[4px] transition-all rounded-lg text-black ${isAutoRunning ? "bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-[0_4px_0_rgb(185,28,28)]" : "bg-[#22c55e] hover:bg-[#16a34a] shadow-[0_4px_0_rgb(21,128,61)]"}`}>
                        {isAutoRunning ? "STOP AUTO" : "START AUTO"}
                    </Button>
                )}
            </div>

            {/* Last Win */}
            <div className="bg-[#0f1728] p-4 rounded-lg border border-stone-800 flex justify-between items-center mt-auto">
                <span className="text-xs font-bold text-stone-500 uppercase">Last Win</span>
                <span className={`font-mono font-bold text-xl ${lastWin && lastWin > 0 ? "text-yellow-400" : "text-stone-600"}`}>
                    {lastWin ? `$${lastWin.toFixed(2)}` : "-"}
                </span>
            </div>
        </div>

        {/* ========================================================= */}
        {/* GAME BOARD (Shared Area) */}
        {/* ========================================================= */}
        <div className="flex-1 bg-[#0f1728] flex items-center justify-center p-2 lg:p-4 overflow-hidden relative">
            <div className="w-full h-full flex justify-center items-center">
                {/* CANVAS SCALING:
                   - Native Resolution: 800px (High Quality)
                   - CSS Width: w-full (Shrinks to fit container)
                   - CSS Height: h-auto (Maintains aspect ratio)
                   - Max Width: 800px (Doesn't explode on massive screens)
                */}
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="w-full h-auto max-w-[800px] object-contain drop-shadow-2xl rounded-xl"
                />
            </div>
        </div>

        {/* ========================================================= */}
        {/* MOBILE CONTROLS (HIDDEN ON PC) */}
        {/* ========================================================= */}
        <div className="lg:hidden bg-[#1a2333] border-t border-stone-800 p-4 pb-8 z-30 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
            
            {/* Row 1: Last Win & Mode */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 bg-[#0f1728] px-3 py-1.5 rounded-md border border-stone-800">
                    <span className="text-[10px] text-stone-400 font-bold uppercase">Win</span>
                    <span className={`text-sm font-bold ${lastWin && lastWin > 0 ? "text-yellow-400" : "text-stone-600"}`}>
                        {lastWin ? `$${lastWin.toFixed(2)}` : "-"}
                    </span>
                </div>
                <div className="flex bg-[#0f1728] rounded-md p-0.5 border border-stone-800">
                    <button onClick={() => setMode("manual")} className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${mode === "manual" ? "bg-[#22c55e] text-black" : "text-stone-500"}`}>MANUAL</button>
                    <button onClick={() => setMode("auto")} className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${mode === "auto" ? "bg-[#22c55e] text-black" : "text-stone-500"}`}>AUTO</button>
                </div>
            </div>

            {/* Row 2: Inputs */}
            <div className="flex gap-2 mb-3">
                <div className="flex-1 relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[#22c55e] font-bold text-xs">$</div>
                    <input 
                        type="number" value={betAmount} onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#0f1728] border border-stone-700 rounded-md h-10 pl-6 pr-2 font-bold text-white text-sm focus:border-[#22c55e] outline-none"
                    />
                </div>
                <button onClick={() => setBetAmount(b => Math.max(1, b/2))} className="bg-[#2f3b52] border border-stone-700 text-stone-300 h-10 w-10 rounded-md font-bold text-xs">½</button>
                <button onClick={() => setBetAmount(b => b*2)} className="bg-[#2f3b52] border border-stone-700 text-stone-300 h-10 w-10 rounded-md font-bold text-xs">2×</button>
            </div>

            {/* Row 3: Risk & Play */}
            <div className="flex gap-2">
                <div className="flex-[2] bg-[#0f1728] border border-stone-700 rounded-md p-1 flex">
                    {(["low", "medium", "high"] as const).map((r) => (
                        <button key={r} onClick={() => setRisk(r)} className={`flex-1 rounded text-[10px] font-bold uppercase transition-all ${risk === r ? (r === "high" ? "bg-red-600 text-white" : r === "medium" ? "bg-yellow-500 text-black" : "bg-green-600 text-white") : "text-stone-500"}`}>{r}</button>
                    ))}
                </div>
                <div className="flex-1">
                    {mode === 'manual' ? (
                        <button onClick={dropBall} disabled={balance < betAmount} className="w-full h-10 bg-[#22c55e] hover:bg-[#16a34a] text-black font-black rounded-md shadow-[0_3px_0_rgb(21,128,61)] active:translate-y-[3px] active:shadow-none transition-all">BET</button>
                    ) : (
                        <button onClick={() => setIsAutoRunning(!isAutoRunning)} className={`w-full h-10 font-black rounded-md shadow-[0_3px_0_rgba(0,0,0,0.3)] active:translate-y-[3px] active:shadow-none transition-all ${isAutoRunning ? "bg-red-600 text-white shadow-[0_3px_0_rgb(185,28,28)]" : "bg-blue-600 text-white shadow-[0_3px_0_rgb(37,99,235)]"}`}>{isAutoRunning ? "STOP" : "START"}</button>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PlinkoGame;
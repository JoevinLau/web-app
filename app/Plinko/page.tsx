"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

interface Peg {
  x: number;
  y: number;
}

const MULTIPLIERS = {
  low: [5.6, 2.1, 1.1, 1, 0.5, 1, 0.3, 0.5, 1, 0.3, 0.5, 1, 1.1, 2.1, 5.6],
  medium: [13, 3, 1.3, 0.7, 0.4, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.7, 1.3, 3, 13],
  high: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
};

const getSlotColor = (multiplier: number) => {
  if (multiplier >= 50) return "hsl(0, 85%, 45%)";
  if (multiplier >= 10) return "hsl(0, 80%, 50%)";
  if (multiplier >= 5) return "hsl(15, 85%, 50%)";
  if (multiplier >= 2) return "hsl(30, 85%, 50%)";
  if (multiplier >= 1) return "hsl(45, 85%, 55%)";
  return "hsl(55, 85%, 55%)";
};

const PlinkoGame: React.FC = () => {
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [rows, setRows] = useState(14);
  const [betAmount, setBetAmount] = useState(1);
  const [balance, setBalance] = useState(1000);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [pegs, setPegs] = useState<Peg[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // 🔑 IMPORTANT: store balls in a ref (NOT state) to avoid infinite re-render loops
  const ballsRef = useRef<Ball[]>([]);
  const ballIdRef = useRef(0);

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 500;
  const PEG_RADIUS = 4;
  const BALL_RADIUS = 8;
  const GRAVITY = 0.15;
  const BOUNCE = 0.7;
  const FRICTION = 0.99;

  const multipliers =
    risk === "high" ? MULTIPLIERS.high : risk === "medium" ? MULTIPLIERS.medium : MULTIPLIERS.low;

  // Generate pegs based on rows
  useEffect(() => {
    const newPegs: Peg[] = [];
    const startY = 60;
    const endY = CANVAS_HEIGHT - 80;
    const rowHeight = (endY - startY) / rows;

    for (let row = 0; row < rows; row++) {
      const pegsInRow = row + 3;
      const rowWidth = (pegsInRow - 1) * 35;
      const startX = (CANVAS_WIDTH - rowWidth) / 2;

      for (let col = 0; col < pegsInRow; col++) {
        newPegs.push({
          x: startX + col * 35,
          y: startY + row * rowHeight,
        });
      }
    }
    setPegs(newPegs);
  }, [rows]);

  const dropBall = useCallback(() => {
    if (balance < betAmount) return;

    setBalance((prev) => prev - betAmount);

    const newBall: Ball = {
      id: ballIdRef.current++,
      x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 20,
      y: 20,
      vx: (Math.random() - 0.5) * 2,
      vy: 0,
      active: true,
    };

    ballsRef.current = [...ballsRef.current, newBall];
  }, [balance, betAmount]);

  // Game loop (draw + physics). No setState for balls here.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const slotWidth = CANVAS_WIDTH / (multipliers.length + 2);
    const slotY = CANVAS_HEIGHT - 40;

    const gameLoop = () => {
      // Clear
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, "hsl(240, 20%, 12%)");
      gradient.addColorStop(1, "hsl(240, 25%, 8%)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Pegs
      pegs.forEach((peg) => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, PEG_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "hsl(0, 0%, 95%)";
        ctx.fill();
        ctx.shadowColor = "hsl(0, 0%, 100%)";
        ctx.shadowBlur = 3;
      });
      ctx.shadowBlur = 0;

      // Multiplier slots
      multipliers.forEach((mult, i) => {
        const x = slotWidth + i * slotWidth;
        ctx.fillStyle = getSlotColor(mult);
        ctx.beginPath();
        // @ts-ignore - roundRect exists in modern browsers
        ctx.roundRect(x - slotWidth / 2 + 2, slotY, slotWidth - 4, 35, 5);
        ctx.fill();

        ctx.fillStyle = "hsl(0, 0%, 100%)";
        ctx.font = "bold 11px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${mult}x`, x, slotY + 22);
      });

      // --- Physics update ---
      const updatedBalls = ballsRef.current
        .map((ball) => {
          if (!ball.active) return ball;

          let newBall = { ...ball };

          // Gravity + friction
          newBall.vy += GRAVITY;
          newBall.vx *= FRICTION;

          // Move
          newBall.x += newBall.vx;
          newBall.y += newBall.vy;

          // Peg collisions
          pegs.forEach((peg) => {
            const dx = newBall.x - peg.x;
            const dy = newBall.y - peg.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < BALL_RADIUS + PEG_RADIUS) {
              const angle = Math.atan2(dy, dx);
              const speed = Math.sqrt(newBall.vx * newBall.vx + newBall.vy * newBall.vy);

              newBall.x = peg.x + Math.cos(angle) * (BALL_RADIUS + PEG_RADIUS + 1);
              newBall.y = peg.y + Math.sin(angle) * (BALL_RADIUS + PEG_RADIUS + 1);

              const bounceAngle = angle + (Math.random() - 0.5) * 0.5;
              newBall.vx = Math.cos(bounceAngle) * speed * BOUNCE;
              newBall.vy = Math.sin(bounceAngle) * speed * BOUNCE;
            }
          });

          // Wall collisions
          if (newBall.x < BALL_RADIUS) {
            newBall.x = BALL_RADIUS;
            newBall.vx *= -BOUNCE;
          }
          if (newBall.x > CANVAS_WIDTH - BALL_RADIUS) {
            newBall.x = CANVAS_WIDTH - BALL_RADIUS;
            newBall.vx *= -BOUNCE;
          }

          // Bottom (payout)
          if (newBall.y > slotY - BALL_RADIUS) {
            const slotIndex = Math.floor((newBall.x - slotWidth) / slotWidth);
            const clampedIndex = Math.max(0, Math.min(multipliers.length - 1, slotIndex));
            const winAmount = betAmount * multipliers[clampedIndex];

            setBalance((prev) => prev + winAmount);
            setLastWin(winAmount);
            newBall.active = false;
          }

          return newBall;
        })
        // Keep active balls, and keep inactive only briefly if you want (here: remove inactive immediately)
        .filter((b) => b.active && b.y < CANVAS_HEIGHT);

      ballsRef.current = updatedBalls;

      // --- Draw balls ---
      ballsRef.current.forEach((ball) => {
        const ballGradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, BALL_RADIUS);
        ballGradient.addColorStop(0, "hsl(210, 100%, 70%)");
        ballGradient.addColorStop(1, "hsl(210, 100%, 50%)");

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = ballGradient;
        ctx.shadowColor = "hsl(210, 100%, 60%)";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [pegs, multipliers, betAmount]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-center mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent tracking-wider">
          PLINKO
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Control Panel */}
          <Card className="lg:w-72 p-5 bg-slate-800/90 border-slate-700 backdrop-blur">
            <div className="space-y-5">
              {/* Manual/Auto Toggle */}
              <div>
                <ToggleGroup
                  type="single"
                  value={mode}
                  onValueChange={(v: string | null) => v && setMode(v as "manual" | "auto")}
                  className="w-full"
                >
                  <ToggleGroupItem value="manual" className="flex-1 data-[state=on]:bg-green-600 data-[state=on]:text-white">
                    Manual
                  </ToggleGroupItem>
                  <ToggleGroupItem value="auto" className="flex-1 data-[state=on]:bg-green-600 data-[state=on]:text-white">
                    Auto
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Risk Level */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Risk</label>
                <ToggleGroup
                  type="single"
                  value={risk}
                  onValueChange={(v: string | null) => v && setRisk(v as "low" | "medium" | "high")}
                  className="w-full"
                >
                  <ToggleGroupItem value="low" className="flex-1 text-xs data-[state=on]:bg-emerald-600 data-[state=on]:text-white">
                    Low
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" className="flex-1 text-xs data-[state=on]:bg-yellow-600 data-[state=on]:text-white">
                    Medium
                  </ToggleGroupItem>
                  <ToggleGroupItem value="high" className="flex-1 text-xs data-[state=on]:bg-red-600 data-[state=on]:text-white">
                    High
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Rows */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Rows: {rows}</label>
                <Slider value={[rows]} onValueChange={(v: number[]) => setRows(v[0])} min={8} max={16} step={1} className="w-full" />
              </div>

              {/* Bet Amount */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Bet Amount</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount((prev) => Math.max(1, prev / 2))}
                    className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                  >
                    ½
                  </Button>
                  <div className="flex-1 bg-slate-700 rounded-md px-3 py-2 text-center font-bold text-green-400">
                    ${betAmount.toFixed(2)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount((prev) => Math.min(balance, prev * 2))}
                    className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                  >
                    2×
                  </Button>
                </div>
              </div>

              {/* Bet Button */}
              <Button
                onClick={dropBall}
                disabled={balance < betAmount}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
              >
                BET
              </Button>

              {/* Last Win */}
              {lastWin !== null && (
                <div className="text-center py-2 rounded-md bg-slate-700/50">
                  <span className="text-sm text-slate-400">Last Win: </span>
                  <span className={`font-bold ${lastWin >= betAmount ? "text-green-400" : "text-red-400"}`}>
                    ${lastWin.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Balance */}
              <div className="pt-4 border-t border-slate-700">
                <div className="text-sm text-slate-400">Balance</div>
                <div className="text-2xl font-bold text-green-400">${balance.toFixed(2)}</div>
              </div>
            </div>
          </Card>

          {/* Game Board */}
          <Card className="flex-1 p-4 bg-slate-800/90 border-slate-700 backdrop-blur overflow-hidden">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full h-auto rounded-lg"
              style={{ maxWidth: CANVAS_WIDTH }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlinkoGame;

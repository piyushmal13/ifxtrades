"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Pure CSS/Canvas 3D trading robot — no three.js required
// Renders a sleek institutional algo-bot with live data streams

interface TradingRobot3DProps {
  className?: string;
}

export function TradingRobot3D({ className = "" }: TradingRobot3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Data streams
    const streams: { x: number; y: number; speed: number; chars: string[]; length: number; opacity: number }[] = [];
    const streamChars = "01|$€¥£AUDUSD+-.%BUY SELL FX".split("");
    for (let i = 0; i < 18; i++) {
      streams.push({
        x: Math.random() * 400,
        y: Math.random() * 600 - 300,
        speed: 0.8 + Math.random() * 1.4,
        chars: Array.from({ length: 8 + Math.floor(Math.random() * 10) }, () =>
          streamChars[Math.floor(Math.random() * streamChars.length)]
        ),
        length: 8 + Math.floor(Math.random() * 10),
        opacity: 0.15 + Math.random() * 0.25,
      });
    }

    // Particle system for robot glow
    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = [];
    const spawnParticle = (cx: number, cy: number) => {
      particles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.5 - Math.random() * 1.2,
        life: 0,
        maxLife: 60 + Math.random() * 60,
        size: 1 + Math.random() * 2,
      });
    };

    // Chart sparkline data
    const chartData: number[] = [];
    for (let i = 0; i < 40; i++) {
      const prev = chartData[i - 1] ?? 0.5;
      chartData.push(Math.max(0.05, Math.min(0.95, prev + (Math.random() - 0.48) * 0.12)));
    }

    const draw = (timestamp: number) => {
      const W = canvas.width / window.devicePixelRatio;
      const H = canvas.height / window.devicePixelRatio;
      const t = timestamp * 0.001;
      timeRef.current = t;

      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2 - 20;

      // ─── Background orbital rings ────────────────────────────────
      for (let ring = 0; ring < 3; ring++) {
        const r = 100 + ring * 50;
        const rotOffset = t * (0.2 + ring * 0.08) * (ring % 2 === 0 ? 1 : -1);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotOffset);
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.3, 0, 0, Math.PI * 2);
        const ringAlpha = 0.06 - ring * 0.015;
        ctx.strokeStyle = `rgba(201,168,76,${ringAlpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Orbiting dot
        const dotX = Math.cos(rotOffset * 3 + ring) * r;
        const dotY = Math.sin(rotOffset * 3 + ring) * r * 0.3;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${0.4 - ring * 0.1})`;
        ctx.fill();
        ctx.restore();
      }

      // ─── Data streams (matrix-style) ────────────────────────────
      ctx.font = "bold 9px 'JetBrains Mono', 'Fira Code', monospace";
      streams.forEach((stream) => {
        stream.y += stream.speed * 0.5;
        if (stream.y > H + 200) stream.y = -200;

        stream.chars.forEach((char, i) => {
          const alpha = stream.opacity * (1 - i / stream.length);
          const isGold = i === 0;
          ctx.fillStyle = isGold ? `rgba(201,168,76,${alpha * 1.5})` : `rgba(201,168,76,${alpha * 0.4})`;
          ctx.fillText(char, stream.x, stream.y - i * 12);
        });
      });

      // ─── Robot body ──────────────────────────────────────────────
      const bobY = Math.sin(t * 0.8) * 6;
      const tiltX = Math.sin(t * 0.5) * 0.06;

      ctx.save();
      ctx.translate(cx, cy + bobY);
      ctx.rotate(tiltX);

      // Outer glow
      const outerGlow = ctx.createRadialGradient(0, 0, 40, 0, 0, 140);
      outerGlow.addColorStop(0, "rgba(201,168,76,0.08)");
      outerGlow.addColorStop(1, "rgba(201,168,76,0)");
      ctx.beginPath();
      ctx.arc(0, 0, 140, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // ── Torso ────────────────────────────────────────────────────
      const torsoGrad = ctx.createLinearGradient(-38, -50, 38, 50);
      torsoGrad.addColorStop(0, "rgba(17,25,39,0.95)");
      torsoGrad.addColorStop(0.5, "rgba(13,20,33,0.98)");
      torsoGrad.addColorStop(1, "rgba(8,12,20,0.95)");

      roundRect(ctx, -38, -50, 76, 100, 12);
      ctx.fillStyle = torsoGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(201,168,76,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Torso inner glow edge
      const torsoInner = ctx.createLinearGradient(-38, -50, -38, 50);
      torsoInner.addColorStop(0, "rgba(201,168,76,0.12)");
      torsoInner.addColorStop(0.5, "rgba(201,168,76,0)");
      torsoInner.addColorStop(1, "rgba(201,168,76,0.04)");
      roundRect(ctx, -36, -48, 74, 96, 11);
      ctx.fillStyle = torsoInner;
      ctx.fill();

      // ── Mini chart on torso ──────────────────────────────────────
      const chartW = 52;
      const chartH = 28;
      const chartX = -chartW / 2;
      const chartY = -8;

      // Chart bg
      roundRect(ctx, chartX - 2, chartY - 2, chartW + 4, chartH + 4, 4);
      ctx.fillStyle = "rgba(8,12,20,0.8)";
      ctx.fill();
      ctx.strokeStyle = "rgba(201,168,76,0.2)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Chart line
      ctx.beginPath();
      chartData.forEach((val, i) => {
        const px = chartX + (i / (chartData.length - 1)) * chartW;
        const py = chartY + chartH - val * chartH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = "rgba(201,168,76,0.9)";
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.stroke();

      // Chart fill
      ctx.lineTo(chartX + chartW, chartY + chartH);
      ctx.lineTo(chartX, chartY + chartH);
      ctx.closePath();
      const chartFill = ctx.createLinearGradient(0, chartY, 0, chartY + chartH);
      chartFill.addColorStop(0, "rgba(201,168,76,0.15)");
      chartFill.addColorStop(1, "rgba(201,168,76,0)");
      ctx.fillStyle = chartFill;
      ctx.fill();

      // ── Torso indicators ─────────────────────────────────────────
      const indicators = [
        { x: -22, y: -38, color: "#22c55e", label: "BUY" },
        { x: 8, y: -38, color: "#ef4444", label: "SL" },
        { x: 18, y: -38, color: "#c9a84c", label: "TP" },
      ];

      ctx.font = "bold 6px 'JetBrains Mono', monospace";
      indicators.forEach((ind) => {
        // Dot
        ctx.beginPath();
        ctx.arc(ind.x, ind.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = ind.color;
        ctx.shadowColor = ind.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fillText(ind.label, ind.x - 4, ind.y + 12);
      });

      // ── Neck ─────────────────────────────────────────────────────
      roundRect(ctx, -10, -60, 20, 14, 4);
      const neckGrad = ctx.createLinearGradient(-10, -60, 10, -46);
      neckGrad.addColorStop(0, "rgba(13,20,33,0.9)");
      neckGrad.addColorStop(1, "rgba(17,25,39,0.9)");
      ctx.fillStyle = neckGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(201,168,76,0.2)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // ── Head ─────────────────────────────────────────────────────
      const headGrad = ctx.createLinearGradient(-36, -120, 36, -62);
      headGrad.addColorStop(0, "rgba(20,28,44,0.98)");
      headGrad.addColorStop(1, "rgba(10,16,28,0.95)");

      roundRect(ctx, -36, -120, 72, 58, 14);
      ctx.fillStyle = headGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(201,168,76,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Head top highlight
      const headHighlight = ctx.createLinearGradient(-36, -120, 36, -105);
      headHighlight.addColorStop(0, "rgba(201,168,76,0.12)");
      headHighlight.addColorStop(1, "rgba(201,168,76,0)");
      roundRect(ctx, -34, -118, 68, 20, 12);
      ctx.fillStyle = headHighlight;
      ctx.fill();

      // ── Eyes ─────────────────────────────────────────────────────
      const eyePulse = 0.7 + Math.sin(t * 2.5) * 0.3;
      const eyeColor = `rgba(201,168,76,${eyePulse})`;

      [-15, 15].forEach((ex) => {
        // Eye socket
        roundRect(ctx, ex - 11, -103, 22, 14, 5);
        ctx.fillStyle = "rgba(4,8,16,0.9)";
        ctx.fill();
        ctx.strokeStyle = `rgba(201,168,76,0.3)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Eye glow
        const eyeGlow = ctx.createRadialGradient(ex, -96, 1, ex, -96, 9);
        eyeGlow.addColorStop(0, eyeColor);
        eyeGlow.addColorStop(0.4, `rgba(201,168,76,${eyePulse * 0.5})`);
        eyeGlow.addColorStop(1, "rgba(201,168,76,0)");
        ctx.beginPath();
        ctx.arc(ex, -96, 9, 0, Math.PI * 2);
        ctx.fillStyle = eyeGlow;
        ctx.fill();

        // Eye pupil scan line
        const scanY = -100 + ((t * 30) % 8);
        ctx.beginPath();
        ctx.moveTo(ex - 8, scanY);
        ctx.lineTo(ex + 8, scanY);
        ctx.strokeStyle = `rgba(201,168,76,${eyePulse * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // ── Mouth / Status bar ───────────────────────────────────────
      roundRect(ctx, -20, -75, 40, 6, 3);
      ctx.fillStyle = "rgba(4,8,16,0.9)";
      ctx.fill();

      const mouthProgress = (Math.sin(t * 1.5) + 1) / 2;
      roundRect(ctx, -20, -75, 40 * mouthProgress, 6, 3);
      ctx.fillStyle = `rgba(201,168,76,0.7)`;
      ctx.fill();

      // ── Antenna ──────────────────────────────────────────────────
      ctx.beginPath();
      ctx.moveTo(0, -120);
      ctx.lineTo(0, -140);
      ctx.strokeStyle = "rgba(201,168,76,0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const antennaPulse = 0.5 + Math.sin(t * 4) * 0.5;
      const antennaGlow = ctx.createRadialGradient(0, -142, 0, 0, -142, 10);
      antennaGlow.addColorStop(0, `rgba(201,168,76,${antennaPulse})`);
      antennaGlow.addColorStop(1, "rgba(201,168,76,0)");
      ctx.beginPath();
      ctx.arc(0, -142, 10, 0, Math.PI * 2);
      ctx.fillStyle = antennaGlow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, -142, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${antennaPulse})`;
      ctx.shadowColor = "#c9a84c";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Arms ─────────────────────────────────────────────────────
      const armSwing = Math.sin(t * 0.8) * 0.15;

      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * 38, -30);
        ctx.rotate(armSwing * side);

        // Upper arm
        roundRect(ctx, side > 0 ? 0 : -14, -10, 14, 40, 5);
        ctx.fillStyle = "rgba(13,20,33,0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(201,168,76,0.25)";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Elbow joint
        ctx.beginPath();
        ctx.arc(side > 0 ? 7 : -7, 32, 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(17,25,39,0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(201,168,76,0.3)";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Lower arm (angled)
        ctx.save();
        ctx.translate(side > 0 ? 7 : -7, 32);
        ctx.rotate(side * 0.3 + armSwing * side * 0.5);
        roundRect(ctx, -5, 0, 10, 35, 4);
        ctx.fillStyle = "rgba(13,20,33,0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(201,168,76,0.2)";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Hand glow
        const handGlow = ctx.createRadialGradient(0, 38, 0, 0, 38, 10);
        handGlow.addColorStop(0, "rgba(201,168,76,0.2)");
        handGlow.addColorStop(1, "rgba(201,168,76,0)");
        ctx.beginPath();
        ctx.arc(0, 38, 10, 0, Math.PI * 2);
        ctx.fillStyle = handGlow;
        ctx.fill();

        ctx.restore();
        ctx.restore();
      });

      // ── Legs ─────────────────────────────────────────────────────
      const legStep = Math.sin(t * 0.8) * 4;

      [-1, 1].forEach((side) => {
        const legY = side > 0 ? -legStep : legStep;

        // Thigh
        roundRect(ctx, side * 22 - 9, 50 + legY, 18, 30, 5);
        ctx.fillStyle = "rgba(13,20,33,0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(201,168,76,0.2)";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Shin
        roundRect(ctx, side * 22 - 8, 82 + legY, 16, 28, 4);
        ctx.fillStyle = "rgba(10,16,26,0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(201,168,76,0.15)";
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Foot
        roundRect(ctx, side * 22 - 12, 110 + legY, 22, 10, 4);
        ctx.fillStyle = "rgba(17,25,39,0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(201,168,76,0.25)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      ctx.restore();

      // ─── Floating data labels ────────────────────────────────────
      const labels = [
        { x: cx - 130, y: cy - 60 + bobY, text: "ALGO", sub: "ACTIVE", color: "#22c55e" },
        { x: cx + 90, y: cy - 80 + bobY, text: "WIN%", sub: "94.2%", color: "#c9a84c" },
        { x: cx - 140, y: cy + 20 + bobY, text: "RISK", sub: "0.5%", color: "#3b82f6" },
        { x: cx + 100, y: cy + 40 + bobY, text: "DD", sub: "<2%", color: "#f59e0b" },
      ];

      labels.forEach((label, i) => {
        const floatOffset = Math.sin(t * 0.6 + i * 1.5) * 4;
        const lx = label.x;
        const ly = label.y + floatOffset;

        // Connector line to robot
        ctx.beginPath();
        ctx.moveTo(cx + (lx < cx ? -40 : 40), cy + bobY);
        ctx.lineTo(lx + (lx < cx ? 30 : -30), ly);
        ctx.strokeStyle = `rgba(201,168,76,0.1)`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label box
        roundRect(ctx, lx - 28, ly - 16, 56, 30, 6);
        ctx.fillStyle = "rgba(8,12,20,0.85)";
        ctx.fill();
        ctx.strokeStyle = `${label.color}40`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "bold 8px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.textAlign = "center";
        ctx.fillText(label.text, lx, ly - 3);

        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.fillStyle = label.color;
        ctx.fillText(label.sub, lx, ly + 10);
        ctx.textAlign = "left";
      });

      // ─── Particles ───────────────────────────────────────────────
      if (Math.random() < 0.3) spawnParticle(cx, cy - 20 + bobY);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = (1 - p.life / p.maxLife) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${alpha})`;
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Ambient glow behind robot */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)",
        }}
      />

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "crisp-edges" }}
      />

      {/* Status badges overlaid */}
      <motion.div
        className="absolute bottom-6 left-1/2 flex gap-3"
        style={{ transform: "translateX(-50%)" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        {[
          { label: "Neural Active", color: "#22c55e" },
          { label: "Signal: LIVE", color: "#c9a84c" },
          { label: "Latency: 8ms", color: "#3b82f6" },
        ].map((badge) => (
          <div
            key={badge.label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(8,12,20,0.85)",
              border: `1px solid ${badge.color}30`,
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: badge.color,
                boxShadow: `0 0 6px ${badge.color}`,
                animation: "pulse 2s infinite",
              }}
            />
            <span
              className="text-[8px] font-bold uppercase tracking-widest"
              style={{ color: badge.color }}
            >
              {badge.label}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Helper: rounded rectangle path
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

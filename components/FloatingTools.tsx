"use client";
import { useEffect, useRef } from "react";

type Item = {
  type: string; x: number; y: number;
  vx: number; vy: number; rot: number; vr: number;
  scale: number; alpha: number; teeth: number;
  col: string; mass: number;
};

const ORANGE = "rgba(232,93,38,";
const WHITE  = "rgba(240,237,232,";

function drawGear(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, teeth: number, rot: number, alpha: number, scale: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
  const ir = r * 0.65, tr = r * 1.28, tw = 0.18;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const a1 = a - tw, a2 = a + tw, a3 = a + Math.PI / teeth - tw, a4 = a + Math.PI / teeth + tw;
    ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
    ctx.lineTo(Math.cos(a1) * tr, Math.sin(a1) * tr);
    ctx.lineTo(Math.cos(a2) * tr, Math.sin(a2) * tr);
    ctx.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
    ctx.lineTo(Math.cos(a3) * r, Math.sin(a3) * r);
    ctx.lineTo(Math.cos(a4) * r, Math.sin(a4) * r);
  }
  ctx.closePath();
  ctx.strokeStyle = ORANGE + "0.85)"; ctx.lineWidth = 1.5 / scale; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, ir, 0, Math.PI * 2);
  ctx.strokeStyle = ORANGE + "0.4)"; ctx.lineWidth = 1 / scale; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = ORANGE + "0.7)"; ctx.fill();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r * 0.22, Math.sin(a) * r * 0.22);
    ctx.lineTo(Math.cos(a) * ir * 0.85, Math.sin(a) * ir * 0.85);
    ctx.strokeStyle = ORANGE + "0.3)"; ctx.lineWidth = 1 / scale; ctx.stroke();
  }
  ctx.restore();
}

function drawWrench(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, alpha: number, scale: number, col: string) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
  const C = col === "orange" ? ORANGE : WHITE;
  ctx.strokeStyle = C + "0.85)"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(0, 32); ctx.stroke();
  ([-28, 28] as number[]).forEach(hx => {
    [-24, 24].forEach(hy => {
      ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2);
      ctx.strokeStyle = C + "0.65)"; ctx.lineWidth = 3; ctx.stroke();
    });
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(hx, -24);
    ctx.strokeStyle = C + "0.65)"; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 24); ctx.lineTo(hx, 24); ctx.stroke();
  });
  ctx.restore();
}

function drawBolt(ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, alpha: number, scale: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
  const s = 12;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
    i === 0 ? ctx.moveTo(Math.cos(a) * s, Math.sin(a) * s) : ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
  }
  ctx.closePath(); ctx.strokeStyle = WHITE + "0.75)"; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.strokeStyle = WHITE + "0.4)"; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(0, -12);
  ctx.strokeStyle = WHITE + "0.55)"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.stroke();
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.moveTo(-3, -12 - i * 4); ctx.lineTo(3, -12 - i * 4);
    ctx.strokeStyle = WHITE + "0.25)"; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.restore();
}

function drawSpeedometer(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number, scale: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.arc(0, 0, 22, Math.PI, 0, false);
  ctx.strokeStyle = WHITE + "0.45)"; ctx.lineWidth = 1.5; ctx.stroke();
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 18, Math.sin(a) * 18);
    ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 22);
    ctx.strokeStyle = i === 8 ? ORANGE + "0.9)" : WHITE + "0.3)";
    ctx.lineWidth = i % 2 === 0 ? 1.5 : 0.8; ctx.stroke();
  }
  const na = Math.PI + 0.7 * Math.PI;
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(na) * 16, Math.sin(na) * 16);
  ctx.strokeStyle = ORANGE + "0.9)"; ctx.lineWidth = 1.5; ctx.lineCap = "round"; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = ORANGE + "0.8)"; ctx.fill();
  ctx.restore();
}

function drawSpring(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number, scale: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
  ctx.strokeStyle = WHITE + "0.55)"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(0, -22);
  const coils = 5, cr = 9, ch = 44;
  for (let i = 0; i <= coils * 12; i++) {
    const t = i / (coils * 12);
    const cx = Math.sin(t * Math.PI * 2 * coils) * cr;
    const cy = -22 + t * ch;
    i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
  }
  ctx.lineTo(0, 28); ctx.stroke();
  ctx.restore();
}

export default function FloatingTools() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", e => { mouseRef.current = { x: e.clientX, y: e.clientY }; });

    const TYPES = ["gear","gear","gear","wrench","wrench","bolt","bolt","bolt","speedo","spring"];
    const items: Item[] = Array.from({ length: 30 }, (_, i) => ({
      type: TYPES[i % TYPES.length],
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.008,
      scale: 0.4 + Math.random() * 0.7,
      alpha: 0.06 + Math.random() * 0.16,
      teeth: Math.floor(6 + Math.random() * 8),
      col: Math.random() < 0.4 ? "orange" : "white",
      mass: 0.5 + Math.random() * 0.5,
    }));

    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const { x: mx, y: my } = mouseRef.current;

      items.forEach(p => {
        const dx = mx - p.x, dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 200) {
          const force = ((200 - dist) / 200) * 0.02 / p.mass;
          p.vx -= (dx / dist) * force;
          p.vy -= (dy / dist) * force;
        }
        p.vx *= 0.992; p.vy *= 0.992;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.x < -100) p.x = W + 100;
        if (p.x > W + 100) p.x = -100;
        if (p.y < -100) p.y = H + 100;
        if (p.y > H + 100) p.y = -100;

        const s = p.scale;
        if (p.type === "gear")    drawGear(ctx, p.x, p.y, 18 * s, p.teeth, p.rot, p.alpha, s);
        if (p.type === "wrench")  drawWrench(ctx, p.x, p.y, p.rot, p.alpha, s * 0.55, p.col);
        if (p.type === "bolt")    drawBolt(ctx, p.x, p.y, p.rot, p.alpha, s * 0.7);
        if (p.type === "speedo")  drawSpeedometer(ctx, p.x, p.y, p.alpha, s * 0.8);
        if (p.type === "spring")  drawSpring(ctx, p.x, p.y, p.alpha, s * 0.7);
      });

      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
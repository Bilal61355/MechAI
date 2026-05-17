"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const isHovering = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      const el = document.elementFromPoint(e.clientX, e.clientY);
      isHovering.current = !!(el?.closest("button, a, [data-hover]"));
    };

    window.addEventListener("mousemove", onMove);

    let frame: number;
    function animate() {
      ring.current.x += (pos.current.x - ring.current.x) * 0.1;
      ring.current.y += (pos.current.y - ring.current.y) * 0.1;

      if (dotRef.current) {
        dotRef.current.style.left = pos.current.x + "px";
        dotRef.current.style.top = pos.current.y + "px";
      }
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + "px";
        ringRef.current.style.top = ring.current.y + "px";
        const s = isHovering.current ? 1.8 : 1;
        ringRef.current.style.transform = `translate(-50%, -50%) scale(${s})`;
        ringRef.current.style.borderColor = isHovering.current
          ? "rgba(232,93,38,0.9)"
          : "rgba(232,93,38,0.45)";
      }

      frame = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <style>{`
        .cur-dot {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
        }
        .cur-dot::before,
        .cur-dot::after {
          content: '';
          position: absolute;
          background: #e85d26;
        }
        .cur-dot::before {
          width: 1.5px;
          height: 10px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        .cur-dot::after {
          width: 10px;
          height: 1.5px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        .cur-center {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #e85d26;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .cur-ring {
          position: fixed;
          pointer-events: none;
          z-index: 9998;
          width: 32px;
          height: 32px;
          border: 1px dashed rgba(232,93,38,0.45);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.25s cubic-bezier(0.23,1,0.32,1),
                      border-color 0.2s ease;
          animation: spin 6s linear infinite;
        }
        .cur-ring::before {
          content: '';
          position: absolute;
          inset: 4px;
          border: 0.5px solid rgba(232,93,38,0.15);
          border-radius: 50%;
        }
        @keyframes spin {
          from { rotate: 0deg; }
          to   { rotate: 360deg; }
        }
        * { cursor: none !important; }
      `}</style>

      {/* Crosshair dot */}
      <div ref={dotRef} className="cur-dot">
        <div className="cur-center" />
      </div>

      {/* Spinning dashed ring */}
      <div ref={ringRef} className="cur-ring" />
    </>
  );
}
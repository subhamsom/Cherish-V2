"use client";

import { useEffect, useRef } from "react";

export function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0,
      H = 0,
      cx = 0,
      cy = 0;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      cy = H / 2;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // ── Particles arranged in concentric "rings" with jitter ──
    // Inner ring = strongest, closest to the soul. Outer = sparse far stars.
    const layers = [
      { count: 5, rMin: 22, rMax: 38, size: [1.4, 2.4], speed: 0.0028, hueBias: "warm" }, // halo
      { count: 11, rMin: 54, rMax: 88, size: [1.0, 1.9], speed: 0.0014, hueBias: "coral" }, // mid
      { count: 18, rMin: 95, rMax: 148, size: [0.7, 1.4], speed: 0.00075, hueBias: "rose" }, // outer
      { count: 16, rMin: 155, rMax: 215, size: [0.4, 1.0], speed: 0.0004, hueBias: "far" }, // far stars
    ];
    const pickHue = (b: string) => {
      if (b === "warm") return 22 + Math.random() * 12; // peach/gold
      if (b === "coral") return 8 + Math.random() * 14; // coral
      if (b === "rose") return 350 + Math.random() * 24; // rose
      return 18 + Math.random() * 18; // mixed
    };

    const particles: {
      angle: number;
      baseR: number;
      radiusJitter: number;
      freq: number;
      phase: number;
      angularVel: number;
      size: number;
      hue: number;
      x: number | null;
      y: number | null;
      glow: number;
      twinkleFreq: number;
      twinklePhase: number;
      layer: number;
    }[] = [];
    layers.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const baseR = layer.rMin + Math.random() * (layer.rMax - layer.rMin);
        particles.push({
          angle,
          baseR,
          radiusJitter: 4 + Math.random() * 12,
          freq: 0.25 + Math.random() * 0.7,
          phase: Math.random() * Math.PI * 2,
          angularVel: (Math.random() < 0.5 ? -1 : 1) * layer.speed * (0.6 + Math.random() * 0.8),
          size: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
          hue: pickHue(layer.hueBias),
          x: null,
          y: null,
          glow: 0.55 + Math.random() * 0.45,
          twinkleFreq: 0.6 + Math.random() * 1.4,
          twinklePhase: Math.random() * Math.PI * 2,
          layer: li,
        });
      }
    });

    // ── Incoming memory fragments — small dots that drift in from off-screen
    // toward the soul, leaving a faint trail. They fade in, ease toward
    // their target, and dissolve as they "arrive".
    const fragments: {
      sx: number;
      sy: number;
      tx: number;
      ty: number;
      x: number;
      y: number;
      born: number;
      ttl: number;
      hue: number;
    }[] = [];
    let nextFragmentAt = 600;

    const spawnFragment = (now: number) => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.max(W, H) * 0.55 + Math.random() * 40;
      const targetR = 30 + Math.random() * 60;
      const tAng = Math.random() * Math.PI * 2;
      fragments.push({
        sx: cx + Math.cos(angle) * r,
        sy: cy + Math.sin(angle) * r,
        tx: cx + Math.cos(tAng) * targetR,
        ty: cy + Math.sin(tAng) * targetR,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        born: now,
        ttl: 3200 + Math.random() * 1800,
        hue: 14 + Math.random() * 18,
      });
    };

    const start = performance.now();
    let prev = start;

    const draw = (now: number) => {
      const dt = Math.min(50, now - prev);
      prev = now;
      const t = (now - start) * 0.001;

      // Center wobbles slowly — gives the whole field a living, breathing
      // anchor instead of a fixed point.
      cx = W / 2 + Math.sin(t * 0.27) * 7;
      cy = H / 2 + Math.cos(t * 0.19) * 5;

      // Soft trail fade — leaves ghost trails of particles, so motion reads
      // as a slow continuous evolution rather than discrete frames.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(250, 248, 244, 0.13)";
      ctx.fillRect(0, 0, W, H);

      // Update particle positions
      particles.forEach((p) => {
        p.angle += p.angularVel * dt;
        const drift = Math.sin(t * p.freq + p.phase) * p.radiusJitter;
        const r = p.baseR + drift;
        const tx = cx + Math.cos(p.angle) * r;
        const ty = cy + Math.sin(p.angle) * r;
        if (p.x === null) {
          p.x = tx;
          p.y = ty;
        } else {
          p.x += (tx - p.x) * 0.07;
          if (p.y !== null) {
            p.y += (ty - p.y) * 0.07;
          }
        }
      });

      // ── Constellation lines: connect nearby inner/mid particles.
      // Lines fade with distance, building a fragile, living graph.
      ctx.globalCompositeOperation = "source-over";
      const maxLine = 78;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (a.layer > 2) continue;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (b.layer > 2) continue;
          const dx = a.x! - b.x!;
          const dy = a.y! - b.y!;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxLine * maxLine) {
            const d = Math.sqrt(d2);
            const op = (1 - d / maxLine) * 0.22;
            ctx.strokeStyle = `rgba(255, 130, 130, ${op})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(a.x!, a.y!);
            ctx.lineTo(b.x!, b.y!);
            ctx.stroke();
          }
        }
      }

      // ── Central glow — the "soul". Breathes on a slow sine cycle.
      const breath = (Math.sin(t * 0.85) + 1) / 2;
      const glowR = 95 + breath * 32;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      g.addColorStop(0, `rgba(255, 132, 124, ${0.45 + breath * 0.18})`);
      g.addColorStop(0.32, `rgba(255, 156, 138, ${0.18 + breath * 0.08})`);
      g.addColorStop(0.7, `rgba(255, 180, 160, ${0.05})`);
      g.addColorStop(1, "rgba(255, 200, 180, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Inner core — bright nucleus
      const coreR = 5 + breath * 3.5;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR + 14);
      cg.addColorStop(0, `rgba(255, 245, 235, ${0.9})`);
      cg.addColorStop(0.35, `rgba(255, 188, 170, ${0.55})`);
      cg.addColorStop(1, "rgba(255, 130, 130, 0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR + 14, 0, Math.PI * 2);
      ctx.fill();

      // ── Draw particles (glow halo + sharp center)
      particles.forEach((p) => {
        const tw = 0.7 + 0.3 * Math.sin(t * p.twinkleFreq + p.twinklePhase);
        const size = p.size * (0.9 + 0.2 * tw);
        const haloR = size * 6.5;
        const pg = ctx.createRadialGradient(p.x!, p.y!, 0, p.x!, p.y!, haloR);
        pg.addColorStop(0, `hsla(${p.hue}, 86%, 72%, ${0.68 * p.glow * tw})`);
        pg.addColorStop(0.5, `hsla(${p.hue}, 82%, 66%, ${0.18 * p.glow * tw})`);
        pg.addColorStop(1, `hsla(${p.hue}, 80%, 65%, 0)`);
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(p.x!, p.y!, haloR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(${p.hue}, 92%, 82%, ${0.95 * tw})`;
        ctx.beginPath();
        ctx.arc(p.x!, p.y!, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Memory fragments arriving (sparse, occasional)
      if (now - start > nextFragmentAt) {
        spawnFragment(now);
        nextFragmentAt = now - start + 900 + Math.random() * 800;
      }
      for (let i = fragments.length - 1; i >= 0; i--) {
        const f = fragments[i];
        const age = now - f.born;
        const k = Math.min(1, age / f.ttl);
        // ease-out toward target — feels like falling toward gravity
        f.x += (f.tx - f.x) * 0.018;
        f.y += (f.ty - f.y) * 0.018;
        const op = k < 0.15 ? k / 0.15 : k > 0.78 ? Math.max(0, (1 - k) / 0.22) : 1;
        // trail back toward origin
        const trailLen = 26;
        const dx = f.sx - f.x,
          dy = f.sy - f.y;
        const dlen = Math.sqrt(dx * dx + dy * dy) || 1;
        const tx = f.x + (dx / dlen) * trailLen;
        const ty = f.y + (dy / dlen) * trailLen;
        const lg = ctx.createLinearGradient(f.x, f.y, tx, ty);
        lg.addColorStop(0, `hsla(${f.hue}, 85%, 80%, ${0.65 * op})`);
        lg.addColorStop(1, `hsla(${f.hue}, 85%, 80%, 0)`);
        ctx.strokeStyle = lg;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        // head
        ctx.fillStyle = `hsla(${f.hue}, 90%, 86%, ${0.95 * op})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
        if (k >= 1) fragments.splice(i, 1);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full"
      />
    </div>
  );
}

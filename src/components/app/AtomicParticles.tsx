import { useEffect, useRef } from "react";

/**
 * 3D atomic particle field rendered on a 2D canvas with perspective projection.
 * Particles orbit a central nucleus on multiple tilted ellipses, giving an
 * "atom" feel without WebGL.
 */
export function AtomicParticles({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0, cx = 0, cy = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      cx = w / 2; cy = h / 2;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Build orbital rings - reduced particle count for performance
    type P = { ring: number; angle: number; speed: number; r: number; tiltX: number; tiltZ: number; size: number; hue: number };
    const rings = [
      { count: 16, r: 90, tiltX: 0.6, tiltZ: 0.0, speed: 0.012, hue: 195 },
      { count: 14, r: 120, tiltX: -0.4, tiltZ: 0.7, speed: -0.008, hue: 270 },
      { count: 11, r: 150, tiltX: 0.9, tiltZ: -0.5, speed: 0.006, hue: 145 },
      { count: 9, r: 70, tiltX: -0.8, tiltZ: 0.3, speed: -0.018, hue: 195 },
    ];
    const particles: P[] = [];
    rings.forEach((ring, i) => {
      for (let k = 0; k < ring.count; k++) {
        particles.push({
          ring: i,
          angle: (k / ring.count) * Math.PI * 2,
          speed: ring.speed,
          r: ring.r,
          tiltX: ring.tiltX,
          tiltZ: ring.tiltZ,
          size: 1.4 + Math.random() * 1.6,
          hue: ring.hue,
        });
      }
    });

    const project = (x: number, y: number, z: number) => {
      const focal = 320;
      const scale = focal / (focal + z);
      return { x: cx + x * scale, y: cy + y * scale, scale };
    };

    let t = 0;
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      // Soft nucleus glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      grad.addColorStop(0, "rgba(120, 200, 255, 0.55)");
      grad.addColorStop(0.5, "rgba(120, 200, 255, 0.12)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fill();

      // Orbit traces
      rings.forEach((ring) => {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.1) {
          const x = Math.cos(a) * ring.r;
          const y = Math.sin(a) * ring.r * Math.cos(ring.tiltX);
          const z = Math.sin(a) * ring.r * Math.sin(ring.tiltX) * Math.cos(ring.tiltZ);
          const p = project(x, y, z);
          if (a === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = `hsla(${ring.hue}, 90%, 65%, 0.18)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Compute particles - only sort every few frames for perf
      const drawn = particles.map((p) => {
        p.angle += p.speed;
        const x = Math.cos(p.angle) * p.r;
        const y = Math.sin(p.angle) * p.r * Math.cos(p.tiltX);
        const z = Math.sin(p.angle) * p.r * Math.sin(p.tiltX) * Math.cos(p.tiltZ)
          + Math.cos(p.angle) * p.r * Math.sin(p.tiltZ) * 0.4;
        const proj = project(x, y, z);
        return { p, ...proj, z };
      });

      // Only sort every 6 frames to reduce CPU
      if (t % 6 === 0) {
        drawn.sort((a, b) => b.z - a.z);
      }

      drawn.forEach(({ p, x, y, scale }) => {
        const size = p.size * (0.6 + scale * 0.9);
        const alpha = Math.max(0.18, Math.min(1, scale));
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 95%, 70%, ${alpha})`;
        // Reduce shadow effects for performance
        if (t % 12 === 0) {
          ctx.shadowColor = `hsla(${p.hue}, 95%, 70%, ${alpha * 0.4})`;
          ctx.shadowBlur = 3 * scale;
        }
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Slow global rotation for 3D feel
      rings.forEach((r) => { r.tiltZ += 0.0015; });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

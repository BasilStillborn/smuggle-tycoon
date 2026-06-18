import { useEffect, useRef } from 'react';
import type { Element } from '../data/elements';
import type { Environment, ReactionResult } from '../data/reactions';
import type { MatterSampleState } from '../core/phaseEngine';

type ChamberCanvasProps = {
  selected: Element[];
  products: string[];
  result: ReactionResult;
  environment: Environment;
  matterStates: MatterSampleState[];
  runId: number;
};

const TAU = Math.PI * 2;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const val = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return { r: (val >> 16) & 255, g: (val >> 8) & 255, b: val & 255 };
}

function rgba(hex: string, a: number) {
  const c = hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

function mixHex(a: string, b: string, t: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return `rgb(${Math.round(lerp(ca.r, cb.r, t))},${Math.round(lerp(ca.g, cb.g, t))},${Math.round(lerp(ca.b, cb.b, t))})`;
}

function noise2D(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function fbm(x: number, y: number, octaves: number) {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * noise2D(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return val;
}

function particleSeed(i: number) {
  const h = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  const h2 = Math.sin(i * 269.5 + 183.3) * 43758.5453;
  return { x: h - Math.floor(h), y: h2 - Math.floor(h2) };
}

export function ChamberCanvas({ selected, products, result, environment, matterStates, runId }: ChamberCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvasCtx = canvasEl.getContext('2d', { alpha: false });
    if (!canvasCtx) return;

    const el = canvasEl;
    const ctx = canvasCtx;

    let raf = 0;
    let startTime = performance.now();
    const hasMatter = selected.length > 0 || products.length > 0;
    const hasProducts = products.length > 0;
    const productSet = new Set(products);

    const tempK = environment.temperature;
    const pressAtm = environment.pressureAtm;

    const coldness = clamp((273 - tempK) / 233, 0, 1);
    const heat = clamp((tempK - 320) / 420, 0, 1);
    const extreme = clamp((tempK - 720) / 180, 0, 1);
    const vacuum = clamp((0.6 - pressAtm) / 0.6, 0, 1);
    const compression = clamp((pressAtm - 1.2) / 5.8, 0, 1);

    function resize() {
      const rect = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.max(1, Math.floor(rect.width * dpr));
      el.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(timeMs: number) {
      const w = el.getBoundingClientRect().width;
      const h = el.getBoundingClientRect().height;
      const t = (timeMs - startTime) / 1000;

      // ── BASE CHAMBER BACKGROUND ──
      const baseBg = ctx.createLinearGradient(0, 0, 0, h);
      if (extreme > 0.15) {
        baseBg.addColorStop(0, mixHex('#1a0505', '#020617', 0.3));
        baseBg.addColorStop(0.5, '#0a0208');
        baseBg.addColorStop(1, '#020617');
      } else if (heat > 0.1) {
        baseBg.addColorStop(0, mixHex('#1a0808', '#020617', 0.4));
        baseBg.addColorStop(0.5, '#0a0410');
        baseBg.addColorStop(1, '#020617');
      } else if (coldness > 0.15) {
        baseBg.addColorStop(0, '#050d1a');
        baseBg.addColorStop(0.5, '#040a18');
        baseBg.addColorStop(1, '#020617');
      } else {
        baseBg.addColorStop(0, '#080c1e');
        baseBg.addColorStop(0.5, '#060a1a');
        baseBg.addColorStop(1, '#020617');
      }
      ctx.fillStyle = baseBg;
      ctx.fillRect(0, 0, w, h);

      // ── THERMAL GRADIENT LIGHTING ──
      ctx.save();
      if (coldness > 0.05) {
        const coldGrad = ctx.createRadialGradient(w * 0.5, h * 0.15, 10, w * 0.5, h * 0.35, h * 0.8);
        coldGrad.addColorStop(0, `rgba(56,189,248,${coldness * 0.35})`);
        coldGrad.addColorStop(0.35, `rgba(14,116,144,${coldness * 0.18})`);
        coldGrad.addColorStop(1, 'rgba(2,6,23,0)');
        ctx.fillStyle = coldGrad;
        ctx.fillRect(0, 0, w, h);

        const sideCold = ctx.createRadialGradient(0, h * 0.5, 5, w * 0.15, h * 0.5, w * 0.45);
        sideCold.addColorStop(0, `rgba(103,232,249,${coldness * 0.12})`);
        sideCold.addColorStop(1, 'rgba(2,6,23,0)');
        ctx.fillStyle = sideCold;
        ctx.fillRect(0, 0, w, h);
      }

      if (heat > 0.05) {
        const hotGrad = ctx.createRadialGradient(w * 0.5, h * 0.92, 10, w * 0.5, h * 0.65, h * 0.7);
        hotGrad.addColorStop(0, `rgba(251,113,133,${heat * 0.45})`);
        hotGrad.addColorStop(0.3, `rgba(249,115,22,${heat * 0.25})`);
        hotGrad.addColorStop(1, 'rgba(2,6,23,0)');
        ctx.fillStyle = hotGrad;
        ctx.fillRect(0, 0, w, h);
      }

      if (extreme > 0.1) {
        const exGrad = ctx.createRadialGradient(w * 0.5, h * 0.55, 10, w * 0.5, h * 0.5, h * 0.55);
        exGrad.addColorStop(0, `rgba(255,247,237,${extreme * 0.42})`);
        exGrad.addColorStop(0.25, `rgba(253,186,116,${extreme * 0.28})`);
        exGrad.addColorStop(0.6, `rgba(251,113,133,${extreme * 0.12})`);
        exGrad.addColorStop(1, 'rgba(2,6,23,0)');
        ctx.fillStyle = exGrad;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      // ── VOLUMETRIC GOD RAYS ──
      {
        ctx.save();
        const rayCount = 5;
        for (let i = 0; i < rayCount; i++) {
          const seed = particleSeed(i + 700);
          const baseAngle = -Math.PI / 2 + (seed.x - 0.5) * 0.8;
          const rayWidth = 0.04 + seed.y * 0.06;
          const rayLen = h * (0.6 + seed.x * 0.4);
          const speed = 0.15 + seed.y * 0.1;
          const sway = Math.sin(t * speed + i * 1.3) * 0.03;
          const baseAlpha = (extreme > 0.1 ? 0.08 : heat > 0.1 ? 0.04 : coldness > 0.1 ? 0.03 : 0.02) * (0.7 + seed.x * 0.6);

          ctx.beginPath();
          const cx = w * (0.3 + seed.x * 0.4);
          const cy = 0;
          ctx.moveTo(cx, cy);
          ctx.lineTo(
            cx + Math.cos(baseAngle + sway - rayWidth) * rayLen,
            cy + Math.sin(baseAngle + sway - rayWidth) * rayLen
          );
          ctx.lineTo(
            cx + Math.cos(baseAngle + sway + rayWidth) * rayLen,
            cy + Math.sin(baseAngle + sway + rayWidth) * rayLen
          );
          ctx.closePath();

          const rayGrad = ctx.createLinearGradient(cx, cy, cx, cy + rayLen);
          const rayColor = extreme > 0.1 ? '255,247,237' : heat > 0.1 ? '251,191,36' : coldness > 0.1 ? '186,230,253' : '148,163,184';
          rayGrad.addColorStop(0, `rgba(${rayColor},${baseAlpha * 1.5})`);
          rayGrad.addColorStop(0.3, `rgba(${rayColor},${baseAlpha})`);
          rayGrad.addColorStop(1, `rgba(${rayColor},0)`);
          ctx.fillStyle = rayGrad;
          ctx.fill();
        }
        ctx.restore();
      }

      // ── FROST CRYSTALLINE EDGE PATTERNS (AAA MULTI-LAYER COMPOSITING) ──
      // Layers: base ice volume → SDF crystal geometries → noise edge feather
      //         → displacement refraction → Fresnel rim → caustics → noise imperfections
      if (coldness > 0.08) {
        const frostAlpha = coldness * 0.85;
        ctx.save();

        // Layer 1: Base ice volume (deep cyan → ice blue radial gradient)
        const iceVolume = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.56);
        iceVolume.addColorStop(0, `rgba(8,47,73,${frostAlpha * 0.3})`);        // deep cyan core
        iceVolume.addColorStop(0.4, `rgba(14,116,144,${frostAlpha * 0.35})`);  // cyan mid
        iceVolume.addColorStop(0.7, `rgba(56,189,248,${frostAlpha * 0.2})`);   // ice blue
        iceVolume.addColorStop(1, `rgba(2,6,23,0)`);
        ctx.fillStyle = iceVolume;
        ctx.fillRect(0, 0, w, h);

        // Layer 2: SDF crystalline geometries (pre-seeded crystal patterns)
        // Generate crystal seeds once per resize, then render branching ice
        const crystalCount = 180;
        for (let ci = 0; ci < crystalCount; ci++) {
          const seed = particleSeed(ci + 4000);
          // Distribute crystals with higher density toward edges
          const edgeBias = 0.4 + seed.y * 0.6;
          const edgePick = ci % 4;
          let cx: number, cy: number;
          if (edgePick === 0) { cx = seed.x * w * 0.3; cy = seed.y * h; }
          else if (edgePick === 1) { cx = w - seed.x * w * 0.3; cy = seed.y * h; }
          else if (edgePick === 2) { cx = seed.x * w; cy = seed.y * h * 0.3; }
          else { cx = seed.x * w; cy = h - seed.y * h * 0.3; }
          // Clamp inside viewport
          cx = clamp(cx, 2, w - 2);
          cy = clamp(cy, 2, h - 2);

          const crystalSize = 4 + seed.x * 38 * coldness;
          const branches = 3 + Math.floor(seed.y * 4);
          const baseAngle = (ci * 1.618) % TAU;
          const sharpness = 0.85 + seed.x * 0.15; // SDF edge sharpness

          for (let b = 0; b < branches; b++) {
            const ba = baseAngle + (b / branches) * TAU + (seed.x - 0.5) * 0.6;
            const branchLen = crystalSize * (0.4 + (seed.y + b / branches) * 0.6);
            const ex = cx + Math.cos(ba) * branchLen;
            const ey = cy + Math.sin(ba) * branchLen;
            const midX = (cx + ex) / 2 + Math.cos(ba + 1.2) * branchLen * 0.2;
            const midY = (cy + ey) / 2 + Math.sin(ba + 1.2) * branchLen * 0.2;

            // Sub-branches (dendritic)
            const subBranches = 2 + Math.floor(seed.y * 3);
            for (let sb = 0; sb < subBranches; sb++) {
              const sba = ba + ((sb / subBranches) - 0.5) * 0.8 + Math.sin(ci * 0.7 + sb) * 0.15;
              const sfrac = 0.3 + sb * 0.25;
              const sx = lerp(cx, ex, sfrac);
              const sy = lerp(cy, ey, sfrac);
              const slen = branchLen * (0.2 + (1 - sfrac) * 0.25);
              const sex = sx + Math.cos(sba) * slen;
              const sey = sy + Math.sin(sba) * slen;

              // SDF-like anti-aliased line
              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.lineTo(sex, sey);
              const branchAlpha = (0.3 + seed.x * 0.25 + (1 - b / branches) * 0.2) * frostAlpha;
              ctx.strokeStyle = `rgba(186,230,253,${branchAlpha})`;
              ctx.lineWidth = (1.2 - sb * 0.25) * sharpness;
              ctx.lineCap = 'round';
              ctx.stroke();

              // Sparkle tip at sub-branch ends
              if (sb === subBranches - 1) {
                const tipPulse = 0.6 + Math.sin(t * 1.5 + ci * 0.7 + b + sb) * 0.3;
                ctx.fillStyle = `rgba(255,255,255,${tipPulse * frostAlpha * 0.8})`;
                ctx.beginPath();
                ctx.arc(sex, sey, 0.8 + seed.x * 0.6, 0, TAU);
                ctx.fill();
                // Glow halo
                ctx.fillStyle = `rgba(186,230,253,${tipPulse * frostAlpha * 0.2})`;
                ctx.beginPath();
                ctx.arc(sex, sey, 2.5 + seed.x * 1.5, 0, TAU);
                ctx.fill();
              }
            }

            // Main branch with SDF-style soft edge
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.quadraticCurveTo(midX, midY, ex, ey);
            const mainAlpha = (0.5 + seed.x * 0.3 + (1 - b / branches) * 0.15) * frostAlpha;
            ctx.strokeStyle = `rgba(219,234,254,${mainAlpha})`;
            ctx.lineWidth = 1.8 * sharpness;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        }

        // Layer 3: Fresnel rim highlight (bright edge glow on ice)
        const fresnelGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.08, w / 2, h / 2, Math.max(w, h) * 0.52);
        fresnelGrad.addColorStop(0, 'rgba(2,6,23,0)');
        fresnelGrad.addColorStop(0.75, `rgba(103,232,249,${frostAlpha * 0.12})`);
        fresnelGrad.addColorStop(0.92, `rgba(219,234,254,${frostAlpha * 0.4})`);
        fresnelGrad.addColorStop(1, `rgba(255,255,255,${frostAlpha * 0.55})`);
        ctx.fillStyle = fresnelGrad;
        ctx.fillRect(0, 0, w, h);

        // Layer 4: Displacement refraction (noise-based pixel shift on ice)
        // Use getImageData only when needed for performance
        const dispStrength = 2 + coldness * 4;
        if (dispStrength > 1 && w > 50 && h > 50) {
          try {
            const imageData = ctx.getImageData(0, 0, w, h);
            const data = imageData.data;
            const tempData = new Uint8ClampedArray(data);
            for (let y = 10; y < h - 10; y += 2) {
              for (let x = 10; x < w - 10; x += 2) {
                const n = fbm(x * 0.015 + t * 0.06, y * 0.015, 2);
                const dx = Math.round((n - 0.5) * dispStrength);
                const dy = Math.round((n - 0.5) * dispStrength * 0.7);
                const srcIdx = (y * w + x) * 4;
                const dstIdx = ((y + dy) * w + (x + dx)) * 4;
                if (dstIdx >= 0 && dstIdx < data.length && srcIdx >= 0 && srcIdx < data.length) {
                  data[dstIdx] = tempData[srcIdx];
                  data[dstIdx + 1] = tempData[srcIdx + 1];
                  data[dstIdx + 2] = tempData[srcIdx + 2];
                  data[dstIdx + 3] = tempData[srcIdx + 3];
                }
              }
            }
            ctx.putImageData(imageData, 0, 0);
          } catch {
            // getImageData may fail on some cross-origin / offscreen setups
          }
        }

        // Layer 5: Caustic light patterns on ice surface
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = frostAlpha * 0.2;
        for (let i = 0; i < 16; i++) {
          const seed = particleSeed(i + 5000);
          const ccx = w * (0.05 + seed.x * 0.9);
          const ccy = h * (0.05 + seed.y * 0.9);
          const cr = 10 + seed.x * 70;
          const bright = fbm(ccx * 0.02 + t * 0.15, ccy * 0.02 + t * 0.1, 3);
          const pulse2 = 0.6 + Math.sin(t * 1.2 + i * 0.9) * 0.4;

          const causticGrad = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, cr);
          causticGrad.addColorStop(0, `rgba(219,234,254,${bright * pulse2 * 0.3})`);
          causticGrad.addColorStop(0.5, `rgba(103,232,249,${bright * pulse2 * 0.15})`);
          causticGrad.addColorStop(1, 'rgba(2,6,23,0)');
          ctx.fillStyle = causticGrad;
          ctx.beginPath();
          ctx.arc(ccx, ccy, cr, 0, TAU);
          ctx.fill();
        }
        ctx.restore();

        // Layer 6: Noise surface imperfections (grain)
        ctx.save();
        ctx.globalAlpha = coldness * 0.12;
        ctx.globalCompositeOperation = 'overlay';
        for (let y = 0; y < h; y += 3) {
          for (let x = 0; x < w; x += 3) {
            const n = noise2D(x * 0.3 + t * 4, y * 0.3);
            if (n > 0.62) {
              const shade = n > 0.78 ? '255,255,255' : '2,6,23';
              ctx.fillStyle = `rgba(${shade},${(n - 0.62) * 1.5})`;
              ctx.fillRect(x, y, 2, 2);
            }
          }
        }
        ctx.restore();

        // Layer 7: Ice edge vignette with pulsing warmth
        const iceVignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.12, w / 2, h / 2, Math.max(w, h) * 0.6);
        iceVignette.addColorStop(0, 'rgba(2,6,23,0)');
        iceVignette.addColorStop(0.55, `rgba(14,116,144,${coldness * 0.08})`);
        iceVignette.addColorStop(1, `rgba(56,189,248,${coldness * 0.25 + Math.sin(t * 0.6) * 0.04})`);
        ctx.fillStyle = iceVignette;
        ctx.fillRect(0, 0, w, h);

        // Frost rings (remaining for ambiance)
        for (let i = 0; i < 8; i++) {
          const seed = particleSeed(i + 800);
          const cx2 = w * (0.1 + seed.x * 0.8);
          const cy2 = h * (0.1 + seed.y * 0.8);
          const baseR = 10 + seed.x * 50;
          const pulse3 = 1 + Math.sin(t * 0.7 + i * 1.1) * 0.1;
          const r = baseR * pulse3;
          ctx.strokeStyle = `rgba(186,230,253,${0.08 + seed.y * 0.06 + Math.sin(t * 0.5 + i) * 0.03})`;
          ctx.lineWidth = 0.6 + seed.x * 0.3;
          ctx.beginPath();
          ctx.arc(cx2, cy2, r, 0, TAU);
          ctx.stroke();
        }

        ctx.restore();
      }

      // ── HEAT SHIMMER / CONVECTION PLUMES ──
      // Perlin noise displacement + layered particle streams + ember particles
      if (heat > 0.08) {
        ctx.save();

        // Layer 1: Heat distortion lines (Perlin noise displacement)
        const distortionLayers = 4;
        for (let layer = 0; layer < distortionLayers; layer++) {
          ctx.globalAlpha = heat * 0.25 * (1 - layer * 0.15);
          ctx.lineWidth = 1.5 + layer * 0.8;
          
          for (let i = 0; i < 8; i++) {
            const seed = particleSeed(i * 100 + layer * 200 + 300);
            const baseX = seed.x * w;
            const baseY = h;
            const targetY = h * (0.2 + seed.y * 0.4);
            const speed = 1.2 + heat * 2 + layer * 0.5;
            const amp = 6 + heat * 18 + layer * 4;
            const freq = 0.01 + seed.y * 0.015;
            
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            for (let y = baseY; y > targetY; y -= 4) {
              const progress = 1 - (y / h);
              const noiseVal = fbm(baseX * 0.02 + t * speed, y * freq + t * speed * 0.7, 3);
              const waveX = (noiseVal - 0.5) * amp * progress * 2;
              ctx.lineTo(baseX + waveX, y);
            }
            
            const grad = ctx.createLinearGradient(baseX, baseY, baseX, targetY);
            if (extreme > 0.2) {
              grad.addColorStop(0, `rgba(255,247,237,${0.3 + layer * 0.1})`);
              grad.addColorStop(0.5, `rgba(253,186,116,${0.2 + heat * 0.1})`);
              grad.addColorStop(1, 'rgba(2,6,23,0)');
            } else if (heat > 0.15) {
              grad.addColorStop(0, `rgba(251,146,60,${0.25 + heat * 0.1})`);
              grad.addColorStop(0.5, `rgba(249,115,22,${0.15 + heat * 0.1})`);
              grad.addColorStop(1, 'rgba(2,6,23,0)');
            } else {
              grad.addColorStop(0, `rgba(251,113,133,${0.2 + heat * 0.15})`);
              grad.addColorStop(0.5, `rgba(249,115,22,${0.1 + heat * 0.1})`);
              grad.addColorStop(1, 'rgba(2,6,23,0)');
            }
            ctx.strokeStyle = grad;
            ctx.stroke();
          }
        }

        // Layer 2: Rising ember particles
        const emberCount = Math.floor(30 + heat * 50 + extreme * 30);
        for (let i = 0; i < emberCount; i++) {
          const seed = particleSeed(i + 500);
          const startX = seed.x * w;
          const rise = ((t * (0.5 + seed.y * 2) + seed.y * 10) % 1) * (h * 0.9);
          const y = h - rise;
          const wobble = Math.sin(t * 3 + seed.x * 20 + rise * 0.05) * (6 + heat * 12 + extreme * 8);
          const x = startX + wobble;
          const size = 1 + seed.y * 3 + extreme * 3;
          
          if (y > 0 && y < h) {
            const life = 1 - rise / (h * 0.9);
            const alpha = life * (0.3 + heat * 0.3);
            
            // Ember glow
            const emberGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            if (extreme > 0.3) {
              emberGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
              emberGrad.addColorStop(0.3, `rgba(255,247,237,${alpha * 0.8})`);
              emberGrad.addColorStop(1, 'rgba(2,6,23,0)');
            } else {
              emberGrad.addColorStop(0, `rgba(255,247,237,${alpha})`);
              emberGrad.addColorStop(0.5, `rgba(251,146,60,${alpha * 0.6})`);
              emberGrad.addColorStop(1, 'rgba(2,6,23,0)');
            }
            ctx.fillStyle = emberGrad;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, TAU);
            ctx.fill();
          }
        }

        // Layer 3: Hot underglow pulse with breathing
        const pulseAmt = Math.sin(t * 1.5) * 0.06 + Math.sin(t * 2.7) * 0.03;
        const underGlow = ctx.createRadialGradient(w * 0.5, h * 0.9, 10, w * 0.5, h * 0.65, w * 0.55);
        const baseHeatAlpha = heat * 0.3;
        underGlow.addColorStop(0, `rgba(251,113,133,${(baseHeatAlpha + pulseAmt) * (extreme > 0.2 ? 2 : 1)})`);
        underGlow.addColorStop(0.3, `rgba(249,115,22,${(heat * 0.18 + pulseAmt) * (extreme > 0.2 ? 1.5 : 1)})`);
        underGlow.addColorStop(0.7, `rgba(124,45,18,${heat * 0.08})`);
        underGlow.addColorStop(1, 'rgba(2,6,23,0)');
        ctx.fillStyle = underGlow;
        ctx.fillRect(0, 0, w, h);

        // Layer 4: Extreme heat - chromatic aberration bands
        if (extreme > 0.15) {
          ctx.globalAlpha = extreme * 0.25;
          for (let i = 0; i < 8; i++) {
            const y = h * (0.1 + i * 0.1) + Math.sin(t * 2 + i * 1.5) * 15;
            const bandHeight = 3 + extreme * 4;
            const colorIdx = i % 4;
            const colors = [
              'rgba(255,247,237,0.12)',
              'rgba(253,186,116,0.08)',
              'rgba(251,191,36,0.06)',
              'rgba(251,113,133,0.05)'
            ];
            ctx.fillStyle = colors[colorIdx];
            ctx.fillRect(0, y, w, bandHeight);
          }
        }

        // Layer 5: Molten pool at extreme heat
        if (extreme > 0.4) {
          ctx.save();
          const moltenY = h * 0.75;
          const moltenH = h * 0.25;
          
          for (let i = 0; i < 3; i++) {
            const poolGrad = ctx.createLinearGradient(0, moltenY, 0, h);
            poolGrad.addColorStop(0, `rgba(255,247,237,${0.2 + i * 0.05})`);
            poolGrad.addColorStop(0.3, `rgba(253,186,116,${0.25 + i * 0.05})`);
            poolGrad.addColorStop(0.7, `rgba(251,113,133,${0.15})`);
            poolGrad.addColorStop(1, 'rgba(2,6,23,0)');
            ctx.fillStyle = poolGrad;
            
            ctx.beginPath();
            ctx.moveTo(w * 0.1, moltenY + i * 8);
            for (let x = w * 0.1; x <= w * 0.9; x += 3) {
              const wave = Math.sin(x * 0.02 + t * 2 + i * 2) * 4;
              ctx.lineTo(x, moltenY + i * 8 + wave);
            }
            ctx.lineTo(w * 0.9, h);
            ctx.lineTo(w * 0.1, h);
            ctx.closePath();
            ctx.fill();
          }
          
          // Molten surface highlights
          for (let i = 0; i < 6; i++) {
            const hx = w * (0.15 + i * 0.13) + Math.sin(t * 1.5 + i) * 20;
            const hy = moltenY + 5 + Math.sin(t * 1.8 + i * 0.7) * 4;
            const hw = 25 + Math.sin(t + i * 2) * 12;
            ctx.beginPath();
            ctx.ellipse(hx, hy, hw, 2, 0, 0, TAU);
            ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.sin(t * 2.5 + i) * 0.05})`;
            ctx.fill();
          }
          
          ctx.restore();
        }

        ctx.restore();
      }

      // ── PRESSURE EFFECTS ──
      if (compression > 0.08) {
        ctx.save();
        ctx.globalAlpha = compression * 0.5;

        const ringCount = 5 + Math.floor(compression * 4);
        for (let i = 0; i < ringCount; i++) {
          const maxR = Math.max(w, h) * 0.52;
          const r = maxR * (0.2 + (i / ringCount) * 0.7);
          const pulse = Math.sin(t * 1.5 + i * 0.8) * 0.03;
          const alpha = (0.08 + (1 - i / ringCount) * 0.12) * compression;

          ctx.beginPath();
          ctx.arc(w / 2, h / 2, r * (1 + pulse), 0, TAU);
          ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
          ctx.lineWidth = 1.5 + compression * 2;
          ctx.stroke();
        }

        const stressGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.55);
        stressGrad.addColorStop(0, 'rgba(2,6,23,0)');
        stressGrad.addColorStop(0.75, `rgba(139,92,246,${compression * 0.08})`);
        stressGrad.addColorStop(1, `rgba(167,139,250,${compression * 0.2})`);
        ctx.fillStyle = stressGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
      }

      if (vacuum > 0.08) {
        ctx.save();
        ctx.globalAlpha = vacuum * 0.4;

        const hazeGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.6);
        hazeGrad.addColorStop(0, `rgba(148,163,184,${vacuum * 0.1})`);
        hazeGrad.addColorStop(0.5, 'rgba(15,23,42,0)');
        hazeGrad.addColorStop(1, `rgba(100,116,139,${vacuum * 0.15})`);
        ctx.fillStyle = hazeGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
      }

      // ── CAUSTICS (light refraction patterns) ──
      {
        ctx.save();
        ctx.globalAlpha = 0.04 + heat * 0.03 + compression * 0.02;
        ctx.globalCompositeOperation = 'screen';
        const causticScale = 0.008;
        const causticSpeed = 0.4;

        for (let y = 0; y < h; y += 8) {
          for (let x = 0; x < w; x += 8) {
            const n1 = fbm(x * causticScale + t * causticSpeed, y * causticScale, 3);
            const n2 = fbm(x * causticScale - t * causticSpeed * 0.7, y * causticScale + 100, 3);
            const v = Math.abs(Math.sin(n1 * 12 + n2 * 8));
            if (v > 0.72) {
              const brightness = (v - 0.72) / 0.28;
              ctx.fillStyle = extreme > 0.2
                ? `rgba(253,186,116,${brightness * 0.12})`
                : heat > 0.1
                  ? `rgba(251,191,36,${brightness * 0.08})`
                  : `rgba(148,163,184,${brightness * 0.06})`;
              ctx.fillRect(x, y, 8, 8);
            }
          }
        }
        ctx.restore();
      }

      // ── ATMOSPHERIC GAS PARTICLES (500+) ──
      {
        ctx.save();
        const particleCount = 520;
        const speed = 1 + heat * 2.5 + extreme * 1.5 - compression * 0.3;
        const spread = 1.4 - compression * 0.7 + vacuum * 0.3;
        const jitter = compression * 28;
        const opacity = 0.15 + clamp(pressAtm / 7, 0, 1) * 0.4 + heat * 0.1;

        for (let i = 0; i < particleCount; i++) {
          const seed = particleSeed(i);
          const baseX = seed.x * w;
          const baseY = seed.y * h;

          const cx = lerp(baseX, w / 2, compression * 0.4);
          const cy = lerp(baseY, h / 2, compression * 0.4);

          const x = cx + Math.sin(t * speed + i * 1.9) * (18 + 28 * vacuum) * spread;
          const y = cy + Math.cos(t * speed * 0.8 + i * 1.3) * (14 + 22 * vacuum) * spread + Math.sin(t * 18 + i) * jitter * 0.3;

          const size = 1 + (i % 8) * 0.5 + extreme * 2;
          const hue = extreme > 0.35 ? (i % 3 === 0 ? 30 : 0) : coldness > 0.3 ? 190 : heat > 0.1 ? 20 : 170;
          const sat = 50 + heat * 30;
          const light = extreme > 0.35 ? 85 : 50 + heat * 20;

          ctx.fillStyle = `hsla(${hue},${sat}%,${light}%,${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, TAU);
          ctx.fill();

          // Glow on extreme particles
          if (extreme > 0.3 && i % 5 === 0) {
            ctx.fillStyle = `rgba(255,247,237,${extreme * 0.12})`;
            ctx.beginPath();
            ctx.arc(x, y, size * 3.5, 0, TAU);
            ctx.fill();
          }
        }

        // Pressure concentration glow
        if (compression > 0.2) {
          const concGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.min(w, h) * 0.4);
          concGrad.addColorStop(0, `rgba(167,139,250,${compression * 0.12})`);
          concGrad.addColorStop(1, 'rgba(2,6,23,0)');
          ctx.fillStyle = concGrad;
          ctx.fillRect(0, 0, w, h);
        }

        ctx.restore();
      }

      // ── PRODUCT / ELEMENT VISUALS ──
      if (hasMatter) {
        // Selected elements: clean sample orbs
        selected.forEach((element, index) => {
          const orbitRadius = 55 + index * 20;
          const angle = t * 0.5 + index * TAU / Math.max(1, selected.length);
          const x = w / 2 + Math.cos(angle) * orbitRadius;
          const y = h / 2 + Math.sin(angle * 1.12) * orbitRadius * 0.65;

          // Outer glow
          const glow = ctx.createRadialGradient(x, y, 6, x, y, 48);
          glow.addColorStop(0, rgba(element.tone, 0.4));
          glow.addColorStop(1, 'rgba(2,6,23,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, 48, 0, TAU);
          ctx.fill();

          // Core orb
          const orb = ctx.createRadialGradient(x - 8, y - 10, 3, x, y, 28);
          orb.addColorStop(0, '#ffffff');
          orb.addColorStop(0.2, element.tone);
          orb.addColorStop(0.8, rgba(element.tone, 0.7));
          orb.addColorStop(1, rgba(element.tone, 0.1));
          ctx.fillStyle = orb;
          ctx.beginPath();
          ctx.arc(x, y, 28, 0, TAU);
          ctx.fill();

          // Symbol
          ctx.fillStyle = '#fff';
          ctx.font = '800 18px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.symbol, x, y);
        });

        // ── PRODUCT SCENES ──
        if (hasProducts) {
          // Water / ice / steam
          const water = matterStates.find(s => s.id === 'H2O');
          if (water) {
            if (water.phase === 'frozen' || water.phase === 'solid') {
              for (let i = 0; i < 14; i++) {
                const seed = particleSeed(i + 800);
                const cx = w * (0.2 + seed.x * 0.6);
                const cy = h * (0.55 + seed.y * 0.25);
                const size = 16 + seed.x * 24;
                const rot = t * 0.12 + i * 0.5;

                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(rot);

                ctx.beginPath();
                for (let j = 0; j < 6; j++) {
                  const a = (j / 6) * TAU - Math.PI / 2;
                  const px = Math.cos(a) * size;
                  const py = Math.sin(a) * size;
                  if (j === 0) ctx.moveTo(px, py);
                  else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(186,230,253,0.25)';
                ctx.fill();
                ctx.strokeStyle = `rgba(219,234,254,${0.4 + Math.sin(t + i) * 0.15})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                for (let j = 0; j < 6; j++) {
                  const a = (j / 6) * TAU - Math.PI / 2;
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
                  ctx.strokeStyle = 'rgba(186,230,253,0.18)';
                  ctx.lineWidth = 0.8;
                  ctx.stroke();
                }

                ctx.restore();
              }

              const frostGrad = ctx.createRadialGradient(w / 2, h * 0.7, 20, w / 2, h * 0.65, w * 0.35);
              frostGrad.addColorStop(0, 'rgba(219,234,254,0.18)');
              frostGrad.addColorStop(1, 'rgba(2,6,23,0)');
              ctx.fillStyle = frostGrad;
              ctx.fillRect(0, 0, w, h);

            } else if (water.phase === 'liquid' || water.phase === 'melting') {
              const waterY = h * 0.72;
              const waterH = h * 0.22;

              ctx.beginPath();
              ctx.moveTo(w * 0.12, waterY);
              for (let x = w * 0.12; x <= w * 0.88; x += 4) {
                const waveY = waterY + Math.sin(x * 0.02 + t * 1.8) * 4 + Math.sin(x * 0.035 + t * 2.3) * 2;
                ctx.lineTo(x, waveY);
              }
              ctx.lineTo(w * 0.88, h);
              ctx.lineTo(w * 0.12, h);
              ctx.closePath();

              const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
              waterGrad.addColorStop(0, 'rgba(96,165,250,0.45)');
              waterGrad.addColorStop(0.3, 'rgba(59,130,246,0.55)');
              waterGrad.addColorStop(0.7, 'rgba(14,116,144,0.5)');
              waterGrad.addColorStop(1, 'rgba(13,148,136,0.35)');
              ctx.fillStyle = waterGrad;
              ctx.fill();

              for (let i = 0; i < 5; i++) {
                const rx = w * (0.2 + i * 0.13) + Math.sin(t * 1.2 + i) * 15;
                const ry = waterY + 4 + Math.sin(t * 1.5 + i * 0.8) * 3;
                const rw = 30 + Math.sin(t + i * 2) * 10;
                ctx.beginPath();
                ctx.ellipse(rx, ry, rw, 2, 0, 0, TAU);
                ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.sin(t * 2 + i) * 0.08})`;
                ctx.fill();
              }

            } else {
              ctx.save();
              const steamCount = 18;
              for (let i = 0; i < steamCount; i++) {
                const seed = particleSeed(i + 900);
                const baseX = w * (0.25 + seed.x * 0.5);
                const speed = 1.5 + seed.y * 1.2;
                const drift = Math.sin(t * speed + seed.x * 8) * 30;
                const rise = ((t * speed * 40 + seed.y * h * 2) % (h * 0.7));
                const py = h - rise;
                const px = baseX + drift;
                const size = 20 + seed.x * 40;
                const alpha = clamp(1 - rise / (h * 0.7), 0, 1) * 0.2;

                const steamGrad = ctx.createRadialGradient(px, py, 2, px, py, size);
                steamGrad.addColorStop(0, `rgba(219,234,254,${alpha})`);
                steamGrad.addColorStop(1, 'rgba(2,6,23,0)');
                ctx.fillStyle = steamGrad;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, TAU);
                ctx.fill();
              }
              ctx.restore();
            }
          }

          // Salt crystals
          if (productSet.has('NaCl') || productSet.has('KCl') || productSet.has('CaCl2')) {
            for (let i = 0; i < 22; i++) {
              const seed = particleSeed(i + 1000);
              const cx = w * (0.25 + seed.x * 0.5);
              const cy = h * (0.4 + seed.y * 0.3);
              const size = 7 + seed.x * 16;
              const rot = Math.PI / 4 + Math.sin(t * 0.5 + i) * 0.08;
              const pulse = 1 + Math.sin(t * 2 + i * 0.7) * 0.06;

              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(rot);
              ctx.scale(pulse, pulse);

              ctx.fillStyle = `rgba(240,249,255,${0.25 + seed.y * 0.2})`;
              ctx.fillRect(-size / 2, -size / 2, size, size);

              ctx.strokeStyle = `rgba(125,211,252,${0.3 + Math.sin(t + i) * 0.1})`;
              ctx.lineWidth = 1.2;
              ctx.strokeRect(-size / 2, -size / 2, size, size);

              ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.sin(t * 1.5 + i * 1.3) * 0.04})`;
              ctx.fillRect(-size / 2, -size / 2, size * 0.4, size * 0.6);

              ctx.restore();
            }
          }

          // Rust bloom
          if (productSet.has('Fe2O3')) {
            for (let i = 0; i < 26; i++) {
              const seed = particleSeed(i + 1100);
              const cx = w * (0.18 + seed.x * 0.64);
              const cy = h * (0.5 + seed.y * 0.35);
              const size = 12 + seed.x * 28;
              const pulse = 0.85 + Math.sin(t * 0.8 + i * 0.5) * 0.15;

              const rustGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, size * pulse);
              rustGrad.addColorStop(0, 'rgba(254,215,170,0.5)');
              rustGrad.addColorStop(0.4, 'rgba(194,65,12,0.4)');
              rustGrad.addColorStop(1, 'rgba(124,45,18,0.1)');
              ctx.fillStyle = rustGrad;
              ctx.beginPath();
              ctx.ellipse(cx, cy, size * pulse, size * 0.6 * pulse, seed.x * Math.PI, 0, TAU);
              ctx.fill();
            }
          }

          // Alloy / molten metal
          if (result.reactionType === 'alloy' || productSet.has('Brass alloy') || productSet.has('Steel alloy')) {
            const cx = w / 2;
            const cy = h * 0.7;
            const rw = w * 0.22;
            const rh = h * 0.09;

            ctx.beginPath();
            for (let i = 0; i <= 48; i++) {
              const a = (i / 48) * TAU;
              const wobble = 1 + Math.sin(a * 3 + t * 2.2) * 0.04 + Math.cos(a * 5 - t * 1.5) * 0.025;
              const px = cx + Math.cos(a) * rw * wobble;
              const py = cy + Math.sin(a) * rh * wobble;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            const moltenGrad = ctx.createRadialGradient(cx - 20, cy - 15, 5, cx, cy, rw);
            moltenGrad.addColorStop(0, '#fff7ad');
            moltenGrad.addColorStop(0.3, '#fb923c');
            moltenGrad.addColorStop(0.7, '#c2410c');
            moltenGrad.addColorStop(1, 'rgba(124,45,18,0.2)');
            ctx.fillStyle = moltenGrad;
            ctx.fill();

            for (let i = 0; i < 4; i++) {
              const sx = cx + Math.sin(t * 1.5 + i * 1.2) * rw * 0.5;
              const sy = cy + Math.cos(t * 1.8 + i) * rh * 0.3;
              ctx.beginPath();
              ctx.ellipse(sx, sy, 12 + Math.sin(t + i) * 4, 3, 0, 0, TAU);
              ctx.fillStyle = `rgba(255,247,237,${0.15 + Math.sin(t * 2 + i) * 0.08})`;
              ctx.fill();
            }
          }

          // Flare / energetic reactions
          if (result.animation === 'flame' || result.animation === 'storm' || result.animation === 'spark') {
            const flashIntensity = 0.4 + Math.sin(t * 6) * 0.2 + Math.sin(t * 9.7) * 0.1;
            const flashGrad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, 180);
            flashGrad.addColorStop(0, `rgba(255,255,255,${flashIntensity * 0.8})`);
            flashGrad.addColorStop(0.2, `rgba(253,230,138,${flashIntensity * 0.5})`);
            flashGrad.addColorStop(0.5, `rgba(251,191,36,${flashIntensity * 0.2})`);
            flashGrad.addColorStop(1, 'rgba(2,6,23,0)');
            ctx.fillStyle = flashGrad;
            ctx.fillRect(0, 0, w, h);

            ctx.save();
            for (let i = 0; i < 22; i++) {
              const seed = particleSeed(i + 1200);
              const angle = seed.x * TAU + t * (2 + seed.y * 3);
              const dist = 40 + ((t * 80 + seed.y * 200) % 200);
              const sx = w / 2 + Math.cos(angle) * dist;
              const sy = h / 2 + Math.sin(angle) * dist;
              const sparkSize = 1.5 + seed.x * 2.5;
              const alpha = clamp(1 - dist / 240, 0, 1) * (0.6 + Math.sin(t * 8 + i) * 0.3);

              ctx.fillStyle = `rgba(255,247,237,${alpha})`;
              ctx.beginPath();
              ctx.arc(sx, sy, sparkSize, 0, TAU);
              ctx.fill();

              ctx.beginPath();
              ctx.moveTo(sx, sy);
              ctx.lineTo(sx - Math.cos(angle) * 12, sy - Math.sin(angle) * 12);
              ctx.strokeStyle = `rgba(253,186,116,${alpha * 0.5})`;
              ctx.lineWidth = sparkSize * 0.6;
              ctx.stroke();
            }
            ctx.restore();

            const wavePhase = (t * 2) % 3;
            if (wavePhase < 1.5) {
              const waveR = wavePhase * 160;
              const waveAlpha = clamp(1 - wavePhase / 1.5, 0, 1) * 0.35;
              ctx.beginPath();
              ctx.arc(w / 2, h / 2, waveR, 0, TAU);
              ctx.strokeStyle = `rgba(255,255,255,${waveAlpha})`;
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
        }
      }

      // ── EXTERIOR GLASS HEAT STRESS (hot chamber) ──
      if (heat > 0.2) {
        ctx.save();
        ctx.globalAlpha = heat * 0.15;
        // Thermal stress lines on glass surface
        for (let i = 0; i < 8; i++) {
          const seed = particleSeed(i + 1400);
          const x1 = seed.x * w;
          const y1 = h * (0.1 + seed.y * 0.15);
          const x2 = x1 + (seed.x - 0.5) * 60;
          const y2 = y1 + 40 + seed.y * 30;
          const sway = Math.sin(t * 0.6 + i) * 8;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(x1 + sway, (y1 + y2) / 2, x2, y2);
          ctx.strokeStyle = `rgba(251,113,133,${0.15 + seed.x * 0.1})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Heat shimmer on glass surface
        const shimmerGrad = ctx.createLinearGradient(0, 0, 0, h * 0.15);
        shimmerGrad.addColorStop(0, `rgba(251,113,133,${heat * 0.08})`);
        shimmerGrad.addColorStop(1, 'rgba(2,6,23,0)');
        ctx.fillStyle = shimmerGrad;
        ctx.fillRect(0, 0, w, h * 0.15);

        ctx.restore();
      }

      // ── CHAMBER EDGE VIGNETTE ──
      const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.62);
      vignette.addColorStop(0, 'rgba(2,6,23,0)');
      vignette.addColorStop(0.8, 'rgba(2,6,23,0.15)');
      vignette.addColorStop(1, 'rgba(2,6,23,0.5)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // ── SUBTLE NOISE GRAIN ──
      ctx.save();
      ctx.globalAlpha = 0.035;
      ctx.globalCompositeOperation = 'overlay';
      const grainSize = 4;
      for (let y = 0; y < h; y += grainSize) {
        for (let x = 0; x < w; x += grainSize) {
          const n = noise2D(x * 0.5 + t * 7, y * 0.5);
          if (n > 0.55) {
            ctx.fillStyle = n > 0.75 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
            ctx.fillRect(x, y, grainSize, grainSize);
          }
        }
      }
      ctx.restore();

      raf = requestAnimationFrame(draw);
    }

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [environment, matterStates, products, result, runId, selected]);

  return <canvas ref={canvasRef} className="chamber-canvas" aria-hidden="true" />;
}

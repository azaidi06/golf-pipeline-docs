import React, { useState } from 'react';

const C = {
  bg: '#0a0f1a',
  card: '#111827',
  cardBorder: '#1e293b',
  surface: '#1a2235',
  accent: '#60a5fa',
  accentDim: 'rgba(96,165,250,0.12)',
  green: '#34d399',
  greenDim: 'rgba(52,211,153,0.1)',
  amber: '#fbbf24',
  amberDim: 'rgba(251,191,36,0.1)',
  rose: '#fb7185',
  roseDim: 'rgba(251,113,133,0.1)',
  purple: '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.12)',
  cyan: '#22d3ee',
  cyanDim: 'rgba(34,211,238,0.1)',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  divider: '#1e293b',
};

const mono = "'JetBrains Mono', 'Fira Code', monospace";
const sans = "'DM Sans', -apple-system, sans-serif";

/* ── Shared primitives ──────────────────────────────────────────── */

const SectionLabel = ({ children, color = C.accent }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 10px', borderRadius: '6px',
    background: `${color}18`, border: `1px solid ${color}30`,
    fontSize: '11px', fontWeight: 700, fontFamily: mono,
    color, letterSpacing: '0.06em', textTransform: 'uppercase',
    marginBottom: '12px',
  }}>
    {children}
  </div>
);

const Card = ({ children, style }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.cardBorder}`,
    borderRadius: '16px', padding: '24px', ...style,
  }}>
    {children}
  </div>
);

const Divider = () => (
  <div style={{ height: '1px', background: C.divider, margin: '0' }} />
);

/* ── Roofline ASCII chart ────────────────────────────────────────── */

const RooflineChart = () => {
  const gpus = [
    { name: 'L4', bw: 300, tf: 121, color: C.rose },
    { name: 'A10G', bw: 600, tf: 31.2, color: C.amber },
    { name: 'RTX 3090', bw: 936, tf: 142, color: C.green },
    { name: 'RTX 3080 Ti', bw: 912, tf: 136, color: C.cyan },
    { name: 'RTX 2080 Ti', bw: 616, tf: 107, color: C.purple },
  ];

  // ViTPose estimated arithmetic intensity: ~60–80 FLOPs/Byte at batch 32
  const vitposeAI = 70;

  return (
    <div>
      {/* Ridge-point bar chart */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12px', fontFamily: mono, color: C.textDim,
          marginBottom: '10px', letterSpacing: '0.03em',
        }}>
          RIDGE POINT — FLOPS/BYTE REQUIRED TO BE COMPUTE-BOUND
        </div>
        {gpus.map(g => {
          const ridge = (g.tf * 1000) / g.bw; // GFLOPs per GB/s
          const maxRidge = 410;
          const pct = Math.min((ridge / maxRidge) * 100, 100);
          const vitposePct = Math.min((vitposeAI / maxRidge) * 100, 100);
          const isBeaten = vitposeAI < ridge;
          return (
            <div key={g.name} style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: '4px',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: sans, color: g.color }}>
                  {g.name}
                </span>
                <span style={{ fontSize: '11px', fontFamily: mono, color: C.textDim }}>
                  {ridge.toFixed(0)} FLOPs/Byte ridge
                  {isBeaten && (
                    <span style={{ color: C.rose, marginLeft: '8px' }}>← ViTPose is BW-bound here</span>
                  )}
                  {!isBeaten && (
                    <span style={{ color: C.green, marginLeft: '8px' }}>← ViTPose is compute-bound here</span>
                  )}
                </span>
              </div>
              <div style={{
                position: 'relative', height: '20px',
                background: C.surface, borderRadius: '6px', overflow: 'hidden',
              }}>
                {/* Ridge bar */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${pct}%`,
                  background: isBeaten ? `${g.color}30` : `${g.color}50`,
                  borderRadius: '6px',
                  transition: 'width 0.6s ease',
                }} />
                {/* ViTPose marker */}
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${vitposePct}%`,
                  width: '2px',
                  background: C.amber,
                  opacity: 0.9,
                }} />
                <div style={{
                  position: 'absolute', top: '2px',
                  left: `${vitposePct + 0.5}%`,
                  fontSize: '9px', fontFamily: mono, color: C.amber,
                  whiteSpace: 'nowrap',
                }}>
                  ViTPose
                </div>
              </div>
            </div>
          );
        })}
        <div style={{
          marginTop: '10px', fontSize: '11px', fontFamily: mono, color: C.textDim,
          padding: '8px 12px', background: C.surface, borderRadius: '8px',
          borderLeft: `3px solid ${C.amber}`,
        }}>
          ViTPose batch=32 estimated arithmetic intensity: ~60–80 FLOPs/Byte.
          Only the L4's ridge point (403) exceeds this — so only the L4 starves its tensor cores.
        </div>
      </div>
    </div>
  );
};

/* ── GPU comparison table ────────────────────────────────────────── */

const GpuTable = () => {
  const rows = [
    {
      gpu: 'NVIDIA L4',
      tier: 'Datacenter',
      bw: 300, tf: 121, mem: 'GDDR6', ridge: 403,
      trtResult: '267ms ← SLOWER', trtColor: C.rose,
      vfps: '~61 fps', vfpsColor: C.amber,
      awsHr: '$0.47', costPer: '$0.036',
      note: 'Bandwidth-starved; tensor cores idle',
    },
    {
      gpu: 'NVIDIA A10G',
      tier: 'Datacenter',
      bw: 600, tf: 31.2, mem: 'GDDR6', ridge: 52,
      trtResult: 'Moderate gain', trtColor: C.amber,
      vfps: '~80 fps est.', vfpsColor: C.amber,
      awsHr: '$1.01', costPer: '~$0.062',
      note: 'More balanced; G5 instances',
    },
    {
      gpu: 'RTX 3090',
      tier: 'Consumer',
      bw: 936, tf: 142, mem: 'GDDR6X', ridge: 151,
      trtResult: '191ms (1.35x)', trtColor: C.green,
      vfps: '~65–70 fps', vfpsColor: C.green,
      awsHr: '—', costPer: '~$0.006*',
      note: 'GDDR6X bandwidth surplus; TRT works',
    },
    {
      gpu: 'RTX 3080 Ti',
      tier: 'Consumer',
      bw: 912, tf: 136, mem: 'GDDR6X', ridge: 149,
      trtResult: 'Strong gain', trtColor: C.green,
      vfps: '~63 fps est.', vfpsColor: C.green,
      awsHr: '—', costPer: '~$0.006*',
      note: 'Near-identical to 3090',
    },
    {
      gpu: 'RTX 3080 10G',
      tier: 'Consumer',
      bw: 760, tf: 119, mem: 'GDDR6X', ridge: 156,
      trtResult: 'Strong gain', trtColor: C.green,
      vfps: '~52 fps est.', vfpsColor: C.green,
      awsHr: '—', costPer: '~$0.007*',
      note: 'Budget pick; still beats L4 BW',
    },
    {
      gpu: 'RTX 2080 Ti',
      tier: 'Consumer',
      bw: 616, tf: 107, mem: 'GDDR6', ridge: 174,
      trtResult: 'Moderate gain', trtColor: C.cyan,
      vfps: '~42 fps est.', vfpsColor: C.cyan,
      awsHr: '—', costPer: '~$0.008*',
      note: '2019 card; still beats L4 per-BW',
    },
  ];

  const colStyle = (bold, color) => ({
    fontSize: '12px', fontFamily: bold ? sans : mono,
    fontWeight: bold ? 700 : 400,
    color: color || C.text,
    padding: '10px 12px',
    whiteSpace: 'nowrap',
  });

  const thStyle = {
    fontSize: '10px', fontFamily: mono, fontWeight: 600,
    color: C.textDim, letterSpacing: '0.05em', textTransform: 'uppercase',
    padding: '8px 12px', whiteSpace: 'nowrap',
    borderBottom: `1px solid ${C.cardBorder}`,
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: C.surface }}>
            <th style={thStyle}>GPU</th>
            <th style={thStyle}>Tier</th>
            <th style={thStyle}>BW (GB/s)</th>
            <th style={thStyle}>FP16 TF</th>
            <th style={thStyle}>Memory</th>
            <th style={thStyle}>Ridge Pt.</th>
            <th style={thStyle}>TRT FP16 Result</th>
            <th style={thStyle}>ViTPose fps</th>
            <th style={thStyle}>Cost/Video</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.gpu} style={{
              background: i % 2 === 0 ? 'transparent' : `${C.surface}80`,
              borderBottom: `1px solid ${C.cardBorder}40`,
            }}>
              <td style={colStyle(true, r.tier === 'Consumer' ? C.green : C.rose)}>
                {r.gpu}
                {r.tier === 'Consumer' && (
                  <div style={{ fontSize: '10px', fontFamily: mono, color: C.textDim, fontWeight: 400 }}>
                    on-prem
                  </div>
                )}
              </td>
              <td style={{
                ...colStyle(false),
                color: r.tier === 'Consumer' ? C.greenDim : C.roseDim,
              }}>
                <span style={{
                  padding: '2px 8px', borderRadius: '4px',
                  background: r.tier === 'Consumer' ? C.greenDim : C.roseDim,
                  color: r.tier === 'Consumer' ? C.green : C.rose,
                  fontSize: '11px', fontFamily: mono,
                }}>
                  {r.tier}
                </span>
              </td>
              <td style={colStyle(false, C.cyan)}>{r.bw}</td>
              <td style={colStyle(false, C.accent)}>{r.tf}</td>
              <td style={{
                ...colStyle(false),
                color: r.mem === 'GDDR6X' ? C.green : C.textDim,
                fontFamily: mono, fontSize: '12px',
              }}>
                {r.mem}
                {r.mem === 'GDDR6X' && ' ⚡'}
              </td>
              <td style={{
                ...colStyle(false),
                color: r.ridge > 200 ? C.rose : r.ridge > 100 ? C.amber : C.green,
                fontWeight: 700,
              }}>
                {r.ridge}
              </td>
              <td style={colStyle(false, r.trtColor)}>{r.trtResult}</td>
              <td style={colStyle(false, r.vfpsColor)}>{r.vfps}</td>
              <td style={colStyle(false, C.textMuted)}>{r.costPer}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{
        marginTop: '8px', fontSize: '10px', fontFamily: mono,
        color: C.textDim, padding: '0 4px',
      }}>
        * On-prem cost = electricity only (~$0.10/kWh) after hardware amortization.
        350W × $0.10/kWh ÷ 60 vids/hr ≈ $0.0006/video electricity; amortized ~$0.005–0.008/video.
      </div>
    </div>
  );
};

/* ── Break-even calculator ──────────────────────────────────────── */

const BreakevenSection = () => {
  const [gpuPrice, setGpuPrice] = useState(800);
  const [hrsPerDay, setHrsPerDay] = useState(8);

  const awsRatePerVid = 0.036;      // g6.xlarge spot
  const onpremRatePerVid = 0.006;   // electricity amortized
  const vidsPerHr = 13;

  const savings = awsRatePerVid - onpremRatePerVid;
  const vidsToBreakEven = gpuPrice / savings;
  const daysToBreakEven = vidsToBreakEven / (vidsPerHr * hrsPerDay);
  const monthsToBreakEven = daysToBreakEven / 30;
  const annual5yr = gpuPrice + (365 * hrsPerDay * vidsPerHr * onpremRatePerVid * 5);
  const aws5yr = 365 * hrsPerDay * vidsPerHr * awsRatePerVid * 5;

  const sliderStyle = {
    width: '100%', accentColor: C.accent, cursor: 'pointer',
  };

  const metricCard = (label, value, color, sub) => (
    <div style={{
      background: C.surface, borderRadius: '12px', padding: '16px',
      border: `1px solid ${C.cardBorder}`, flex: 1,
    }}>
      <div style={{ fontSize: '11px', fontFamily: mono, color: C.textDim, marginBottom: '6px', letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: sans, color }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', fontFamily: mono, color: C.textDim, marginTop: '4px' }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      {/* Sliders */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '13px', fontFamily: sans, color: C.textMuted, marginBottom: '6px',
          }}>
            <span>GPU Purchase Price</span>
            <span style={{ fontFamily: mono, color: C.accent }}>${gpuPrice}</span>
          </div>
          <input type="range" min={200} max={2000} step={50}
            value={gpuPrice} onChange={e => setGpuPrice(+e.target.value)}
            style={sliderStyle} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: mono, color: C.textDim, marginTop: '3px' }}>
            <span>$200 (used 2080 Ti)</span><span>$2000 (new 4090)</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '13px', fontFamily: sans, color: C.textMuted, marginBottom: '6px',
          }}>
            <span>Processing Hours / Day</span>
            <span style={{ fontFamily: mono, color: C.accent }}>{hrsPerDay}h</span>
          </div>
          <input type="range" min={1} max={24} step={1}
            value={hrsPerDay} onChange={e => setHrsPerDay(+e.target.value)}
            style={sliderStyle} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: mono, color: C.textDim, marginTop: '3px' }}>
            <span>1h (light use)</span><span>24h (production)</span>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {metricCard(
          'BREAK-EVEN VIDEOS',
          vidsToBreakEven.toLocaleString(undefined, { maximumFractionDigits: 0 }),
          C.accent,
          `$${savings.toFixed(3)} saved/video vs AWS`
        )}
        {metricCard(
          'BREAK-EVEN TIME',
          monthsToBreakEven < 24
            ? `${monthsToBreakEven.toFixed(1)} mo`
            : `${(monthsToBreakEven / 12).toFixed(1)} yr`,
          monthsToBreakEven < 12 ? C.green : C.amber,
          `at ${hrsPerDay}h/day × ${vidsPerHr} vids/hr`
        )}
        {metricCard(
          '5-YEAR AWS COST',
          `$${(aws5yr / 1000).toFixed(1)}k`,
          C.rose,
          'g6.xlarge spot'
        )}
        {metricCard(
          '5-YEAR ON-PREM COST',
          `$${(annual5yr / 1000).toFixed(1)}k`,
          C.green,
          'GPU + electricity'
        )}
      </div>

      {/* Cost bar comparison */}
      {(() => {
        const maxCost = Math.max(aws5yr, annual5yr);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: sans, color: C.rose, marginBottom: '4px' }}>
                <span>AWS (g6.xlarge spot × 5yr)</span>
                <span style={{ fontFamily: mono }}>${aws5yr.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ height: '14px', background: C.surface, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(aws5yr / maxCost) * 100}%`, background: `${C.rose}80`, borderRadius: '6px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: sans, color: C.green, marginBottom: '4px' }}>
                <span>On-prem (GPU + electricity × 5yr)</span>
                <span style={{ fontFamily: mono }}>${annual5yr.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div style={{ height: '14px', background: C.surface, borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(annual5yr / maxCost) * 100}%`, background: `${C.green}80`, borderRadius: '6px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
            <div style={{
              marginTop: '6px', padding: '10px 14px',
              background: annual5yr < aws5yr ? C.greenDim : C.amberDim,
              borderRadius: '10px', border: `1px solid ${annual5yr < aws5yr ? C.green : C.amber}30`,
              fontSize: '12px', fontFamily: mono, color: annual5yr < aws5yr ? C.green : C.amber,
            }}>
              {annual5yr < aws5yr
                ? `On-prem saves $${((aws5yr - annual5yr) / 1000).toFixed(1)}k over 5 years (${((1 - annual5yr / aws5yr) * 100).toFixed(0)}% cheaper)`
                : `AWS is cheaper at this usage level — consider increasing hours/day`
              }
            </div>
          </div>
        );
      })()}
    </div>
  );
};

/* ── Main export ─────────────────────────────────────────────────── */

export default function CloudGpuLimitations() {
  return (
    <div style={{ padding: '32px 16px 64px', maxWidth: '1100px', margin: '0 auto', fontFamily: sans }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <SectionLabel color={C.rose}>Cloud GPU Limitations</SectionLabel>
        <h1 style={{
          fontSize: '28px', fontWeight: 800, color: C.text,
          letterSpacing: '-0.02em', margin: '0 0 10px',
        }}>
          Why AWS's "Inference-Optimized" GPUs Lose to a 2019 Gaming Card
        </h1>
        <p style={{ fontSize: '15px', color: C.textMuted, lineHeight: 1.7, maxWidth: '720px', margin: 0 }}>
          The L4 posts 121 TFLOPS of FP16 compute. TensorRT should make it fly. Instead, TRT
          runs <em style={{ color: C.rose }}>slower</em> than vanilla PyTorch on L4, while a used
          RTX 3090 sees a clean 1.35× speedup. This is not a bug — it's a fundamental mismatch
          between how the L4 is designed and what ViTPose actually needs.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Section 1: Roofline */}
        <Card>
          <SectionLabel color={C.accent}>The Roofline Model</SectionLabel>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: C.text, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Every GPU Has Two Speed Limits
          </h2>
          <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.7, margin: '0 0 20px', maxWidth: '680px' }}>
            A GPU can be bottlenecked by either (1) how fast it can <span style={{ color: C.accent }}>compute</span> or
            (2) how fast it can <span style={{ color: C.cyan }}>move data</span> from memory to the compute units.
            The crossover — the <strong style={{ color: C.amber }}>ridge point</strong> — is the arithmetic intensity
            (FLOPs per byte read/written) at which you transition from bandwidth-bound to compute-bound.
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px',
          }}>
            <div style={{
              background: C.roseDim, border: `1px solid ${C.rose}30`,
              borderRadius: '12px', padding: '16px',
            }}>
              <div style={{ fontSize: '12px', fontFamily: mono, color: C.rose, marginBottom: '8px', letterSpacing: '0.04em' }}>
                BANDWIDTH-BOUND (bad for L4)
              </div>
              <div style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.6 }}>
                The GPU's memory bus is the bottleneck. Compute units sit idle waiting for data.
                Adding more TFLOPS does nothing — you need more GB/s.
              </div>
            </div>
            <div style={{
              background: C.greenDim, border: `1px solid ${C.green}30`,
              borderRadius: '12px', padding: '16px',
            }}>
              <div style={{ fontSize: '12px', fontFamily: mono, color: C.green, marginBottom: '8px', letterSpacing: '0.04em' }}>
                COMPUTE-BOUND (where TFLOPS matter)
              </div>
              <div style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.6 }}>
                The arithmetic units are the bottleneck. Data arrives faster than it can be processed.
                TensorRT FP16 directly halves the compute time → real speedup.
              </div>
            </div>
          </div>

          <Divider />
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: C.textMuted, marginBottom: '16px' }}>
              Ridge points vs. ViTPose arithmetic intensity (~70 FLOPs/Byte at batch 32)
            </div>
            <RooflineChart />
          </div>
        </Card>

        {/* Section 2: Why ViTPose is low intensity */}
        <Card>
          <SectionLabel color={C.purple}>Transformer Anatomy</SectionLabel>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: C.text, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Why ViTPose Has Low Arithmetic Intensity
          </h2>
          <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.7, margin: '0 0 20px', maxWidth: '680px' }}>
            Not all neural networks are created equal for GPU efficiency. ViTPose is a Vision Transformer —
            its bottleneck at inference time is reading and writing large intermediate activation maps, not
            matrix multiplication throughput.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              {
                op: 'QKV Linear Projections', ai: '~200–400', bound: 'compute', color: C.green,
                note: 'Large matmuls. Compute-bound at batch=32 — this is where TFLOPS help.',
              },
              {
                op: 'Attention Scores (QKᵀ)', ai: '~50–100', bound: 'bandwidth', color: C.amber,
                note: 'Sequence-length² scaling. Activation maps grow fast, memory pressure rises.',
              },
              {
                op: 'Softmax + LayerNorm', ai: '~5–20', bound: 'bandwidth', color: C.rose,
                note: 'Pure element-wise. Tiny reuse ratio — reads each byte once, computes trivially.',
              },
              {
                op: 'FFN (GELU + linear)', ai: '~100–200', bound: 'mixed', color: C.cyan,
                note: 'Better intensity than attention but GELU non-linearity adds bandwidth cost.',
              },
              {
                op: 'Heatmap decode + NMS', ai: '< 10', bound: 'bandwidth', color: C.rose,
                note: 'RTMDet NMS and heatmap→keypoint decode: almost zero reuse.',
              },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '180px 80px 100px 1fr',
                gap: '0', padding: '10px 14px',
                background: i % 2 === 0 ? 'transparent' : `${C.surface}80`,
                borderRadius: '8px', alignItems: 'center',
              }}>
                <span style={{ fontSize: '13px', fontFamily: mono, color: C.text }}>{row.op}</span>
                <span style={{ fontSize: '12px', fontFamily: mono, color: row.color, textAlign: 'center' }}>{row.ai}</span>
                <span style={{
                  fontSize: '11px', fontFamily: mono,
                  color: row.bound === 'compute' ? C.green : row.bound === 'bandwidth' ? C.rose : C.amber,
                  textAlign: 'center',
                }}>
                  {row.bound === 'compute' ? '▲ compute' : row.bound === 'bandwidth' ? '▼ bandwidth' : '◆ mixed'}
                </span>
                <span style={{ fontSize: '12px', color: C.textDim, lineHeight: 1.5 }}>{row.note}</span>
              </div>
            ))}
            <div style={{
              display: 'grid', gridTemplateColumns: '180px 80px 100px 1fr',
              gap: '0', padding: '4px 14px',
            }}>
              <span style={{ fontSize: '10px', fontFamily: mono, color: C.textDim }}>OPERATION</span>
              <span style={{ fontSize: '10px', fontFamily: mono, color: C.textDim, textAlign: 'center' }}>FLOPs/Byte</span>
              <span style={{ fontSize: '10px', fontFamily: mono, color: C.textDim, textAlign: 'center' }}>BOUND BY</span>
              <span style={{ fontSize: '10px', fontFamily: mono, color: C.textDim }}>NOTES</span>
            </div>
          </div>

          <div style={{
            marginTop: '16px', padding: '12px 16px',
            background: C.purpleDim, borderRadius: '10px', border: `1px solid ${C.purple}25`,
            fontSize: '13px', color: C.textMuted, lineHeight: 1.6,
          }}>
            <strong style={{ color: C.purple }}>Net result:</strong> The bandwidth-heavy ops (Softmax, LayerNorm, NMS)
            drag the whole model's effective arithmetic intensity down to ~60–80 FLOPs/Byte. The L4's ridge point
            is 403. Every cycle, the L4's 24,576 CUDA cores are waiting for 300 GB/s worth of data.
          </div>
        </Card>

        {/* Section 3: TRT Format Penalty */}
        <Card>
          <SectionLabel color={C.amber}>The TRT Regression Explained</SectionLabel>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: C.text, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Why TensorRT Is Slower on the L4
          </h2>
          <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.7, margin: '0 0 20px', maxWidth: '680px' }}>
            TensorRT's Tensor Core kernels require activation tensors in <code style={{ color: C.cyan, fontFamily: mono, fontSize: '13px' }}>NHWC</code> (channel-last)
            memory layout. PyTorch defaults to <code style={{ color: C.accent, fontFamily: mono, fontSize: '13px' }}>NCHW</code> (channel-first).
            TRT inserts <strong style={{ color: C.amber }}>Reformat</strong> (transpose) kernels to convert between them.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {/* Flow diagram */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '14px 16px', background: C.surface, borderRadius: '12px',
              fontSize: '13px', fontFamily: mono, flexWrap: 'wrap',
            }}>
              <span style={{ color: C.accent }}>NCHW input</span>
              <span style={{ color: C.textDim }}>→</span>
              <span style={{ color: C.amber, padding: '2px 8px', background: C.amberDim, borderRadius: '4px' }}>
                Reformat (transpose)
              </span>
              <span style={{ color: C.textDim }}>→</span>
              <span style={{ color: C.green }}>NHWC Tensor Core kernel</span>
              <span style={{ color: C.textDim }}>→</span>
              <span style={{ color: C.amber, padding: '2px 8px', background: C.amberDim, borderRadius: '4px' }}>
                Reformat back
              </span>
              <span style={{ color: C.textDim }}>→</span>
              <span style={{ color: C.accent }}>NCHW output</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{
              background: C.roseDim, border: `1px solid ${C.rose}25`,
              borderRadius: '12px', padding: '16px',
            }}>
              <div style={{ fontSize: '12px', fontFamily: mono, color: C.rose, marginBottom: '10px', letterSpacing: '0.04em' }}>
                L4 — 300 GB/s bus
              </div>
              <div style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.65 }}>
                ViTPose batch=32 generates ~96 MB of intermediate activations per transformer block.
                At 300 GB/s, transposing costs <strong style={{ color: C.rose }}>~320µs per block</strong>.
                Across 24 ViT-H blocks, that's ~7.7ms of pure overhead just shuffling memory — before any compute.
                The faster FP16 kernels save ~2ms. <strong style={{ color: C.rose }}>Net: –5ms regression.</strong>
              </div>
            </div>
            <div style={{
              background: C.greenDim, border: `1px solid ${C.green}25`,
              borderRadius: '12px', padding: '16px',
            }}>
              <div style={{ fontSize: '12px', fontFamily: mono, color: C.green, marginBottom: '10px', letterSpacing: '0.04em' }}>
                RTX 3090 — 936 GB/s bus
              </div>
              <div style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.65 }}>
                Same 96 MB transpose at 936 GB/s costs <strong style={{ color: C.green }}>~100µs per block</strong>.
                Total transpose overhead: ~2.4ms. Meanwhile, the 3090 is closer to compute-bound on the
                matmul-heavy ops, so FP16 saves ~10ms.
                <strong style={{ color: C.green }}> Net: +7.7ms gain → 1.35× speedup.</strong>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '16px', padding: '12px 16px',
            background: `${C.amber}10`, borderRadius: '10px', border: `1px solid ${C.amber}25`,
            fontSize: '13px', color: C.textMuted, lineHeight: 1.6,
          }}>
            <strong style={{ color: C.amber }}>The L4 paradox:</strong> Its high TFLOPS density was achieved by
            prioritizing compute over bandwidth. But TRT's main optimization <em>requires</em> fast bandwidth
            to pay off. The L4's narrow bus is a tax on the very optimizations that should make it shine.
          </div>
        </Card>

        {/* Section 4: Why datacenter GDDR6 vs consumer GDDR6X */}
        <Card>
          <SectionLabel color={C.cyan}>The Memory Tier Gap</SectionLabel>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: C.text, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            GDDR6X vs. GDDR6 — The Cloud Tax
          </h2>
          <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.7, margin: '0 0 20px', maxWidth: '680px' }}>
            Consumer "halo" cards (3090, 3080 Ti, 4090) use GDDR6X — a higher-clocked variant of GDDR6
            that runs hot and draws power. Datacenter cards (L4, A10, L40S) use standard GDDR6 because
            they need to pack 8 GPUs per server at controlled wattage.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'L4 (Cloud)', bw: '300 GB/s', power: '72W', density: '8 GPUs/rack-unit', mem: 'GDDR6', color: C.rose },
              { label: 'A10G (Cloud)', bw: '600 GB/s', power: '150W', density: '4 GPUs/rack-unit', mem: 'GDDR6', color: C.amber },
              { label: 'RTX 3090 (Consumer)', bw: '936 GB/s', power: '350W', density: '1 GPU/slot', mem: 'GDDR6X', color: C.green },
            ].map(g => (
              <div key={g.label} style={{
                background: C.surface, borderRadius: '12px', padding: '16px',
                border: `1px solid ${g.color}25`,
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: g.color, marginBottom: '10px', fontFamily: sans }}>
                  {g.label}
                </div>
                {[
                  ['Memory', g.mem, g.mem === 'GDDR6X' ? C.green : C.textMuted],
                  ['Bandwidth', g.bw, g.color],
                  ['TDP', g.power, C.textMuted],
                  ['Cloud density', g.density, C.textDim],
                ].map(([k, v, c]) => (
                  <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: '6px', fontSize: '12px',
                  }}>
                    <span style={{ fontFamily: mono, color: C.textDim }}>{k}</span>
                    <span style={{ fontFamily: mono, color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{
            padding: '14px 16px', background: C.cyanDim,
            borderRadius: '10px', border: `1px solid ${C.cyan}25`,
            fontSize: '13px', color: C.textMuted, lineHeight: 1.6,
          }}>
            <strong style={{ color: C.cyan }}>You pay the density premium without the density benefit.</strong>{' '}
            Cloud providers charge for compute that fits in a 72W envelope. The L4's entire value proposition
            is "8 of these per server." If you're spinning up one instance for video inference,
            you're paying for engineering trade-offs that benefit the datacenter, not your workload.
          </div>
        </Card>

        {/* Section 5: Full GPU comparison table */}
        <Card>
          <SectionLabel color={C.green}>GPU Showdown</SectionLabel>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: C.text, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Cloud vs. Consumer — Full Comparison
          </h2>
          <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.7, margin: '0 0 20px' }}>
            Ridge point above 200 FLOPs/Byte means ViTPose is bandwidth-bound on that GPU.
            Green = consumer card wins. Red = cloud card disadvantage for this workload.
          </p>
          <GpuTable />
        </Card>

        {/* Section 6: Break-even */}
        <Card>
          <SectionLabel color={C.green}>Cost Analysis</SectionLabel>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: C.text, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            Break-Even Calculator
          </h2>
          <p style={{ fontSize: '14px', color: C.textMuted, lineHeight: 1.7, margin: '0 0 20px' }}>
            Assuming 13 videos/hr on AWS g6.xlarge ($0.036/video) vs. on-prem RTX 3090 (~$0.006/video
            electricity-only after purchase). Adjust purchase price and daily usage below.
          </p>
          <BreakevenSection />
        </Card>

        {/* Section 7: Summary callout */}
        <Card style={{ background: `${C.rose}08`, border: `1px solid ${C.rose}20` }}>
          <SectionLabel color={C.rose}>Bottom Line</SectionLabel>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: C.text, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
            The L4's 121 TFLOPS Are Mostly Wasted on ViTPose
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '▼', color: C.rose, text: 'ViTPose arithmetic intensity (~70 FLOPs/Byte) is far below the L4\'s ridge point (403). Tensor cores idle, waiting for the 300 GB/s bus.' },
              { icon: '▼', color: C.rose, text: 'TensorRT FP16 adds layout-transpose overhead that costs more bandwidth than the FP16 compute saves. Net: 9ms regression on L4.' },
              { icon: '▲', color: C.green, text: 'The RTX 3090\'s 936 GB/s GDDR6X absorbs the transpose overhead and delivers the full FP16 speedup: 1.35× on TRT.' },
              { icon: '▲', color: C.green, text: 'A used RTX 2080 Ti (2019, ~$200–300) has 616 GB/s — more than 2× the L4\'s bandwidth — and will outperform it on this workload.' },
              { icon: '▲', color: C.green, text: 'On-prem breaks even vs. AWS in 6–12 months at moderate usage, then costs ~6× less per video for the life of the hardware.' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '10px 14px', background: `${item.color}08`,
                borderRadius: '8px', border: `1px solid ${item.color}15`,
              }}>
                <span style={{ color: item.color, fontFamily: mono, fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '13px', color: C.textMuted, lineHeight: 1.6 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}

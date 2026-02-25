import React, { useState, useEffect, useRef } from 'react';

/* ── Color system ─────────────────────────────────────────────── */

const colors = {
  bg: '#0a0f1a',
  card: '#111827',
  cardBorder: '#1e293b',
  accent: '#60a5fa',
  accentDim: 'rgba(96,165,250,0.15)',
  green: '#34d399',
  greenDim: 'rgba(52,211,153,0.15)',
  amber: '#fbbf24',
  amberDim: 'rgba(251,191,36,0.12)',
  purple: '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.15)',
  rose: '#fb7185',
  roseDim: 'rgba(251,113,133,0.12)',
  red: '#f87171',
  redDim: 'rgba(248,113,113,0.12)',
  orange: '#fbbf24',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  divider: '#1e293b',
  surface: '#111827',
  surfaceLight: '#1a2235',
  border: '#1e2d4a',
};

/* ── Chevron ──────────────────────────────────────────────────── */

const Chevron = ({ open, color = colors.textDim }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)', flexShrink: 0 }}>
    <path d="M5 7.5L10 12.5L15 7.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Collapsible Card ─────────────────────────────────────────── */

const CollapsibleCard = ({ title, sub, icon, children, defaultOpen = true, cardStyleOverride }) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(4000);

  useEffect(() => {
    if (contentRef.current) setContentHeight(contentRef.current.scrollHeight);
  }, [children, open]);

  useEffect(() => {
    const handleResize = () => { if (contentRef.current) setContentHeight(contentRef.current.scrollHeight); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: '16px',
      marginBottom: '24px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s ease',
      ...cardStyleOverride,
    }}>
      <button onClick={() => setOpen(prev => !prev)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
        padding: '22px 28px', paddingBottom: open ? '0px' : '22px', background: 'transparent',
        border: 'none', cursor: 'pointer', textAlign: 'left', outline: 'none',
        transition: 'padding-bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          {icon && <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>}
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
            {sub && <p style={{ fontSize: '13px', color: colors.textDim, margin: '3px 0 0 0', lineHeight: 1.4, opacity: open ? 1 : 0.7, transition: 'opacity 0.3s ease', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</p>}
          </div>
        </div>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: open ? `${colors.accent}12` : `${colors.textDim}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s ease', flexShrink: 0, marginLeft: '16px' }}>
          <Chevron open={open} color={open ? colors.accent : colors.textDim} />
        </div>
      </button>
      <div style={{ maxHeight: open ? `${contentHeight + 40}px` : '0px', opacity: open ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease' }}>
        <div ref={contentRef} style={{ padding: '20px 28px 28px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* ── Prose helpers ────────────────────────────────────────────── */

const Prose = ({ children }) => (
  <div style={{ fontSize: '14px', color: colors.textMuted, lineHeight: 1.8 }}>
    {children}
  </div>
);

const P = ({ children }) => <p style={{ margin: '0 0 16px 0' }}>{children}</p>;
const Strong = ({ children, color = colors.text }) => <span style={{ fontWeight: 600, color }}>{children}</span>;
const Mono = ({ children }) => <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: colors.accent, background: `${colors.accent}12`, padding: '1px 6px', borderRadius: '4px' }}>{children}</span>;

const CodeBlock = ({ children, title }) => (
  <div style={{ margin: '16px 0', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
    {title && <div style={{ background: '#1a2235', padding: '8px 16px', fontSize: '11px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${colors.border}` }}>{title}</div>}
    <pre style={{ background: '#0d1117', padding: '16px 20px', margin: 0, overflow: 'auto', fontSize: '12px', lineHeight: 1.7, color: colors.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
      <code>{children}</code>
    </pre>
  </div>
);

const Table = ({ headers, rows, caption, highlight }) => (
  <div style={{ margin: '16px 0', overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '13px' }}>
      {caption && <caption style={{ fontSize: '11px', color: colors.textDim, marginBottom: '8px', textAlign: 'left', fontStyle: 'italic' }}>{caption}</caption>}
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: '10px 14px', textAlign: i === 0 ? 'left' : 'right', fontSize: '11px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${colors.divider}`, fontFamily: "'JetBrains Mono', monospace" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: highlight === ri ? `${colors.green}10` : ri % 2 === 0 ? 'transparent' : `${colors.cardBorder}30` }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: '10px 14px', textAlign: ci === 0 ? 'left' : 'right', fontFamily: ci > 0 ? "'JetBrains Mono', monospace" : 'inherit', fontSize: '12px', color: highlight === ri && ci > 0 ? colors.green : ci === 0 ? colors.text : colors.textMuted, fontWeight: highlight === ri ? 600 : 400, borderBottom: `1px solid ${colors.divider}40` }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Callout = ({ color = colors.accent, children }) => (
  <div style={{ margin: '16px 0', padding: '14px 18px', borderRadius: '10px', background: `${color}08`, border: `1px solid ${color}20`, fontSize: '13px', color: colors.textMuted, lineHeight: 1.7 }}>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   INTERACTIVE PIPELINE VISUALIZATION (from gpu_trick.jsx)
   ══════════════════════════════════════════════════════════════════ */

const phases = [
  { id: 0, label: 'Before', tag: 'Lambda + EC2', time: '~18 min', color: colors.red, glow: colors.redDim, title: 'Two-Service Architecture', subtitle: 'Video crosses the network 3 times through 2 services', wallMin: 18, fps: null, cost: 0.14, dataMB: 957, services: 2 },
  { id: 1, label: 'Phase 1', tag: 'NVENC', time: '~12 min', color: colors.orange, glow: colors.amberDim, title: 'Merge Services + NVENC Transcode', subtitle: 'NVENC hardware encode replaces 7-min Lambda CPU transcode', wallMin: 12, fps: 32.5, cost: 0.08, dataMB: 433, services: 1, decode: 'cv2 CPU decode + preprocess', inference: 'Eager PyTorch', cpuPct: 100, cudaPct: 50, nvdecIdle: true, labelTime: '~10 min', labelFps: '32.5 fps' },
  { id: 2, label: 'Phase 2', tag: 'NVDEC', time: '~9 min', color: colors.accent, glow: colors.accentDim, title: 'Hardware Decode + Threaded Overlap', subtitle: 'NVDEC decode flips bottleneck from CPU to GPU', wallMin: 9, fps: 40.1, cost: 0.064, dataMB: 433, services: 1, decode: 'NVDEC h264_cuvid + preprocess', inference: 'Eager PyTorch', cpuPct: 36, cudaPct: 90, nvdecIdle: false, labelTime: '~8.1 min', labelFps: '40.1 fps' },
  { id: 3, label: 'Phase 3', tag: 'compile', time: '~6 min', color: colors.green, glow: colors.greenDim, title: 'torch.compile (inductor)', subtitle: 'RTMDet 2.2x + ViTPose 1.08x → 1.77x E2E', wallMin: 6, fps: 57.5, cost: 0.04, dataMB: 433, services: 1, decode: 'NVDEC h264_cuvid + preprocess', inference: 'torch.compile (inductor)', cpuPct: 50, cudaPct: 86, nvdecIdle: false, labelTime: '~5.5 min', labelFps: '57.5 fps' },
];

const VizArrow = ({ color = colors.textMuted }) => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
    <svg width="20" height="28" viewBox="0 0 20 28">
      <line x1="10" y1="0" x2="10" y2="22" stroke={color} strokeWidth="2" strokeDasharray="4,3" />
      <polygon points="4,20 10,28 16,20" fill={color} />
    </svg>
  </div>
);

const DataBadge = ({ size, color = colors.orange }) => (
  <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}18`, padding: '2px 8px', borderRadius: 20, border: `1px solid ${color}33`, whiteSpace: 'nowrap' }}>{size}</span>
);

const TimeBadge = ({ time, color = colors.accent }) => (
  <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}18`, padding: '2px 8px', borderRadius: 20, border: `1px solid ${color}33`, whiteSpace: 'nowrap' }}>{time}</span>
);

const ServiceBox = ({ title, subtitle, children, color = colors.accent, width = '100%' }) => (
  <div style={{ background: colors.surface, border: `1px solid ${color}44`, borderRadius: 12, padding: '16px 18px', width, boxShadow: `0 0 20px ${color}10, inset 0 1px 0 ${color}15` }}>
    <div style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: '0.03em', marginBottom: 2 }}>{title}</div>
    {subtitle && <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10 }}>{subtitle}</div>}
    {children}
  </div>
);

const UtilBar = ({ label, percent, color, idle = false }) => (
  <div style={{ marginBottom: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
      <span style={{ color: idle ? colors.textMuted : colors.text, fontWeight: 500 }}>{label}</span>
      <span style={{ color: idle ? `${colors.red}aa` : color, fontWeight: 600 }}>{idle ? 'Idle' : `${percent}%`}</span>
    </div>
    <div style={{ height: 6, background: '#1a2235', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 3, width: idle ? '100%' : `${percent}%`, background: idle ? `repeating-linear-gradient(45deg, ${colors.red}20, ${colors.red}20 4px, transparent 4px, transparent 8px)` : color, transition: 'width 0.8s ease' }} />
    </div>
  </div>
);

const S3Bucket = ({ label, size }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d2137', border: `1px solid ${colors.accent}33`, borderRadius: 8, padding: '8px 14px' }}>
    <svg width="18" height="18" viewBox="0 0 18 18">
      <rect x="2" y="4" width="14" height="10" rx="2" fill="none" stroke={colors.accent} strokeWidth="1.5"/>
      <path d="M2 7h14" stroke={colors.accent} strokeWidth="1" opacity="0.5"/>
    </svg>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: colors.accent }}>{label}</div>
      {size && <div style={{ fontSize: 10, color: colors.textMuted }}>{size}</div>}
    </div>
  </div>
);

const PhaseMetric = ({ icon, label, current, baseline, unit, better = 'lower', fmt }) => {
  const format = fmt || (v => v);
  const showComparison = baseline != null && current != null && current !== baseline;
  const improved = better === 'lower' ? current < baseline : current > baseline;
  const pctChange = baseline ? Math.round(Math.abs((baseline - current) / baseline) * 100) : 0;
  return (
    <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12, padding: '14px 16px', flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 8, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{icon} {label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 2 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: colors.text, fontVariantNumeric: 'tabular-nums' }}>{current != null ? format(current) : '—'}</span>
        <span style={{ fontSize: 12, color: colors.textMuted }}>{unit}</span>
      </div>
      {showComparison && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: colors.textMuted, textDecoration: 'line-through' }}>{format(baseline)} {unit}</span>
          {improved && <span style={{ fontSize: 10, fontWeight: 700, color: colors.green, background: colors.greenDim, padding: '1px 6px', borderRadius: 10 }}>{better === 'lower' ? '↓' : '↑'} {pctChange}%</span>}
        </div>
      )}
    </div>
  );
};

const BeforeArchitecture = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
      <span style={{ fontSize: 20 }}>📱</span>
      <span style={{ fontSize: 13, color: colors.textMuted }}>Phone uploads video</span>
      <DataBadge size="168 MB .MOV" />
    </div>
    <VizArrow />
    <S3Bucket label="S3 /raw" size="168 MB" />
    <VizArrow />
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
      <DataBadge size="168 MB download" /> <TimeBadge time="~15s" />
    </div>
    <VizArrow />
    <ServiceBox title="AWS Lambda" subtitle="2 vCPU · CPU-only" color={colors.orange}>
      <div style={{ fontSize: 12, color: colors.text, marginBottom: 8 }}>CPU transcode (libx264) — HEVC → H.264</div>
      <UtilBar label="CPU (2 cores)" percent={100} color={colors.orange} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <TimeBadge time="⏱ 7 min" color={colors.red} />
        <span style={{ fontSize: 11, color: colors.textMuted }}>Output: 394 MB .mp4</span>
      </div>
    </ServiceBox>
    <VizArrow />
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
      <DataBadge size="394 MB upload" /> <TimeBadge time="~30s" />
    </div>
    <VizArrow />
    <S3Bucket label="S3 /processed" size="394 MB" />
    <VizArrow />
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
      <DataBadge size="394 MB download" /> <TimeBadge time="~30s" />
    </div>
    <VizArrow />
    <ServiceBox title="EC2 g6.2xlarge" subtitle="8 vCPU + NVIDIA L4 GPU" color={colors.purple}>
      <div style={{ fontSize: 12, color: colors.text, marginBottom: 8 }}>Pose estimation (ViTPose-Huge)</div>
      <UtilBar label="CPU — cv2 decode + preprocess" percent={100} color={colors.orange} />
      <UtilBar label="CUDA — RTMDet + ViTPose" percent={50} color={colors.purple} />
      <UtilBar label="NVENC" percent={0} color={colors.red} idle />
      <UtilBar label="NVDEC" percent={0} color={colors.red} idle />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <TimeBadge time="⏱ 10 min" color={colors.red} />
        <span style={{ fontSize: 11, color: colors.textMuted }}>Output: 1.2 MB .pkl</span>
      </div>
    </ServiceBox>
    <VizArrow />
    <S3Bucket label="S3 /keypoints" size="1.2 MB" />
  </div>
);

const MergedArchitecture = ({ phase }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
      <span style={{ fontSize: 20 }}>📱</span>
      <span style={{ fontSize: 13, color: colors.textMuted }}>Phone uploads video</span>
      <DataBadge size="168 MB .MOV" />
    </div>
    <VizArrow color={phase.color} />
    <S3Bucket label="S3 /raw" size="168 MB" />
    <VizArrow color={phase.color} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
      <DataBadge size="168 MB download" color={phase.color} />
      <TimeBadge time="~15s" color={phase.color} />
    </div>
    <VizArrow color={phase.color} />
    <ServiceBox title="EC2 g6.2xlarge" subtitle="8 vCPU + NVIDIA L4 GPU — single service does everything" color={phase.color} width="100%">
      <div style={{ background: `${colors.green}08`, border: `1px solid ${colors.green}22`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.green, marginBottom: 6 }}>Step 1 — NVENC Transcode</div>
        <UtilBar label="NVENC — H.264 encode" percent={85} color={colors.green} />
        <UtilBar label="CUDA" percent={0} color={colors.textMuted} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <TimeBadge time="⏱ ~24 seconds" color={colors.green} />
          <span style={{ fontSize: 11, color: colors.textMuted }}>Output: local .mp4</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, fontSize: 11, color: colors.green, fontWeight: 600, padding: '4px 0' }}>
        <span style={{ width: 30, height: 1, background: `${colors.green}44`, display: 'inline-block' }} />
        No network transfer — file stays on local disk
        <span style={{ width: 30, height: 1, background: `${colors.green}44`, display: 'inline-block' }} />
      </div>
      <div style={{ background: `${colors.purple}08`, border: `1px solid ${colors.purple}22`, borderRadius: 8, padding: 12, marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.purple }}>Step 2 — Pose Estimation</div>
          {phase.inference !== 'Eager PyTorch' && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, color: colors.green, background: colors.greenDim, border: `1px solid ${colors.green}33` }}>{phase.inference}</span>
          )}
        </div>
        <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 8, padding: '6px 8px', background: `${colors.border}33`, borderRadius: 6, lineHeight: 1.5 }}>
          <Strong>Two-thread overlap:</Strong>{' '}background thread ({phase.nvdecIdle ? 'cv2 CPU' : 'NVDEC'} decode + preprocess) stays ahead of main thread (GPU inference) via queue
        </div>
        {phase.nvdecIdle
          ? <UtilBar label="NVDEC" percent={0} color={colors.red} idle />
          : <UtilBar label="NVDEC — h264_cuvid decode" percent={40} color={colors.accent} />
        }
        <UtilBar label={`CPU — ${phase.nvdecIdle ? 'cv2 decode + ' : ''}preprocess`} percent={phase.cpuPct} color={colors.orange} />
        <UtilBar label={`CUDA — RTMDet + ViTPose${phase.inference !== 'Eager PyTorch' ? ' (compiled)' : ''}`} percent={phase.cudaPct} color={colors.purple} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <TimeBadge time={`⏱ ${phase.labelTime} (${phase.labelFps})`} color={colors.purple} />
          <span style={{ fontSize: 11, color: colors.textMuted }}>Output: 1.2 MB .pkl</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 10, padding: '4px 8px', borderRadius: 6, lineHeight: 1.4, background: phase.nvdecIdle ? `${colors.orange}12` : `${colors.purple}12`, border: `1px solid ${phase.nvdecIdle ? colors.orange : colors.purple}22`, color: phase.nvdecIdle ? colors.orange : colors.purple }}>
          {phase.nvdecIdle
            ? '⚠ Bottleneck: CPU decode (985ms/batch) — GPU waits ~430ms idle per batch'
            : phase.cudaPct >= 86
              ? `Bottleneck: GPU inference (${phase.inference === 'Eager PyTorch' ? '494' : '344'}ms/batch) — reader finishes in 200ms, waits for GPU`
              : 'Bottleneck: GPU inference — reader finishes in 200ms, waits for GPU'
          }
        </div>
      </div>
    </ServiceBox>
    <VizArrow color={phase.color} />
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      <S3Bucket label="S3 /keypoints" size="1.2 MB" />
      <S3Bucket label="S3 /processed" size="264 MB" />
    </div>
  </div>
);

const GPUDiagram = ({ phaseId }) => (
  <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 24, marginTop: 8 }}>
    <div style={{ textAlign: 'center', marginBottom: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 4 }}>NVIDIA L4 GPU — Three Independent Engines</div>
      <div style={{ fontSize: 12, color: colors.textMuted }}>Separate silicon blocks that run in parallel — using one doesn't affect the others</div>
    </div>
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      {[
        { name: 'NVDEC', desc: 'Hardware video decoder', color: colors.accent, icon: '📥', usage: phaseId === 0 ? 'Idle' : phaseId === 1 ? 'Idle during labeling' : 'Decode frames (h264_cuvid)', active: phaseId >= 2 },
        { name: 'CUDA Cores', desc: 'General compute', color: colors.purple, icon: '⚡', usage: phaseId === 0 ? 'ViTPose (50% util)' : phaseId <= 2 ? 'RTMDet + ViTPose (eager)' : 'RTMDet + ViTPose (compiled)', active: true },
        { name: 'NVENC', desc: 'Hardware video encoder', color: colors.green, icon: '📤', usage: phaseId === 0 ? 'Idle' : 'H.264 transcode (~24s)', active: phaseId >= 1 },
      ].map(unit => (
        <div key={unit.name} style={{ flex: '1 1 160px', maxWidth: 220, background: unit.active ? `${unit.color}0a` : `${colors.red}06`, border: `1px solid ${unit.active ? unit.color : colors.red}33`, borderRadius: 10, padding: '14px 16px', textAlign: 'center', transition: 'all 0.3s ease' }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>{unit.icon}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: unit.active ? unit.color : colors.textMuted }}>{unit.name}</div>
          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{unit.desc}</div>
          <div style={{ fontSize: 11, marginTop: 8, borderRadius: 6, padding: '4px 8px', color: unit.active ? unit.color : colors.red, background: unit.active ? `${unit.color}15` : `${colors.red}10` }}>{unit.usage}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 16, fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 1.6, maxWidth: 540, margin: '16px auto 0' }}>
      {phaseId === 0 && <>Only CUDA is active — NVENC and NVDEC sit <span style={{ color: colors.red }}>completely idle</span>. That's two dedicated ASICs you're paying for and not using.</>}
      {phaseId === 1 && <>NVENC is now active for transcoding at <span style={{ color: colors.green }}>zero additional cost</span>. NVDEC still sits idle during labeling — CPU cv2 handles decoding.</>}
      {phaseId === 2 && <><span style={{ color: colors.green }}>All three engines active.</span> NVENC transcodes, NVDEC decodes frames during labeling, CUDA runs inference. Every silicon block on the die is earning its keep.</>}
      {phaseId === 3 && <><span style={{ color: colors.green }}>All three engines active</span> with compiled CUDA kernels. torch.compile fuses RTMDet ops for 2.2x speedup. ViTPose (bandwidth-bound) gets 1.08x.</>}
    </div>
  </div>
);

const gainSteps = [
  { num: '1', label: 'NVENC replaces Lambda CPU transcode', detail: '7 min → 24 sec transcode + eliminated S3 round-trip', color: colors.orange, phase: 1 },
  { num: '2', label: 'NVDEC hardware decode + threaded overlap', detail: 'cv2 CPU decode (985ms/batch) → NVDEC (200ms/batch)', color: colors.accent, phase: 2 },
  { num: '3', label: 'torch.compile on RTMDet + ViTPose', detail: 'GPU inference 494ms → 344ms/batch (1.44x faster)', color: colors.green, phase: 3 },
];

const GainsSummary = ({ phaseId }) => (
  <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 24, marginTop: 24 }}>
    <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 14 }}>Where the Gains Come From</div>
    {gainSteps.map(item => {
      const active = phaseId >= item.phase;
      return (
        <div key={item.num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: `1px solid ${colors.border}33`, opacity: active ? 1 : 0.35, transition: 'opacity 0.3s ease' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? `${item.color}18` : `${colors.border}33`, color: active ? item.color : colors.textMuted, fontSize: 13, fontWeight: 700, border: `1px solid ${active ? item.color : colors.border}33` }}>{item.num}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: active ? colors.text : colors.textMuted }}>{item.label}</div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{item.detail}</div>
          </div>
        </div>
      );
    })}
  </div>
);

const CostComparison = () => (
  <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 24, marginTop: 24 }}>
    <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 16 }}>Why Not Keep a Separate CPU for Transcoding?</div>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200, background: colors.redDim, border: `1px solid ${colors.red}22`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.red, marginBottom: 8 }}>✗ Separate CPU (c6i.2xlarge)</div>
        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.7 }}>+$0.10/hr instance cost<br/>+1 extra S3 round-trip (788 MB)<br/>+1 extra service to manage<br/>= <span style={{ color: colors.red }}>More money, slower results</span></div>
      </div>
      <div style={{ flex: 1, minWidth: 200, background: colors.greenDim, border: `1px solid ${colors.green}22`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.green, marginBottom: 8 }}>✓ NVENC on Existing GPU</div>
        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.7 }}>$0.00 additional cost<br/>0 extra S3 transfers<br/>0 extra services<br/>= <span style={{ color: colors.green }}>Free speedup</span></div>
      </div>
    </div>
  </div>
);

const PipelineViz = () => {
  const [phaseId, setPhaseId] = useState(0);
  const p = phases[phaseId];
  const base = phases[0];

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Metric cards */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <PhaseMetric icon="⏱" label="Wall Time" current={p.wallMin} baseline={base.wallMin} unit="min" />
        <PhaseMetric icon="⚡" label="Label FPS" current={p.fps} baseline={null} unit="fps" better="higher" />
        <PhaseMetric icon="💰" label="Cost / Video" current={p.cost} baseline={base.cost} unit="$" fmt={v => v.toFixed(2)} />
        <PhaseMetric icon="📡" label="Data Moved" current={p.dataMB} baseline={base.dataMB} unit="MB" />
      </div>

      {/* Phase selector */}
      <div style={{ display: 'flex', background: colors.surface, borderRadius: 10, border: `1px solid ${colors.border}`, padding: 4, marginBottom: 24, gap: 3 }}>
        {phases.map(ph => (
          <button key={ph.id} onClick={() => setPhaseId(ph.id)} style={{
            flex: 1, padding: '8px 6px', borderRadius: 7, border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: 11, fontFamily: 'inherit', letterSpacing: '0.01em',
            transition: 'all 0.2s', background: phaseId === ph.id ? `${ph.color}20` : 'transparent',
            color: phaseId === ph.id ? ph.color : colors.textMuted,
            boxShadow: phaseId === ph.id ? `0 0 12px ${ph.glow}` : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <span>{ph.label}</span>
            <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8 }}>{ph.time}</span>
          </button>
        ))}
      </div>

      {/* Architecture diagram */}
      <div style={{ background: `${colors.bg}cc`, border: `1px solid ${colors.border}`, borderRadius: 14, padding: '24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.title}</div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{p.subtitle}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, color: p.color, background: p.glow, border: `1px solid ${p.color}33` }}>{p.time}</div>
        </div>
        {phaseId === 0 ? <BeforeArchitecture /> : <MergedArchitecture phase={p} />}
      </div>

      <GPUDiagram phaseId={phaseId} />
      <CostComparison />
      <GainsSummary phaseId={phaseId} />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════════════════════════ */

const GpuTricks = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg,
      fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif",
      color: colors.text, padding: '40px 24px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* ─── HEADER ─── */}
        <div style={{
          marginBottom: '40px', opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            {['GPU', 'Infrastructure', 'Optimization', 'PyTorch'].map(tag => (
              <span key={tag} style={{ fontSize: '10px', fontWeight: 600, color: colors.accent, background: `${colors.accent}12`, padding: '3px 10px', borderRadius: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{tag}</span>
            ))}
          </div>
          <h1 style={{
            fontSize: '28px', fontWeight: 700, margin: '12px 0 0 0',
            background: `linear-gradient(135deg, ${colors.text}, ${colors.textMuted})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em', lineHeight: 1.3,
          }}>
            GPU Tricks: 3x Faster ML Inference by Using Hardware You Already Pay For
          </h1>
          <p style={{ color: colors.textDim, fontSize: '14px', margin: '10px 0 0 0', lineHeight: 1.6 }}>
            A three-phase optimization of a video analysis pipeline — from architecture cleanup (NVENC) to hardware decode (NVDEC) to compiler tricks (torch.compile) — cutting end-to-end time from 18 minutes to 6 and cost per video from $0.14 to $0.04.
          </p>
        </div>

        {/* ─── THE PROBLEM ─── */}
        <CollapsibleCard title="The Problem" icon="🎯" defaultOpen={true}
          cardStyleOverride={{ background: `linear-gradient(135deg, ${colors.card}, ${colors.bg})` }}>
          <Prose>
            <P>Modern NVIDIA GPUs ship with <Strong>three independent hardware engines</Strong> — CUDA cores, NVDEC (hardware video decoder), and NVENC (hardware video encoder). They're separate silicon blocks on the die: using one doesn't steal cycles from the others. Most ML pipelines only touch CUDA, leaving the other two completely idle.</P>
            <P>This post walks through three phases of optimizing a real pipeline — a golf swing analysis system that takes raw iPhone video through pose estimation on an EC2 GPU instance. Each phase targeted a different bottleneck, and the profiling results repeatedly contradicted initial assumptions about where time was being spent.</P>
          </Prose>
          <Table
            headers={['Phase', 'What changed', 'Wall time', 'Speedup']}
            rows={[
              ['Before', 'Lambda + EC2 (two services)', '~18 min', '—'],
              ['Phase 1', 'Merge services, use NVENC', '~12 min', '1.5x'],
              ['Phase 2', 'NVDEC decode + threaded overlap', '~9 min', '2.0x'],
              ['Phase 3', 'torch.compile (inductor)', '~6 min', '3.0x'],
            ]}
            caption="End-to-end wall time for a 5-minute 60fps iPhone video (~19,000 frames)"
            highlight={3}
          />
          <Prose>
            <P>The final pipeline processes a video in roughly the time it takes to record it, at <Strong color={colors.green}>$0.04 per video</Strong> on spot instances.</P>
          </Prose>
        </CollapsibleCard>

        {/* ─── PHASE 1 ─── */}
        <CollapsibleCard title="Phase 1: Merge Services, Activate NVENC" sub="~18 min → ~12 min (1.5x)" icon="🔧" defaultOpen={true}>
          <Prose>
            <P>The original architecture used <Strong>two services</Strong>: an AWS Lambda function for CPU transcoding (HEVC → H.264) and a separate EC2 GPU instance for pose estimation. Every video crossed the network three times:</P>
          </Prose>
          <CodeBlock>
{`Phone → S3 /raw → Lambda downloads (168 MB) → CPU transcode (7 min!)
     → S3 /processed upload (394 MB) → EC2 downloads (394 MB) → inference`}
          </CodeBlock>
          <Prose>
            <P>The fix was obvious: the EC2 instance already had an NVIDIA L4 GPU with a dedicated NVENC encoder sitting idle. Moving the transcode onto the same machine:</P>
          </Prose>
          <div style={{ margin: '12px 0 16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { n: '1', text: 'Eliminated the Lambda entirely — one fewer service to deploy, monitor, and pay for' },
              { n: '2', text: 'Killed two S3 round-trips — the 394 MB intermediate file never leaves the machine' },
              { n: '3', text: 'Replaced a 7-minute CPU transcode with a 24-second NVENC hardware encode' },
            ].map(item => (
              <div key={item.n} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: `${colors.green}18`, color: colors.green, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${colors.green}33` }}>{item.n}</span>
                <span style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <Callout color={colors.green}>
            NVENC is a fixed-function ASIC on the GPU die. It encodes video in hardware, completely independent of CUDA cores. Your ML inference runs on CUDA; your transcode runs on NVENC; they don't compete. It's free performance on hardware you're already renting.
          </Callout>
          <CodeBlock title="ffmpeg NVENC transcode command">
{`ffmpeg -hwaccel cuda -i input.MOV \\
  -c:v h264_nvenc -preset p4 -pix_fmt yuv420p \\
  -vsync cfr output.mp4`}
          </CodeBlock>
          <Callout color={colors.orange}>
            <Strong color={colors.orange}>Result: ~18 min → ~12 min</Strong> (33% faster, 55% less data transfer, one fewer service).
          </Callout>
        </CollapsibleCard>

        {/* ─── INTERACTIVE VIZ ─── */}
        <CollapsibleCard title="Interactive Pipeline Visualization" sub="Toggle between phases to see architecture changes" icon="🔬" defaultOpen={true}>
          <PipelineViz />
        </CollapsibleCard>

        {/* ─── PHASE 2 ─── */}
        <CollapsibleCard title="Phase 2: NVDEC and the Profiling Plot Twist" sub="~12 min → ~9 min (2.0x)" icon="📥" defaultOpen={true}>
          <Prose>
            <P>With transcoding handled, the pipeline bottleneck was clearly the labeling step: ~10 minutes to run RTMDet (person detection) + ViTPose-Huge (pose estimation) over 19,000 frames. The labeler uses a <Strong>two-thread overlap design</Strong>:</P>
            <P>The <Strong>background thread</Strong> decodes video frames and preprocesses them into batches of 32. The <Strong>main thread</Strong> runs GPU inference (RTMDet → crop → ViTPose → heatmap decode). They communicate through a <Mono>queue.Queue(maxsize=2)</Mono> — the background thread stays one batch ahead so the GPU never waits for data.</P>
          </Prose>
          <div style={{ margin: '20px 0', padding: '16px 20px', borderRadius: '12px', background: `${colors.red}08`, border: `1px solid ${colors.red}20` }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: colors.red, marginBottom: '8px' }}>Expected 3.5x, Got 19%</div>
            <Prose>
              <P style={{ marginBottom: 0 }}>The initial theory was that CPU frame decoding (<Mono>cv2.VideoCapture</Mono>) was the bottleneck. OpenCV decodes on CPU at ~38 fps for 1080p H.264, and the GPU seemed underutilized at an estimated ~16%. The projected speedup from switching to NVDEC hardware decode was 3.5x. The actual result: <Strong color={colors.amber}>33.6 fps → 40.1 fps (19% improvement)</Strong>.</P>
            </Prose>
          </div>
          <Prose>
            <P><Strong>The Real Bottleneck</Strong> — profiled per-batch timings on g6.2xlarge (L4 GPU), batch size 32:</P>
          </Prose>
          <CodeBlock title="Per-batch profiling (batch=32)">
{`Background thread (NVDEC decode + preprocess):
  ffmpeg h264_cuvid decode x32:   ~100ms
  preprocess (resize+pad+norm):   ~100ms
  TOTAL:                          ~200ms    ← finishes fast, waits for main

Main thread (GPU inference + CPU glue):
  RTMDet inference:               ~236ms    (GPU)
  warpAffine x32:                  ~14ms    (CPU)
  ViTPose inference:              ~258ms    (GPU)
  Heatmap decode (dark-UDP):       ~43ms    (CPU)
  TOTAL:                          ~552ms    ← the actual bottleneck`}
          </CodeBlock>
          <Prose>
            <P><Strong>GPU inference consumed 494ms out of 552ms per batch — 90% of main thread time.</Strong> The GPU wasn't 16% utilized. It was 90% utilized. The original estimate was wrong because it conflated <Mono>nvidia-smi</Mono> utilization (which reports duty cycle, not throughput) with actual batch timing.</P>
            <P>With the overlap design, effective throughput is <Mono>max(background, main)</Mono>:</P>
          </Prose>
          <div style={{ margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: `${colors.orange}08`, border: `1px solid ${colors.orange}18`, fontSize: '12px', color: colors.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
              <Strong color={colors.orange}>Before NVDEC:</Strong> max(985ms, 552ms) = 985ms → 32.5 fps. CPU decode was the limiter.
            </div>
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: `${colors.accent}08`, border: `1px solid ${colors.accent}18`, fontSize: '12px', color: colors.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
              <Strong color={colors.accent}>After NVDEC:</Strong> max(200ms, 552ms) = 552ms → ~58 fps theoretical, 40.1 measured. GPU is the limiter.
            </div>
          </div>
          <Callout color={colors.accent}>
            NVDEC didn't deliver 3.5x because the main thread was 3.5x slower than originally estimated. But the swap still mattered — it <Strong color={colors.accent}>flipped the bottleneck from CPU to GPU</Strong>, which is exactly where you want it. CPU bottlenecks are hard to fix (you'd need more cores). GPU bottlenecks can be attacked with compilers.
          </Callout>
          <Callout color={colors.accent}>
            <Strong color={colors.accent}>Result: ~12 min → ~9 min</Strong> (labeling: 10 min → 8.1 min at 40.1 fps).
          </Callout>
        </CollapsibleCard>

        {/* ─── PHASE 3 ─── */}
        <CollapsibleCard title="Phase 3: torch.compile — Another 1.77x for Free" sub="~9 min → ~6 min (3.0x)" icon="⚡" defaultOpen={true}>
          <Prose>
            <P>With the GPU confirmed as the bottleneck, the path forward was reducing inference time. <Mono>torch.compile</Mono> with the <Strong>inductor backend</Strong> is PyTorch's built-in graph compiler — it traces the model, fuses operations, and generates optimized Triton kernels. One function call, no code changes:</P>
          </Prose>
          <CodeBlock title="Two lines. That's it.">
{`det_model.backbone = torch.compile(det_model.backbone)
pose_model.backbone = torch.compile(pose_model.backbone)`}
          </CodeBlock>
          <Prose>
            <P><Strong>Conv nets love compilers more than transformers</Strong> — the two models responded very differently:</P>
          </Prose>
          <Table
            headers={['Component', 'Eager', 'Compiled', 'Speedup']}
            rows={[
              ['RTMDet (conv-based)', '236ms', '107ms', '2.2x'],
              ['ViTPose-Huge (transformer)', '258ms', '237ms', '1.08x'],
              ['Combined GPU time', '494ms', '344ms', '1.44x'],
            ]}
            caption="Per-batch (32 frames) GPU inference on L4 24GB, PyTorch 2.8"
            highlight={0}
          />
          <Prose>
            <P>RTMDet is a convolutional network. Conv layers have highly regular memory access patterns and lots of fusible pointwise operations (batch norm, ReLU, residual adds). Inductor excels here — it fuses entire conv→bn→relu chains into single Triton kernels, eliminating intermediate memory reads/writes.</P>
            <P>ViTPose is a Vision Transformer. Attention layers are dominated by large matrix multiplications (Q, K, V projections) that are already well-optimized by cuBLAS. There's less for the compiler to fuse, so the gains are marginal.</P>
          </Prose>

          <div style={{ margin: '20px 0', padding: '16px 20px', borderRadius: '12px', background: `${colors.green}08`, border: `1px solid ${colors.green}20` }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: colors.green, marginBottom: '8px' }}>Why 1.77x E2E when GPU-only is 1.44x?</div>
            <Prose>
              <P>The amplification comes from RTMDet's outsized improvement. Before compilation, the main thread took 552ms (494ms GPU + 58ms CPU). After, it takes ~401ms (344ms GPU + 57ms CPU). The background reader (200ms) was already faster than the main thread, so reducing the main thread shrinks the effective batch time directly.</P>
            </Prose>
          </div>
          <CodeBlock>
{`Before compile: max(200ms reader, 552ms main) = 552ms = 58 fps theoretical
After compile:  max(200ms reader, 401ms main) = 401ms = 80 fps theoretical
Measured: 57.5 fps (queue sync, warmup overhead eat the rest)`}
          </CodeBlock>
          <Table
            headers={['Metric', 'Eager', 'Compiled', 'Speedup']}
            rows={[
              ['Steady-state fps', '32.5', '57.5', '1.77x'],
              ['5-min video (19K frames)', '~10 min', '~5.5 min', '1.77x'],
              ['Cost per video (spot)', '$0.08', '$0.04', '2x cheaper'],
            ]}
            caption="End-to-end turbo mode labeling on g6.2xlarge"
            highlight={2}
          />
          <Callout color={colors.green}>
            <Strong color={colors.green}>Result: ~9 min → ~6 min</Strong> (labeling: 8.1 min → 5.5 min at 57.5 fps). The cold start cost is ~18 seconds on the first batch as inductor traces and compiles the graph.
          </Callout>
        </CollapsibleCard>

        {/* ─── DEAD END ─── */}
        <CollapsibleCard title="Dead End: Why TensorRT Made Things Worse" sub="The BW/TFLOP ratio explains everything" icon="🚫" defaultOpen={true}
          cardStyleOverride={{ background: `linear-gradient(135deg, ${colors.red}06, ${colors.card})`, border: `1px solid ${colors.red}18` }}>
          <Prose>
            <P>The natural next step after <Mono>torch.compile</Mono> was TensorRT — NVIDIA's dedicated inference optimizer. <Mono>torch_tensorrt</Mono> compiles models to TRT engines with FP16 quantization, typically delivering large speedups on NVIDIA hardware. On the L4, it was <Strong color={colors.red}>slower</Strong>:</P>
          </Prose>
          <Table
            headers={['GPU', 'Eager', 'TRT FP16', 'Speedup']}
            rows={[
              ['RTX 3090', '~258ms', '~191ms', '1.35x'],
              ['L4 (g6.2xlarge)', '258ms', '267ms', '0.96x (worse)'],
            ]}
            caption="ViTPose-Huge batch=32 inference, same model and inputs"
          />
          <Prose>
            <P>TRT FP16 primarily reduces <Strong>compute</Strong> — it halves the precision of matrix multiplications. But ViTPose-Huge is a Vision Transformer where attention layers move large amounts of data. Whether TRT helps depends on whether the GPU is <Strong>compute-bound</Strong> or <Strong>memory-bandwidth-bound</Strong>:</P>
          </Prose>
          <Table
            headers={['GPU', 'Mem BW', 'FP16 TFLOPS', 'BW/TFLOP', 'Bottleneck']}
            rows={[
              ['RTX 3090', '936 GB/s', '142', '6.6', 'Compute → TRT helps'],
              ['L4', '300 GB/s', '121', '2.5', 'Memory BW → TRT can\'t help'],
              ['A10G', '600 GB/s', '125', '4.8', 'Mixed → marginal'],
              ['L40S', '864 GB/s', '362', '2.4', 'Memory BW → TRT can\'t help'],
              ['A100', '2039 GB/s', '312', '6.5', 'Compute → TRT would help'],
            ]}
            caption="Higher BW/TFLOP = more compute-bound = TRT FP16 helps more"
          />
          <Prose>
            <P>The L4's 300 GB/s GDDR6 can't feed its 121 FP16 TFLOPS. The GPU is starved for data, not compute. TRT's kernel fusion reduces compute further, but you're not waiting on compute — you're waiting on memory reads. Halving the arithmetic doesn't help when the arithmetic isn't what's slow.</P>
            <P>Beyond performance, dropping TRT had operational benefits:</P>
          </Prose>
          <div style={{ margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { text: 'No 600-second cold start — TRT engine caches were invalidated on every deploy', color: colors.green },
              { text: '4.4 GB smaller AMI — tensorrt_libs was 37% of all Python packages on disk', color: colors.green },
              { text: 'Faster EBS warm-up — less data to lazy-load from the snapshot on first boot', color: colors.green },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '12px', color: colors.textMuted }}>
                <span style={{ color: item.color, fontWeight: 700, fontSize: 14 }}>✓</span>
                {item.text}
              </div>
            ))}
          </div>
        </CollapsibleCard>

        {/* ─── FULL JOURNEY ─── */}
        <CollapsibleCard title="The Full Journey" sub="Complete optimization timeline" icon="🗺️" defaultOpen={true}>
          <CodeBlock>
{`Phase 0    Phase 1         Phase 2         Phase 3
~18 min    ~12 min         ~9 min          ~6 min
           ┌───────────┐   ┌───────────┐   ┌───────────┐
           │ Merge to  │   │ NVDEC hw  │   │ torch     │
           │ single EC2│   │ decode +  │   │ .compile  │
           │ + NVENC   │   │ threaded  │   │ inductor  │
           │ transcode │   │ overlap   │   │ on models │
           └───────────┘   └───────────┘   └───────────┘
               1.5x            2.0x            3.0x`}
          </CodeBlock>
          <Table
            headers={['', 'Before', 'Phase 1', 'Phase 2', 'Phase 3']}
            rows={[
              ['Architecture', 'Lambda + EC2', 'EC2 only', 'EC2 only', 'EC2 only'],
              ['Transcode', 'CPU libx264 (7 min)', 'NVENC (24s)', 'NVENC (24s)', 'NVENC (24s)'],
              ['Decode', '—', 'cv2 CPU', 'NVDEC h264_cuvid', 'NVDEC h264_cuvid'],
              ['Inference', 'Eager', 'Eager', 'Eager', 'torch.compile'],
              ['Labeling fps', '—', '32.5', '40.1', '57.5'],
              ['E2E wall time', '~18 min', '~12 min', '~9 min', '~6 min'],
              ['Cost/video', '~$0.14', '~$0.08', '~$0.064', '~$0.04'],
              ['Data transferred', '957 MB', '433 MB', '433 MB', '433 MB'],
              ['Services', '2', '1', '1', '1'],
            ]}
            caption="Complete optimization timeline for a 5-min 60fps iPhone video"
            highlight={5}
          />
          <Prose>
            <P>Each phase attacked a different bottleneck: Phase 1 removed unnecessary network hops and CPU transcoding. Phase 2 shifted the bottleneck from CPU decode to GPU inference. Phase 3 reduced GPU inference time with a compiler. The lesson is that optimization is sequential — each fix reveals the next bottleneck, and the only reliable way to find it is to profile.</P>
          </Prose>
        </CollapsibleCard>

        {/* ─── KEY TAKEAWAYS ─── */}
        <CollapsibleCard title="Key Takeaways" icon="💡" defaultOpen={true}
          cardStyleOverride={{ background: `linear-gradient(135deg, ${colors.amber}08, ${colors.amber}03)`, border: `1px solid ${colors.amber}20`, marginBottom: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { n: '1', title: 'NVENC/NVDEC are free hardware', desc: 'They sit on the GPU die as dedicated ASICs, separate from CUDA cores. Using them doesn\'t steal compute from your ML workload. If nvidia-smi dmon shows 0% for ENC or DEC, you\'re leaving performance on the table.', color: colors.accent },
              { n: '2', title: 'Fewer services = fewer network hops', desc: 'The biggest single win (7 min → 24s transcode + eliminated S3 round-trips) came from architecture simplification, not algorithmic cleverness.', color: colors.green },
              { n: '3', title: 'Profile, don\'t guess', desc: 'Initial estimates had GPU utilization at 16% and predicted a 3.5x speedup from NVDEC. Actual profiling showed 90% GPU utilization and 19% speedup. The numbers you assume are rarely the numbers you have.', color: colors.orange },
              { n: '4', title: 'torch.compile is the easiest inference win', desc: 'Two lines of code, no model changes, 1.77x end-to-end speedup. Conv-heavy models (RTMDet: 2.2x) benefit far more than transformers (ViTPose: 1.08x).', color: colors.purple },
              { n: '5', title: 'TensorRT isn\'t always faster', desc: 'On memory-bandwidth-bound GPUs (L4, L40S), TRT FP16 can be slower than eager PyTorch. Check your GPU\'s BW/TFLOP ratio before investing in a TRT integration.', color: colors.red },
            ].map(item => (
              <div key={item.n} style={{ padding: '16px 18px', borderRadius: '12px', background: `${item.color}06`, border: `1px solid ${item.color}15` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '6px' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: `${item.color}18`, color: item.color, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${item.color}33` }}>{item.n}</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: item.color }}>{item.title}</div>
                </div>
                <div style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.6, paddingLeft: '34px' }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <CodeBlock title="Quick GPU engine utilization check">
{`# Shows CUDA, NVENC, NVDEC utilization per second
nvidia-smi dmon -s u -d 1

# Per-layer profiling to find the actual bottleneck
python -c "
import torch
with torch.profiler.profile(activities=[
    torch.profiler.ProfilerActivity.CPU,
    torch.profiler.ProfilerActivity.CUDA,
]) as prof:
    model(input_batch)
print(prof.key_averages().table(sort_by='cuda_time_total', row_limit=10))
"`}
          </CodeBlock>
        </CollapsibleCard>

      </div>
    </div>
  );
};

export default GpuTricks;

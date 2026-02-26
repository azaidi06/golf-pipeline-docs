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
  cyan: '#22d3ee',
  cyanDim: 'rgba(34,211,238,0.12)',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  divider: '#1e293b',
  surface: '#111827',
  surfaceLight: '#1a2235',
  border: '#1e2d4a',
};

/* ── Shared primitives ────────────────────────────────────────── */

const Chevron = ({ open, color = colors.textDim }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)', flexShrink: 0 }}>
    <path d="M5 7.5L10 12.5L15 7.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CollapsibleCard = ({ title, sub, icon, children, defaultOpen = false, accent }) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(4000);
  const borderColor = accent || colors.cardBorder;

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
      background: colors.card,
      border: `1px solid ${open && accent ? `${accent}40` : colors.cardBorder}`,
      borderRadius: '16px',
      marginBottom: '24px', position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.3s ease',
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
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: open ? `${accent || colors.accent}12` : `${colors.textDim}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s ease', flexShrink: 0, marginLeft: '16px' }}>
          <Chevron open={open} color={open ? (accent || colors.accent) : colors.textDim} />
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

const P = ({ children }) => <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: colors.textMuted, lineHeight: 1.7 }}>{children}</p>;
const Strong = ({ children, color = colors.text }) => <span style={{ fontWeight: 600, color }}>{children}</span>;
const Mono = ({ children }) => <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: colors.accent, background: `${colors.accent}12`, padding: '1px 6px', borderRadius: '4px' }}>{children}</span>;

const Callout = ({ color = colors.accent, children }) => (
  <div style={{ margin: '16px 0', padding: '14px 18px', borderRadius: '10px', background: `${color}08`, border: `1px solid ${color}20`, fontSize: '13px', color: colors.textMuted, lineHeight: 1.7 }}>
    {children}
  </div>
);

/* ── Data ─────────────────────────────────────────────────────── */

const FRAMES = 18000; // 5-min @ 60fps
const BATCH = 32;

// Segments per batch: [RTMDet, inter-stage gap, ViTPose, post-ViTPose gap, other overhead]
// All must sum to batchMs. GPU inference (RTMDet + ViTPose) = 344ms constant.
const scenarios = [
  {
    id: 'current',
    label: 'Current',
    tag: 'torch.compile',
    color: colors.textMuted,
    fps: 57.5,
    batchMs: 557,
    gpuActive: 344,
    segments: [
      { label: 'RTMDet inference', ms: 107, color: colors.purple, type: 'gpu' },
      { label: 'CPU warpAffine + normalize', ms: 45, color: colors.red, type: 'gap' },
      { label: 'ViTPose inference', ms: 237, color: colors.cyan, type: 'gpu' },
      { label: 'CPU heatmap decode', ms: 25, color: colors.amber, type: 'gap' },
      { label: 'Transfers, metadata, queue', ms: 143, color: colors.textDim, type: 'other' },
    ],
  },
  {
    id: 'opt1',
    label: 'Option 1',
    tag: 'GPU warp + normalize',
    color: colors.accent,
    fps: 65,
    batchMs: 492,
    gpuActive: 349,
    segments: [
      { label: 'RTMDet inference', ms: 107, color: colors.purple, type: 'gpu' },
      { label: 'GPU grid_sample + normalize', ms: 8, color: colors.green, type: 'gpu' },
      { label: 'ViTPose inference', ms: 237, color: colors.cyan, type: 'gpu' },
      { label: 'CPU heatmap decode', ms: 25, color: colors.amber, type: 'gap' },
      { label: 'Transfers, metadata, queue', ms: 115, color: colors.textDim, type: 'other' },
    ],
  },
  {
    id: 'opt2',
    label: 'Option 2',
    tag: 'GPU det preprocess',
    color: colors.purple,
    fps: 61,
    batchMs: 525,
    gpuActive: 347,
    segments: [
      { label: 'RTMDet inference', ms: 107, color: colors.purple, type: 'gpu' },
      { label: 'CPU warpAffine + normalize', ms: 45, color: colors.amber, type: 'gap' },
      { label: 'ViTPose inference', ms: 237, color: colors.cyan, type: 'gpu' },
      { label: 'CPU heatmap decode', ms: 25, color: colors.amber, type: 'gap' },
      { label: 'Transfers, metadata, queue', ms: 111, color: colors.textDim, type: 'other' },
    ],
  },
  {
    id: 'opt12',
    label: 'Option 1 + 2',
    tag: 'Both combined',
    color: colors.accent,
    fps: 72.5,
    batchMs: 441,
    gpuActive: 352,
    segments: [
      { label: 'RTMDet inference', ms: 107, color: colors.purple, type: 'gpu' },
      { label: 'GPU grid_sample + normalize', ms: 5, color: colors.green, type: 'gpu' },
      { label: 'ViTPose inference', ms: 237, color: colors.cyan, type: 'gpu' },
      { label: 'CPU heatmap decode', ms: 25, color: colors.amber, type: 'gap' },
      { label: 'Transfers, metadata, queue', ms: 67, color: colors.textDim, type: 'other' },
    ],
  },
  {
    id: 'opt12hm',
    label: 'Option 1 + 2 + HM',
    tag: '+ vectorized decode',
    color: colors.green,
    fps: 76,
    batchMs: 421,
    gpuActive: 352,
    segments: [
      { label: 'RTMDet inference', ms: 107, color: colors.purple, type: 'gpu' },
      { label: 'GPU grid_sample + normalize', ms: 5, color: colors.green, type: 'gpu' },
      { label: 'ViTPose inference', ms: 237, color: colors.cyan, type: 'gpu' },
      { label: 'Batched heatmap decode', ms: 5, color: colors.green, type: 'gpu' },
      { label: 'Transfers, metadata, queue', ms: 67, color: colors.textDim, type: 'other' },
    ],
  },
];

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

/* ── Animated counter ─────────────────────────────────────────── */

const AnimatedNumber = ({ value, suffix = '', decimals = 0, duration = 800 }) => {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();

    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{display.toFixed(decimals)}{suffix}</>;
};

/* ── Batch timeline bar ───────────────────────────────────────── */

const BatchTimeline = ({ scenario, compact = false }) => {
  const { batchMs, gpuActive, segments } = scenario;
  const gpuPct = (gpuActive / batchMs) * 100;
  const totalMs = segments.reduce((s, seg) => s + seg.ms, 0);

  return (
    <div style={{ margin: compact ? '6px 0' : '12px 0' }}>
      <div style={{ display: 'flex', height: compact ? '24px' : '32px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
        {segments.map((seg, i) => {
          const pct = (seg.ms / totalMs) * 100;
          if (pct < 0.5) return null;
          return (
            <div key={i} title={`${seg.label}: ${seg.ms}ms`} style={{
              width: `${pct}%`,
              background: seg.type === 'gpu' ? seg.color : seg.type === 'gap' ? `${seg.color}30` : colors.surfaceLight,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 600, color: seg.type === 'gpu' ? '#fff' : colors.textDim,
              fontFamily: "'JetBrains Mono', monospace",
              borderRight: i < segments.length - 1 ? `1px solid ${colors.bg}` : 'none',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden', whiteSpace: 'nowrap',
            }}>
              {pct > 8 ? `${seg.ms}ms` : ''}
            </div>
          );
        })}
      </div>
      {!compact && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
            {segments.filter(s => s.ms > 0).map((seg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: seg.type === 'gpu' ? seg.color : `${seg.color}50` }} />
                <span style={{ fontSize: '11px', color: colors.textDim }}>{seg.label}</span>
                <span style={{ fontSize: '11px', color: colors.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{seg.ms}ms</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: colors.textDim }}>
            GPU active: <span style={{ color: gpuPct > 80 ? colors.green : gpuPct > 60 ? colors.amber : colors.red, fontWeight: 600 }}>{gpuPct.toFixed(0)}%</span> of batch time
          </div>
        </>
      )}
    </div>
  );
};

/* ── Big metric card ──────────────────────────────────────────── */

const MetricCard = ({ label, value, suffix, sub, color = colors.accent, decimals = 0 }) => (
  <div style={{
    background: `${color}08`, border: `1px solid ${color}20`, borderRadius: '12px',
    padding: '16px 20px', flex: '1 1 0', minWidth: '120px',
  }}>
    <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '28px', fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>
      <AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
    </div>
    {sub && <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{sub}</div>}
  </div>
);

/* ── Badges ───────────────────────────────────────────────────── */

const SavingsPill = ({ seconds, color = colors.green }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', fontWeight: 700, color,
    background: `${color}15`, padding: '3px 10px', borderRadius: '20px',
    border: `1px solid ${color}30`,
  }}>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 9V3M6 3L3 6M6 3L9 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {seconds}s faster
  </span>
);

const EffortBadge = ({ level }) => {
  const cfg = {
    low: { label: 'Low effort', color: colors.green },
    moderate: { label: 'Moderate', color: colors.amber },
    hard: { label: 'Hard', color: colors.red },
  }[level];
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, color: cfg.color, background: `${cfg.color}15`, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${cfg.color}30` }}>
      {cfg.label}
    </span>
  );
};

const DepBadge = ({ text, color = colors.textDim }) => (
  <span style={{ fontSize: '11px', color, background: `${color}12`, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${color}25` }}>
    {text}
  </span>
);

/* ── Code comparison panel ────────────────────────────────────── */

const CodeCompare = ({ beforeTitle, beforeCode, afterTitle, afterCode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0' }}>
    <div style={{ background: `${colors.red}08`, border: `1px solid ${colors.red}20`, borderRadius: '10px', padding: '14px 16px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: colors.red, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{beforeTitle}</div>
      <pre style={{ margin: 0, fontSize: '11px', lineHeight: 1.6, color: colors.textMuted, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{beforeCode}</pre>
    </div>
    <div style={{ background: `${colors.green}08`, border: `1px solid ${colors.green}20`, borderRadius: '10px', padding: '14px 16px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: colors.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{afterTitle}</div>
      <pre style={{ margin: 0, fontSize: '11px', lineHeight: 1.6, color: colors.textMuted, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{afterCode}</pre>
    </div>
  </div>
);

/* ── Main component ───────────────────────────────────────────── */

export default function GpuUtilRoadmap() {
  const [selected, setSelected] = useState('opt12hm');
  const active = scenarios.find(s => s.id === selected);
  const current = scenarios[0];

  const activeTime = FRAMES / active.fps;
  const currentTime = FRAMES / current.fps;
  const savedSeconds = Math.round(currentTime - activeTime);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: colors.text, margin: 0, letterSpacing: '-0.02em', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
          Closing the GPU Idle Gaps
        </h1>
        <p style={{ fontSize: '15px', color: colors.textDim, margin: '6px 0 0 0', lineHeight: 1.5 }}>
          The pipeline runs at 57.5 fps with 38% GPU idle time per batch. These optimizations target the CPU work that keeps the GPU waiting.
        </p>
      </div>

      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {scenarios.map(s => (
          <button key={s.id} onClick={() => setSelected(s.id)} style={{
            padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            fontFamily: "'DM Sans', -apple-system, sans-serif",
            border: selected === s.id ? `1px solid ${s.color}60` : `1px solid ${colors.cardBorder}`,
            background: selected === s.id ? `${s.color}15` : colors.card,
            color: selected === s.id ? s.color : colors.textDim,
            cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
          }}>
            <div>{s.label}</div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{s.tag}</div>
          </button>
        ))}
      </div>

      {/* Top-level metrics */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <MetricCard label="FPS" value={active.fps} suffix=" fps" color={active.color} decimals={1} sub={`${active.batchMs}ms per batch of ${BATCH}`} />
        <MetricCard label="5-min video" value={activeTime} suffix="s" color={active.color} decimals={0} sub={fmtTime(activeTime)} />
        <MetricCard label="Savings" value={savedSeconds} suffix="s" color={savedSeconds > 0 ? colors.green : colors.textDim} sub={savedSeconds > 0 ? `vs current ${fmtTime(currentTime)}` : 'baseline'} />
        <MetricCard label="GPU active" value={(active.gpuActive / active.batchMs) * 100} suffix="%" color={active.gpuActive / active.batchMs > 0.8 ? colors.green : active.gpuActive / active.batchMs > 0.6 ? colors.amber : colors.red} decimals={0} sub={`${active.gpuActive}ms of ${active.batchMs}ms`} />
      </div>

      {/* Batch timeline comparison */}
      <CollapsibleCard title="Batch Timeline" sub={`Where ${active.batchMs}ms per batch goes`} icon="&#9201;" defaultOpen={true}>
        <P>Each batch processes <Strong>{BATCH} frames</Strong>. The GPU runs RTMDet (<Mono>107ms</Mono>) then ViTPose (<Mono>237ms</Mono>). Everything between and after is CPU work where the GPU sits idle.</P>
        <BatchTimeline scenario={active} />
        {selected !== 'current' && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: colors.textDim, marginBottom: '6px' }}>Compared to current:</div>
            <BatchTimeline scenario={current} />
          </div>
        )}
      </CollapsibleCard>

      {/* ── Option 1 ──────────────────────────────────────────── */}
      <CollapsibleCard
        title="Option 1: GPU Warp + Normalize"
        sub="Move cv2.warpAffine and numpy normalize between RTMDet and ViTPose to GPU"
        icon="&#128293;"
        defaultOpen={true}
        accent={colors.accent}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="moderate" />
          <SavingsPill seconds={Math.round(currentTime - FRAMES / 65)} />
          <DepBadge text="No new dependencies" color={colors.green} />
          <DepBadge text="57.5 → 65 fps" color={colors.accent} />
        </div>

        <P>
          The single biggest GPU idle gap is the <Strong color={colors.red}>45ms inter-stage window</Strong> between RTMDet and ViTPose.
          After RTMDet outputs bounding boxes, the main thread drops back to CPU to run <Mono>cv2.warpAffine</Mono> on all 32 frames,
          then stacks them into a numpy array, does BGR-to-RGB conversion, and normalizes with ImageNet mean/std.
          The GPU is completely idle during all of this.
        </P>

        <P>
          The fix is straightforward: keep the raw frames on GPU as a tensor and replace the CPU ops with PyTorch equivalents.
          <Mono>F.affine_grid</Mono> + <Mono>F.grid_sample</Mono> replaces <Mono>cv2.warpAffine</Mono>, and tensor arithmetic
          replaces the numpy normalize. The entire 45ms gap compresses to <Strong color={colors.green}>~8ms on GPU</Strong> — and
          the GPU stays active the whole time instead of sitting idle.
        </P>

        <CodeCompare
          beforeTitle="Current — CPU inter-stage (~45ms, GPU idle)"
          beforeCode={`# After RTMDet, back on CPU:
for i in range(32):
    warped = cv2.warpAffine(
        raw_frames[i], warp_mat,
        (192, 256), flags=cv2.INTER_LINEAR
    )
batch_np = np.stack(warped).astype(np.float32)
batch_np = batch_np[..., ::-1].copy()  # BGR→RGB
batch_np = (batch_np - MEAN) / STD
batch_np = batch_np.transpose(0, 3, 1, 2)
batch_tensor = torch.from_numpy(batch_np).cuda()`}
          afterTitle="Proposed — GPU inter-stage (~8ms, GPU active)"
          afterCode={`# Raw frames already on GPU as tensor:
# frames_gpu: (N, 3, H, W) float32

# Build affine matrices from RTMDet bboxes
theta = build_theta(bboxes, frame_h, frame_w)
grid = F.affine_grid(theta, (N, 3, 256, 192))
warped = F.grid_sample(
    frames_gpu, grid, align_corners=False
)
warped = (warped - MEAN_gpu) / STD_gpu
# Feed directly to ViTPose — no CPU round-trip`}
        />

        <P>
          The 8ms includes uploading the raw frames to GPU (~5ms for 32 frames at 1080p) plus the <Mono>grid_sample</Mono> and
          normalize (~3ms). This is slightly higher than the combined scenario because without Option 2, the raw frames
          aren't already on GPU — they need an explicit upload here.
        </P>

        <Callout color={colors.accent}>
          <Strong color={colors.accent}>Standalone impact:</Strong> 57.5 → 65 fps. A 5-min video goes from 5m 13s to <Strong color={colors.accent}>4m 37s</Strong> — <Strong color={colors.green}>36 seconds faster</Strong>.
          This is the single biggest win per line of code changed. Pairs naturally with Option 2 for an even larger gain.
        </Callout>
      </CollapsibleCard>

      {/* ── Option 2 ──────────────────────────────────────────── */}
      <CollapsibleCard
        title="Option 2: GPU RTMDet Preprocessing"
        sub="Move cv2.resize and normalize for detection from CPU background thread to GPU"
        icon="&#9881;"
        defaultOpen={true}
        accent={colors.purple}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="moderate" />
          <SavingsPill seconds={Math.round(currentTime - FRAMES / 61)} />
          <DepBadge text="No new dependencies" color={colors.green} />
          <DepBadge text="57.5 → 61 fps" color={colors.purple} />
        </div>

        <P>
          The background thread currently does two things: read frames from the ffmpeg pipe, and preprocess them for RTMDet
          (<Mono>cv2.resize</Mono> to 640x640, pad, normalize with mean/std). That preprocessing takes ~30ms of CPU time per batch.
          While it's overlapped with GPU inference on the previous batch, it still creates CPU contention —
          competing for cycles with the main thread's own CPU work (bbox extraction, warpAffine, heatmap decode).
        </P>

        <P>
          Moving the resize and normalize to GPU eliminates that contention. The background thread's only remaining job
          is reading raw bytes from the ffmpeg pipe (~40ms), and the GPU does the resize via <Mono>F.interpolate</Mono> in ~3ms.
          This frees up CPU headroom that reduces the "Other" overhead throughout the batch.
        </P>

        <CodeCompare
          beforeTitle="Current — CPU background thread (~70ms)"
          beforeCode={`# Background thread: read + preprocess
raw_frames = []
for _ in range(32):
    buf = proc.stdout.read(frame_bytes)
    raw_frames.append(np.frombuffer(buf, ...))

# CPU resize + normalize (~30ms of this)
for i, frame in enumerate(frames):
    padded[i] = cv2.resize(frame, (640, 640))
batch_np = (padded - DET_MEAN) / DET_STD
batch_np = batch_np.transpose(0, 3, 1, 2)
queue.put((raw_frames, batch_np))`}
          afterTitle="Proposed — GPU preprocess (~3ms GPU)"
          afterCode={`# Background thread: read only (~40ms)
raw_frames = []
for _ in range(32):
    buf = proc.stdout.read(frame_bytes)
    raw_frames.append(np.frombuffer(buf, ...))
queue.put(raw_frames)  # just the bytes

# Main thread: upload + GPU preprocess
raw_gpu = torch.from_numpy(stack).cuda()
raw_gpu = raw_gpu.permute(0,3,1,2).float()
det_input = F.interpolate(
    raw_gpu, size=(640, 640),
    mode='bilinear', align_corners=False
)
det_input = (det_input - DET_MEAN_gpu) / DET_STD_gpu`}
        />

        <P>
          On its own, Option 2 is a more modest gain because the background thread preprocessing was already overlapped.
          The benefit is indirect — less CPU contention means the main thread's CPU work runs faster,
          and the queue wait time drops. The real payoff comes when combined with Option 1.
        </P>

        <Callout color={colors.purple}>
          <Strong color={colors.purple}>Standalone impact:</Strong> 57.5 → 61 fps. A 5-min video goes from 5m 13s to <Strong color={colors.purple}>4m 55s</Strong> — <Strong color={colors.green}>18 seconds faster</Strong>.
          Modest on its own, but it sets the stage for Option 1's full potential: when both are applied, raw frames are
          uploaded to GPU once and reused for both detection and pose — no redundant transfers.
        </Callout>
      </CollapsibleCard>

      {/* ── Combined ──────────────────────────────────────────── */}
      <CollapsibleCard
        title="Option 1 + Option 2 Combined"
        sub="Synergy: raw frames go to GPU once, reused for both RTMDet and ViTPose"
        icon="&#128279;"
        defaultOpen={true}
        accent={colors.accent}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="moderate" />
          <SavingsPill seconds={Math.round(currentTime - FRAMES / 72.5)} />
          <DepBadge text="57.5 → 72.5 fps" color={colors.accent} />
        </div>

        <P>
          Together, the two options are worth more than the sum of their parts. The key synergy: raw frames get uploaded
          to GPU <Strong>once</Strong> at the start of the batch. Option 2 uses them for RTMDet preprocessing (<Mono>F.interpolate</Mono>),
          and after RTMDet runs, Option 1 reuses the same GPU tensor for pose warp (<Mono>F.grid_sample</Mono>).
          No redundant CPU-to-GPU transfers, no CPU pixel processing at all.
        </P>

        <P>
          The background thread shrinks to a minimal pipe reader. The main thread's GPU pipeline becomes fully sequential:
          upload raw frames → GPU resize for det → RTMDet → GPU warp for pose → ViTPose → done.
          The inter-stage "gap" drops from <Strong color={colors.red}>45ms of CPU idle time</Strong> to <Strong color={colors.green}>5ms of GPU work</Strong>,
          and the overall overhead drops from 143ms to 67ms as CPU contention vanishes.
        </P>

        {/* Side-by-side batch timelines */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '16px 0' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: colors.red, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Current — 557ms/batch, 62% GPU</div>
            <BatchTimeline scenario={scenarios[0]} compact />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: colors.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Option 1 + 2 — 441ms/batch, 80% GPU</div>
            <BatchTimeline scenario={scenarios[3]} compact />
          </div>
        </div>

        <Callout color={colors.accent}>
          <Strong color={colors.accent}>Combined impact:</Strong> 57.5 → 72.5 fps. A 5-min video goes from 5m 13s to <Strong color={colors.accent}>4m 08s</Strong> — <Strong color={colors.green}>65 seconds faster</Strong>.
          The individual gains (36s + 18s = 54s) undercount the combined benefit because of shared GPU transfers.
        </Callout>
      </CollapsibleCard>

      {/* ── Heatmap decode ─────────────────────────────────────── */}
      <CollapsibleCard
        title="Bonus: Vectorized Heatmap Decode"
        sub="Batch the per-frame Python loop in _decode_heatmaps — saves ~8s on top"
        icon="&#9889;"
        accent={colors.green}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="low" />
          <SavingsPill seconds={8} />
          <DepBadge text="Independent — works with any combination" color={colors.green} />
        </div>

        <P>
          <Mono>_decode_heatmaps()</Mono> currently loops over each of the 32 frames in a Python for-loop, calling
          <Mono>get_heatmap_maximum</Mono> and <Mono>refine_keypoints_dark_udp</Mono> one heatmap at a time.
          That's <Strong color={colors.amber}>~20ms per batch</Strong> of pure Python iteration over numpy arrays.
        </P>

        <P>
          The fix is to vectorize both operations across the full <Mono>(N, 17, 64, 48)</Mono> tensor.
          A single <Mono>argmax</Mono> over the batch replaces 32 individual calls, and the Dark-UDP
          refinement (Gaussian sub-pixel shift from neighboring heatmap values) vectorizes cleanly with
          numpy fancy indexing. The loop disappears entirely, bringing the decode down to <Strong color={colors.green}>~5ms/batch</Strong>.
        </P>

        <P>
          Over 562 batches in a 5-min video, that's 562 x 15ms = <Strong color={colors.green}>~8 seconds saved</Strong>.
          This stacks directly on top of Option 1 + Option 2, bringing the combined savings to ~73 seconds.
        </P>

        <Callout color={colors.green}>
          <Strong color={colors.green}>Low-hanging fruit.</Strong> Pure Python/numpy optimization — no GPU pipeline changes, no new
          dependencies, no interaction with the frame decode or preprocessing paths. Can be implemented
          and tested completely independently.
        </Callout>
      </CollapsibleCard>

      {/* ── Option 3 (not recommended) ────────────────────────── */}
      <CollapsibleCard
        title="Option 3: GPU-Resident Decode (Not Recommended)"
        sub="PyNvVideoCodec keeps decoded frames on GPU — diminishing returns for the complexity"
        icon="&#128683;"
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="hard" />
          <SavingsPill seconds={Math.round(FRAMES / 76 - FRAMES / 85)} color={colors.textDim} />
          <DepBadge text="New dependency + AMI changes" color={colors.red} />
        </div>

        <P>
          Currently, NVDEC decodes frames on the GPU but immediately pipes the raw bytes back to CPU through
          an ffmpeg <Mono>pipe:1</Mono> output. For 1080p at batch=32, that's ~190MB flowing through a Unix pipe per batch.
          At pipe throughput of ~2-3 GB/s, that's 60-90ms in I/O alone.
        </P>

        <P>
          GPU-resident decoding (via PyNvVideoCodec or NVIDIA VALI) keeps decoded frames in GPU memory —
          zero CPU pixel copies. Combined with Options 1 and 2, the entire path from decode through inference
          stays on GPU. This gets to the theoretical <Strong>~85 fps ceiling</Strong> (limited by RTMDet + ViTPose inference time).
        </P>

        <Callout color={colors.amber}>
          <Strong color={colors.amber}>Diminishing returns.</Strong> After Option 1 + Option 2 + heatmap vectorization, you're at ~76 fps.
          Option 3 adds ~9 fps more (~20 seconds saved) but requires integrating a niche NVIDIA library with its own
          frame formats, build requirements, and AMI bake complexity. The 60-80 second savings target is already hit
          without it.
        </Callout>
      </CollapsibleCard>

      {/* ── Summary table ─────────────────────────────────────── */}
      <CollapsibleCard title="Summary" sub="All scenarios for a 5-min 60fps video (18,000 frames)" icon="&#128202;" defaultOpen={true}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '13px' }}>
            <thead>
              <tr>
                {['Scenario', 'FPS', 'Batch', 'GPU %', 'Video Time', 'Saved', 'Effort'].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 14px', textAlign: i === 0 ? 'left' : 'right', fontSize: '11px', fontWeight: 600,
                    color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: `1px solid ${colors.divider}`, fontFamily: "'JetBrains Mono', monospace",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Current (torch.compile)', fps: 57.5, batch: 557, gpu: 62, effort: '\u2014', color: colors.textMuted, rec: false },
                { label: 'Option 1: GPU warp + normalize', fps: 65, batch: 492, gpu: 71, effort: 'Moderate', color: colors.accent, rec: false },
                { label: 'Option 2: GPU det preprocess', fps: 61, batch: 525, gpu: 66, effort: 'Moderate', color: colors.purple, rec: false },
                { label: 'Option 1 + Option 2', fps: 72.5, batch: 441, gpu: 80, effort: 'Moderate', color: colors.accent, rec: false },
                { label: 'Option 1 + Option 2 + heatmap', fps: 76, batch: 421, gpu: 84, effort: 'Moderate', color: colors.green, rec: true },
                { label: '+ Option 3: GPU-resident decode', fps: 85, batch: 376, gpu: 92, effort: 'Hard', color: colors.textDim, rec: false },
              ].map((row, ri) => {
                const time = FRAMES / row.fps;
                const saved = Math.round(currentTime - time);
                return (
                  <tr key={ri} style={{ background: row.rec ? `${colors.green}08` : ri % 2 === 0 ? 'transparent' : `${colors.cardBorder}30` }}>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: row.rec ? colors.green : colors.text, fontWeight: row.rec ? 700 : 400, borderBottom: `1px solid ${colors.divider}40` }}>
                      {row.label}
                      {row.rec && <span style={{ marginLeft: '8px', fontSize: '10px', background: `${colors.green}20`, color: colors.green, padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>RECOMMENDED</span>}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: row.color, fontWeight: 600, borderBottom: `1px solid ${colors.divider}40` }}>{row.fps}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.textMuted, borderBottom: `1px solid ${colors.divider}40` }}>{row.batch}ms</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: row.gpu > 80 ? colors.green : row.gpu > 65 ? colors.amber : colors.red, fontWeight: 600, borderBottom: `1px solid ${colors.divider}40` }}>{row.gpu}%</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: row.rec ? colors.green : colors.textMuted, fontWeight: row.rec ? 600 : 400, borderBottom: `1px solid ${colors.divider}40` }}>{fmtTime(time)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: saved > 0 ? colors.green : colors.textDim, fontWeight: 600, borderBottom: `1px solid ${colors.divider}40` }}>{saved > 0 ? `\u2212${saved}s` : '\u2014'}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: colors.textMuted, borderBottom: `1px solid ${colors.divider}40` }}>{row.effort}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>
    </div>
  );
}

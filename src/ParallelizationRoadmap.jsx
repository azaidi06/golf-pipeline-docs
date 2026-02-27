import React, { useState, useEffect, useRef } from 'react';

/* ── Color system (matches GpuUtilRoadmap) ───────────────────── */

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

/* ── Badges ───────────────────────────────────────────────────── */

const EffortBadge = ({ level }) => {
  const cfg = {
    trivial: { label: 'Trivial', color: colors.green },
    config: { label: 'Config only', color: colors.green },
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

const PhaseBadge = ({ label, color }) => (
  <span style={{ fontSize: '11px', fontWeight: 700, color, background: `${color}12`, padding: '3px 10px', borderRadius: '20px', border: `1px solid ${color}25`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
    {label}
  </span>
);

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

/* ── Big metric card ──────────────────────────────────────────── */

const MetricCard = ({ label, value, suffix = '', sub, color = colors.accent, decimals = 0, prefix = '' }) => (
  <div style={{
    background: `${color}08`, border: `1px solid ${color}20`, borderRadius: '12px',
    padding: '16px 20px', flex: '1 1 0', minWidth: '120px',
  }}>
    <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '28px', fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>
      {prefix}<AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
    </div>
    {sub && <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{sub}</div>}
  </div>
);

/* ── Text metric card (non-animated) ──────────────────────────── */

const TextMetric = ({ label, value, sub, color = colors.accent }) => (
  <div style={{
    background: `${color}08`, border: `1px solid ${color}20`, borderRadius: '12px',
    padding: '16px 20px', flex: '1 1 0', minWidth: '120px',
  }}>
    <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '24px', fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{sub}</div>}
  </div>
);

/* ── Data ─────────────────────────────────────────────────────── */

const VIDEO_MINS = 5.5; // minutes per video at 57.5 fps
const VIDEOS_PER_HR = 11;

const bursts = [
  { id: 10,  label: '10/hr',  videos: 10,  instances: 1,  tailSingle: '55 min',     tailScaled: '<10 min',  scaledInstances: 2  },
  { id: 50,  label: '50/hr',  videos: 50,  instances: 5,  tailSingle: '~4.5 hours', tailScaled: '<30 min', scaledInstances: 5  },
  { id: 100, label: '100/hr', videos: 100, instances: 10, tailSingle: '~9+ hours',  tailScaled: '<40 min', scaledInstances: 10 },
];

const instanceTypes = [
  { type: 'g6.2xlarge', vcpu: 8,  gpu: 'L4',   spot: 0.47, fps: 57.5, perVideo: 0.04, note: 'Current — cost-optimal' },
  { type: 'g6.4xlarge', vcpu: 16, gpu: 'L4',   spot: 0.94, fps: '70-80?', perVideo: 0.05, note: '2x vCPU, 2x cost' },
  { type: 'g5.2xlarge', vcpu: 8,  gpu: 'A10G', spot: 0.50, fps: '~55?', perVideo: 0.04, note: 'Alternative GPU' },
];

/* ── ASG Architecture Diagram ─────────────────────────────────── */

const ASGDiagram = () => {
  const boxStyle = (color) => ({
    background: `${color}10`,
    border: `1px solid ${color}35`,
    borderRadius: '10px',
    padding: '10px 16px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 600,
    color,
    whiteSpace: 'nowrap',
  });

  const arrowStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: colors.textDim, fontSize: '16px', padding: '4px 0',
  };

  return (
    <div style={{ margin: '20px 0', padding: '20px', background: colors.surfaceLight, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
        Scale-from-zero architecture
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={boxStyle(colors.rose)}>SQS Queue<div style={{ fontSize: '10px', fontWeight: 400, color: colors.textDim, marginTop: '2px' }}>depth &gt; 0</div></div>
        <div style={arrowStyle}>→</div>
        <div style={boxStyle(colors.amber)}>CloudWatch<div style={{ fontSize: '10px', fontWeight: 400, color: colors.textDim, marginTop: '2px' }}>alarm trigger</div></div>
        <div style={arrowStyle}>→</div>
        <div style={boxStyle(colors.purple)}>ASG<div style={{ fontSize: '10px', fontWeight: 400, color: colors.textDim, marginTop: '2px' }}>Min=0, Max=10</div></div>
        <div style={arrowStyle}>→</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              ...boxStyle(colors.cyan),
              padding: '6px 14px',
              fontSize: '11px',
              opacity: i === 1 ? 1 : 0.5,
            }}>
              EC2 #{i}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '12px', fontSize: '11px', color: colors.textDim, textAlign: 'center' }}>
        Instances self-terminate when queue is drained (existing 30-idle-poll logic)
      </div>
    </div>
  );
};

/* ── Main component ───────────────────────────────────────────── */

export default function ParallelizationRoadmap() {
  const [selectedBurst, setSelectedBurst] = useState(50);
  const burst = bursts.find(b => b.id === selectedBurst);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: colors.text, margin: 0, letterSpacing: '-0.02em', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
          Horizontal Scaling Roadmap
        </h1>
        <p style={{ fontSize: '15px', color: colors.textDim, margin: '6px 0 0 0', lineHeight: 1.5 }}>
          From a single spot instance to auto-scaling GPU fleet. Same total cost, N times lower latency.
        </p>
      </div>

      {/* Burst size selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {bursts.map(b => (
          <button key={b.id} onClick={() => setSelectedBurst(b.id)} style={{
            padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            fontFamily: "'DM Sans', -apple-system, sans-serif",
            border: selectedBurst === b.id ? `1px solid ${colors.accent}60` : `1px solid ${colors.cardBorder}`,
            background: selectedBurst === b.id ? `${colors.accent}15` : colors.card,
            color: selectedBurst === b.id ? colors.accent : colors.textDim,
            cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none',
          }}>
            <div>{b.label}</div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{b.instances} instance{b.instances > 1 ? 's' : ''}</div>
          </button>
        ))}
      </div>

      {/* Top-level metrics */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <MetricCard label="Instances needed" value={burst.instances} color={colors.accent} sub={`for ${burst.videos} videos/hr`} />
        <TextMetric label="Tail (1 instance)" value={burst.tailSingle} color={colors.red} sub="queue drains serially" />
        <TextMetric label="Tail (scaled)" value={burst.tailScaled} color={colors.green} sub={`${burst.scaledInstances} instances in parallel`} />
        <TextMetric label="Cost delta" value="$0" color={colors.green} sub="Same total compute" />
      </div>

      {/* Capacity table */}
      <CollapsibleCard title="Capacity Analysis" sub={`How burst size maps to latency — currently ${VIDEOS_PER_HR} videos/hr per instance`} icon="&#128200;" defaultOpen={true} accent={colors.accent}>
        <P>
          Each instance processes <Strong>~{VIDEOS_PER_HR} five-min videos per hour</Strong> at 57.5 fps turbo mode.
          SQS absorbs any burst (24hr retention), so no video is lost — the question is just <Strong color={colors.amber}>how long the tail waits</Strong>.
        </P>

        <div style={{ overflowX: 'auto', margin: '16px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '13px' }}>
            <thead>
              <tr>
                {['Burst Size', 'Instances', 'Tail (1 instance)', 'Tail (scaled)', 'Total Cost'].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 14px', textAlign: i === 0 ? 'left' : 'right', fontSize: '11px', fontWeight: 600,
                    color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: `1px solid ${colors.divider}`, fontFamily: "'JetBrains Mono', monospace",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bursts.map((b, ri) => {
                const isSelected = b.id === selectedBurst;
                return (
                  <tr key={ri} style={{
                    background: isSelected ? `${colors.accent}08` : ri % 2 === 0 ? 'transparent' : `${colors.cardBorder}30`,
                    cursor: 'pointer',
                  }} onClick={() => setSelectedBurst(b.id)}>
                    <td style={{ padding: '10px 14px', fontSize: '13px', color: isSelected ? colors.accent : colors.text, fontWeight: isSelected ? 700 : 400, borderBottom: `1px solid ${colors.divider}40` }}>
                      {b.label}
                      {isSelected && <span style={{ marginLeft: '8px', fontSize: '10px', background: `${colors.accent}20`, color: colors.accent, padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>SELECTED</span>}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.accent, fontWeight: 600, borderBottom: `1px solid ${colors.divider}40` }}>{b.instances}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.red, fontWeight: 600, borderBottom: `1px solid ${colors.divider}40` }}>{b.tailSingle}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.green, fontWeight: 600, borderBottom: `1px solid ${colors.divider}40` }}>{b.tailScaled}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.green, borderBottom: `1px solid ${colors.divider}40` }}>Same</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Callout color={colors.green}>
          <Strong color={colors.green}>Key insight:</Strong> N instances × 1 hour = 1 instance × N hours. Horizontal scaling is <Strong color={colors.green}>free in cost terms</Strong> —
          same total compute, just N times lower latency. SQS visibility timeout prevents double-processing across workers.
        </Callout>
      </CollapsibleCard>

      {/* What already works */}
      <CollapsibleCard title="What Already Works Well" sub="Existing architecture properties that enable scaling" icon="&#9989;" defaultOpen={true} accent={colors.green}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {[
            { title: 'SQS Decoupling', desc: 'Absorbs any upload burst — 24hr message retention', color: colors.green },
            { title: 'Idempotency Guard', desc: 'head_object check for existing .pkl prevents duplicate work', color: colors.green },
            { title: 'Dead Letter Queue', desc: 'golf-video-label-dlq catches poison messages after 3 failures', color: colors.amber },
            { title: 'Spot + Auto-Terminate', desc: 'Cost-efficient single-use pattern — 30 idle polls then shutdown', color: colors.green },
            { title: 'Unlimited S3 Events', desc: 'S3 → SQS event notifications scale with no configuration', color: colors.green },
            { title: 'Visibility Timeout', desc: 'Multiple workers poll same queue — no double-processing', color: colors.cyan },
          ].map((item, i) => (
            <div key={i} style={{
              background: `${item.color}06`, border: `1px solid ${item.color}18`,
              borderRadius: '10px', padding: '14px 16px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: item.color, marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* ── PHASE 1: Operational Reliability ── */}
      <div style={{ margin: '32px 0 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <PhaseBadge label="Phase 1" color={colors.red} />
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>Operational Reliability</div>
          <div style={{ fontSize: '12px', color: colors.textDim }}>Blockers — without these the pipeline can't handle any burst reliably</div>
        </div>
      </div>

      {/* 1.1 Scale-From-Zero */}
      <CollapsibleCard
        title="1.1 Scale-From-Zero"
        sub="ASG with SQS-based wake-up — auto-launch instances when videos arrive"
        icon="&#128640;"
        defaultOpen={true}
        accent={colors.red}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="moderate" />
          <DepBadge text="~1 day" color={colors.amber} />
          <DepBadge text="No dependencies" color={colors.green} />
          <PhaseBadge label="Critical" color={colors.red} />
        </div>

        <P>
          After idle termination, new uploads sit in SQS forever. <Strong color={colors.red}>No trigger exists to launch a new EC2 instance.</Strong> The
          current <Mono>deploy.sh</Mono> launches exactly 1 instance manually.
        </P>

        <P>
          <Strong>Solution:</Strong> Auto Scaling Group with SQS-based wake-up. Create a Launch Template from the existing AMI + user-data.
          ASG with <Mono>Min=0, Max=10, Desired=0</Mono>. CloudWatch alarm triggers when <Mono>ApproximateNumberOfMessages &gt; 0</Mono> for 1 minute.
        </P>

        <ASGDiagram />

        <Callout color={colors.accent}>
          <Strong color={colors.accent}>Why ASG over bare RunInstances?</Strong>
          {' '}Handles instance lifecycle (launch, health check, terminate), replaces failed/interrupted instances automatically,
          single point of config for instance type + AMI + user-data, and scale-in policies prevent termination mid-video.
        </Callout>

        <P>
          <Strong>Optional enhancement:</Strong> A scaler Lambda (runs every 1 min) checks queue depth directly and sets
          <Mono>{'desired = ceil(queue_depth / target_backlog)'}</Mono>. More responsive than CloudWatch metrics which can lag 5-10 minutes for SQS.
        </P>
      </CollapsibleCard>

      {/* 1.2 SQS Heartbeat */}
      <CollapsibleCard
        title="1.2 SQS Heartbeat"
        sub="Extend visibility timeout while processing — critical for multi-worker safety"
        icon="&#128147;"
        defaultOpen={true}
        accent={colors.red}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="low" />
          <DepBadge text="Small code change" color={colors.green} />
          <DepBadge text="No dependencies" color={colors.green} />
          <PhaseBadge label="Critical" color={colors.red} />
        </div>

        <P>
          The 15-min visibility timeout works for 5-min videos but fails for 15+ min videos.
          With multiple workers, a timed-out message gets redelivered to another worker — <Strong color={colors.red}>duplicate GPU work</Strong> plus
          potential race condition on S3 output.
        </P>

        <P>
          <Strong>Solution:</Strong> Daemon thread calling <Mono>ChangeMessageVisibility</Mono> every 60s while <Mono>process_message()</Mono> runs.
        </P>

        <div style={{ margin: '16px 0', background: `${colors.green}08`, border: `1px solid ${colors.green}20`, borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: colors.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Heartbeat thread</div>
          <pre style={{ margin: 0, fontSize: '11px', lineHeight: 1.6, color: colors.textMuted, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{`def _heartbeat(sqs, queue_url, receipt_handle,
               interval=60, timeout=120):
    stop = threading.Event()
    def _run():
        while not stop.wait(interval):
            try:
                sqs.change_message_visibility(
                    QueueUrl=queue_url,
                    ReceiptHandle=receipt_handle,
                    VisibilityTimeout=timeout,
                )
            except Exception:
                break
    t = threading.Thread(target=_run, daemon=True)
    t.start()
    return stop  # caller sets stop.set() when done`}</pre>
        </div>

        <Callout color={colors.green}>
          <Strong color={colors.green}>Three benefits:</Strong> (1) Long videos: visibility extends as long as worker is alive.
          (2) Spot interruption: heartbeat dies with instance, message becomes visible in ~2 min instead of 15.
          (3) Safe to reduce default visibility timeout to 2-3 min for faster retries.
        </Callout>
      </CollapsibleCard>

      {/* 1.3 Spot Interruption */}
      <CollapsibleCard
        title="1.3 Spot Interruption Handling"
        sub="Catch SIGTERM to stop accepting new messages on 2-min interruption notice"
        icon="&#9888;&#65039;"
        accent={colors.amber}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="low" />
          <DepBadge text="Small code change" color={colors.green} />
          <DepBadge text="Pairs with 1.2" color={colors.accent} />
        </div>

        <P>
          Without a SIGTERM handler, spot reclamation mid-video means: <Strong color={colors.red}>~4 min wasted work</Strong> +
          11 min waiting for visibility timeout + 5.5 min reprocessing = ~20 min delay for that video.
        </P>

        <div style={{ margin: '16px 0', background: `${colors.green}08`, border: `1px solid ${colors.green}20`, borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: colors.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>SIGTERM handler</div>
          <pre style={{ margin: 0, fontSize: '11px', lineHeight: 1.6, color: colors.textMuted, fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'pre-wrap' }}>{`_shutting_down = False

def _handle_sigterm(signum, frame):
    global _shutting_down
    _shutting_down = True
    log.warning("SIGTERM — spot interruption, "
                "stopping after current message")

signal.signal(signal.SIGTERM, _handle_sigterm)
# Check _shutting_down at top of poll loop`}</pre>
        </div>

        <P>
          With heartbeat (1.2) implemented, the heartbeat thread dies with the instance and the message
          becomes visible in ~2 min automatically. No manual cleanup needed.
        </P>
      </CollapsibleCard>

      {/* 1.4 Scale-In Protection */}
      <CollapsibleCard
        title="1.4 Scale-In Protection"
        sub="Prevent ASG from terminating instances mid-video"
        icon="&#128737;&#65039;"
        accent={colors.amber}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="config" />
          <DepBadge text="Requires 1.1 (ASG)" color={colors.accent} />
        </div>

        <P>
          <Strong>Simplest approach (Option C):</Strong> Rely on existing auto-terminate behavior. ASG <Mono>Min=0</Mono>,
          but never forcefully scale in. Instances self-terminate when queue is empty (existing 30-idle-poll logic).
          ASG just handles launching, not terminating.
        </P>

        <P>
          ASG cooldown period prevents rapid scale-in/scale-out oscillation. Alternatives (lifecycle hooks,
          instance protection API) add complexity for little benefit given the existing self-terminate design.
        </P>
      </CollapsibleCard>

      {/* ── PHASE 2: Quick Wins ── */}
      <div style={{ margin: '32px 0 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <PhaseBadge label="Phase 2" color={colors.amber} />
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>Free / Cheap Wins</div>
          <div style={{ fontSize: '12px', color: colors.textDim }}>Low-effort improvements once the foundation is in place</div>
        </div>
      </div>

      {/* 2.1 NVMe */}
      <CollapsibleCard
        title="2.1 NVMe Instance Store"
        sub="Use attached NVMe for temp files — 1.6 GB/s vs 125 MB/s EBS"
        icon="&#128190;"
        accent={colors.green}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="trivial" />
          <DepBadge text="One-line change" color={colors.green} />
          <DepBadge text="No dependencies" color={colors.green} />
        </div>

        <P>
          The worker downloads videos to the EBS root volume. Cold EBS reads are <Strong color={colors.red}>12 MB/s</Strong> (lazy
          S3 snapshot loading), warm EBS is 125 MB/s. The NVMe instance store at <Mono>/opt/dlami/nvme</Mono> is
          already attached and unused at <Strong color={colors.green}>1.6 GB/s</Strong>.
        </P>

        <CodeCompare
          beforeTitle="Current — EBS root volume"
          beforeCode={`work_dir = tempfile.mkdtemp(
    prefix="label_"
)  # defaults to /tmp on EBS`}
          afterTitle="Proposed — NVMe instance store"
          afterCode={`NVME_SCRATCH = "/opt/dlami/nvme/scratch"
os.makedirs(NVME_SCRATCH, exist_ok=True)
work_dir = tempfile.mkdtemp(
    prefix="label_", dir=NVME_SCRATCH
)`}
        />

        <Callout color={colors.green}>
          Eliminates I/O wait for video download/read. Especially helps on cold-start (first video after instance launch)
          where EBS lazy-loads from the S3 snapshot at 12 MB/s.
        </Callout>
      </CollapsibleCard>

      {/* 2.2 GPU Quota */}
      <CollapsibleCard
        title="2.2 AWS GPU Quota Increase"
        sub="Request vCPU quota before you need it — no code required"
        icon="&#128196;"
        accent={colors.green}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="config" />
          <DepBadge text="AWS console only" color={colors.green} />
          <DepBadge text="Do proactively" color={colors.amber} />
        </div>

        <P>
          Default vCPU quota for G-instances may block scaling past 2-3 instances. Request quota
          increase via AWS Service Quotas console: <Strong>"All G and VT Spot Instance Requests"</Strong> for spot,
          enough for max ASG capacity (e.g., 10 × 8 vCPU = <Mono>80 vCPU</Mono>).
        </P>
      </CollapsibleCard>

      {/* 2.3 Prefetch */}
      <CollapsibleCard
        title="2.3 Prefetch Next Video"
        sub="Download next video during GPU inference — saves ~10-15s between videos"
        icon="&#128229;"
        accent={colors.amber}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="moderate" />
          <DepBadge text="~3% throughput gain" color={colors.green} />
          <DepBadge text="No dependencies" color={colors.green} />
        </div>

        <P>
          GPU idles during S3 download (~5-10s per 500MB video) and upload (~3-5s for .mp4 + .pkl) between videos.
          While current video is in GPU inference, start downloading the next SQS message's video in a background thread.
        </P>

        <Callout color={colors.amber}>
          Moderate change to <Mono>poll_loop()</Mono> — need to peek at the next message, start download, then process
          it when current video finishes. Error handling for prefetch failures adds complexity.
        </Callout>
      </CollapsibleCard>

      {/* ── PHASE 3: Scaling Policy Tuning ── */}
      <div style={{ margin: '32px 0 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <PhaseBadge label="Phase 3" color={colors.purple} />
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>Scaling Policy Tuning</div>
          <div style={{ fontSize: '12px', color: colors.textDim }}>Fine-tuning once horizontal scaling is operational</div>
        </div>
      </div>

      {/* 3.1 Right-Size Policy */}
      <CollapsibleCard
        title="3.1 Right-Size the Scaling Policy"
        sub="Target tracking or step scaling — tune cooldowns and backlog targets"
        icon="&#128202;"
        accent={colors.purple}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="config" />
          <DepBadge text="Requires 1.1 (ASG)" color={colors.accent} />
        </div>

        <P>
          <Strong>Step scaling option:</Strong> 1-5 messages → 1 instance, 6-20 → 2, 21-50 → 5, 51+ → 10.
          <Strong> Cooldown:</Strong> 300s scale-out (prevent launch storms), no scale-in cooldown (instances self-terminate).
        </P>

        <P>
          <Strong>Target tracking option:</Strong> Keep backlog per instance at ~5-10 videos (each takes ~5.5 min).
          <Mono>ApproximateNumberOfMessages / number_of_instances</Mono> as the metric.
        </P>
      </CollapsibleCard>

      {/* 3.2 Instance Type Evaluation */}
      <CollapsibleCard
        title="3.2 Instance Type Evaluation"
        sub="g6.2xlarge is CPU-bound — more instances beats bigger instances"
        icon="&#128187;"
        defaultOpen={true}
        accent={colors.purple}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <DepBadge text="Benchmark needed" color={colors.amber} />
        </div>

        <div style={{ overflowX: 'auto', margin: '16px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '13px' }}>
            <thead>
              <tr>
                {['Instance', 'vCPU', 'GPU', 'Spot $/hr', 'FPS', '$/video', 'Notes'].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 14px', textAlign: i === 0 || i === 6 ? 'left' : 'right', fontSize: '11px', fontWeight: 600,
                    color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: `1px solid ${colors.divider}`, fontFamily: "'JetBrains Mono', monospace",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {instanceTypes.map((row, ri) => {
                const isCurrent = ri === 0;
                return (
                  <tr key={ri} style={{ background: isCurrent ? `${colors.green}08` : ri % 2 === 0 ? 'transparent' : `${colors.cardBorder}30` }}>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: isCurrent ? colors.green : colors.text, fontWeight: isCurrent ? 700 : 400, borderBottom: `1px solid ${colors.divider}40`, fontFamily: "'JetBrains Mono', monospace" }}>
                      {row.type}
                      {isCurrent && <span style={{ marginLeft: '8px', fontSize: '10px', background: `${colors.green}20`, color: colors.green, padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>CURRENT</span>}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.textMuted, borderBottom: `1px solid ${colors.divider}40` }}>{row.vcpu}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: '12px', color: colors.textMuted, borderBottom: `1px solid ${colors.divider}40` }}>{row.gpu}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.textMuted, borderBottom: `1px solid ${colors.divider}40` }}>${row.spot.toFixed(2)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: isCurrent ? colors.green : colors.accent, fontWeight: 600, borderBottom: `1px solid ${colors.divider}40` }}>{row.fps}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: colors.green, borderBottom: `1px solid ${colors.divider}40` }}>${row.perVideo.toFixed(2)}</td>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: colors.textDim, borderBottom: `1px solid ${colors.divider}40` }}>{row.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Callout color={colors.purple}>
          <Strong color={colors.purple}>Verdict:</Strong> g6.2xlarge is likely the cost-optimal choice. More instances beats bigger instances
          for throughput/$. Benchmark g6.4xlarge only if latency SLA requires &lt;3 min per video.
        </Callout>
      </CollapsibleCard>

      {/* 3.3 Mixed Instance Types */}
      <CollapsibleCard
        title="3.3 Mixed Instance Types"
        sub="ASG fallback types for spot availability — g5.2xlarge, g6.4xlarge"
        icon="&#128256;"
        accent={colors.purple}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <EffortBadge level="config" />
          <DepBadge text="Requires 3.2" color={colors.accent} />
        </div>

        <P>
          ASG can specify multiple instance types for spot capacity. Primary: <Mono>g6.2xlarge</Mono>.
          Fallback: <Mono>g5.2xlarge</Mono>, <Mono>g6.4xlarge</Mono>. Ensures capacity even when primary type is scarce.
        </P>
      </CollapsibleCard>

      {/* ── Open Questions ── */}
      <CollapsibleCard title="Open Questions" sub="Decisions that shape the scaling strategy" icon="&#10067;" defaultOpen={true} accent={colors.amber}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { q: 'Realistic peak burst size?', detail: '10, 100, or 1000/hr changes the strategy fundamentally.' },
            { q: 'Latency SLA?', detail: '"All done within 1 hour" vs "each video within X min of upload".' },
            { q: 'Stay warm (Min=1) or cold start?', detail: 'Instant response vs 2-3 min ASG cold start from scale-from-zero.' },
            { q: 'CloudWatch vs scaler Lambda?', detail: 'CW metrics can lag 5-10 min for SQS; a Lambda checking queue depth is more responsive for bursty loads.' },
            { q: 'Monitoring & alerting?', detail: 'CloudWatch dashboard for queue depth, active instances, processing rate, DLQ depth.' },
          ].map((item, i) => (
            <div key={i} style={{
              background: `${colors.amber}06`, border: `1px solid ${colors.amber}15`,
              borderRadius: '10px', padding: '12px 16px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: colors.amber }}>{i + 1}. {item.q}</div>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '3px', lineHeight: 1.5 }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* ── Relationship to GPU Roadmap ── */}
      <Callout color={colors.accent}>
        <Strong color={colors.accent}>Relationship to GPU Utilization Roadmap:</Strong>{' '}
        Vertical (GPU util) and horizontal (parallelization) are complementary. Horizontal scaling is the
        immediate fix for burst handling. GPU util improvements reduce the number of instances needed at any
        given load. At current volume ($0.04/video), horizontal scaling alone is sufficient.{' '}
        <Strong>Priority: implement horizontal scaling first.</Strong>
      </Callout>
    </div>
  );
}

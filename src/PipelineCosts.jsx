import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts';

const TIERS = [
  { videos: 100,  rate: 12.5,   avgConcurrent: 1.25,  fleet: 3,  utilization: 0.42 },
  { videos: 250,  rate: 31.25,  avgConcurrent: 3.13,  fleet: 6,  utilization: 0.52 },
  { videos: 500,  rate: 62.5,   avgConcurrent: 6.25,  fleet: 11, utilization: 0.57 },
  { videos: 1000, rate: 125,    avgConcurrent: 12.5,  fleet: 20, utilization: 0.63 },
];

const SPOT_RATE = 0.47;
const WINDOW_HRS = 8;
const VIDEO_PROC_MIN = 6;
const FPS = 57.5;
const VIDEOS_PER_HR = 10;

const S3_STANDARD_GB = 0.023;
const S3_IA_GB = 0.0125;
const RAW_MB = 200;
const PROCESSED_MB = 50;
const PKL_MB = 5;
const IA_MB_PER_VIDEO = RAW_MB + PROCESSED_MB;
const STD_MB_PER_VIDEO = PKL_MB;

const LAMBDA_PER_VIDEO = 0.00006;
const SQS_PER_VIDEO = 0.0000004;
const DDB_PER_VIDEO = 0.00000125;

const fmt = (n, decimals = 2) => n.toLocaleString('en-US', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
});

const usd = (n) => {
  if (n < 0.01) return '<$0.01';
  if (n < 1) return `${fmt(n)}`;
  if (n >= 1000) return `${fmt(n, 0)}`;
  return `${fmt(n)}`;
};

/* ── Color system ──────────────────────────────────────────────── */

const colors = {
  bg: '#0a0f1a',
  card: '#111827',
  cardBorder: '#1e293b',
  cardHover: '#162032',
  accent: '#22d3ee',
  accentDim: 'rgba(34,211,238,0.15)',
  accentGlow: 'rgba(34,211,238,0.08)',
  green: '#34d399',
  greenDim: 'rgba(52,211,153,0.15)',
  amber: '#fbbf24',
  amberDim: 'rgba(251,191,36,0.12)',
  purple: '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.15)',
  rose: '#fb7185',
  roseDim: 'rgba(251,113,133,0.12)',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  divider: '#1e293b',
};

const tierColors = [colors.accent, colors.green, colors.purple, colors.amber];

/* ── Compute ───────────────────────────────────────────────────── */

function computeCosts(tier) {
  const dailyEc2 = tier.fleet * WINDOW_HRS * SPOT_RATE;
  const dailyLambda = tier.videos * LAMBDA_PER_VIDEO;
  const dailySqs = tier.videos * SQS_PER_VIDEO;
  const dailyDdb = tier.videos * DDB_PER_VIDEO;
  const dailyOther = dailyLambda + dailySqs + dailyDdb;
  const dailyTotal = dailyEc2 + dailyOther;
  const perVideo = dailyTotal / tier.videos;

  const avgDays = 15.5;
  const monthlyIaGb = (tier.videos * IA_MB_PER_VIDEO * avgDays) / 1000;
  const monthlyStdGb = (tier.videos * STD_MB_PER_VIDEO * avgDays) / 1000;
  const monthlyS3 = monthlyIaGb * S3_IA_GB + monthlyStdGb * S3_STANDARD_GB;

  const weeklyTotal = dailyTotal * 7;
  const monthlyCompute = dailyTotal * 30;
  const monthlyTotal = monthlyCompute + monthlyS3;

  return { dailyEc2, dailyLambda, dailySqs, dailyDdb, dailyOther, dailyTotal, perVideo, monthlyS3, weeklyTotal, monthlyCompute, monthlyTotal };
}

/* ── Shared Styles ─────────────────────────────────────────────── */

const glowDot = (color, top, right) => ({
  position: 'absolute',
  top, right,
  width: '180px',
  height: '180px',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
  pointerEvents: 'none',
});

/* ── Chevron SVG ───────────────────────────────────────────────── */

const Chevron = ({ open, color = colors.textDim }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    style={{
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      flexShrink: 0,
    }}
  >
    <path d="M5 7.5L10 12.5L15 7.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Collapsible Card ──────────────────────────────────────────── */

const CollapsibleCard = ({ title, sub, icon, children, defaultOpen = true, badge, cardStyleOverride }) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(2000);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, open]);

  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const baseCard = {
    background: colors.card,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: '16px',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color 0.3s ease',
  };

  return (
    <div style={{ ...baseCard, ...cardStyleOverride }}>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '22px 28px',
          paddingBottom: open ? '0px' : '22px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          outline: 'none',
          transition: 'padding-bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          {icon && <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>}
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
            {sub && (
              <p style={{
                fontSize: '13px',
                color: colors.textDim,
                margin: '3px 0 0 0',
                lineHeight: 1.4,
                opacity: open ? 1 : 0.7,
                transition: 'opacity 0.3s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>{sub}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '16px' }}>
          {badge && !open && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              fontWeight: 600,
              color: colors.accent,
              background: `${colors.accent}15`,
              padding: '4px 10px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
            }}>{badge}</span>
          )}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: open ? `${colors.accent}12` : `${colors.textDim}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s ease',
          }}>
            <Chevron open={open} color={open ? colors.accent : colors.textDim} />
          </div>
        </div>
      </button>

      <div style={{
        maxHeight: open ? `${contentHeight + 40}px` : '0px',
        opacity: open ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
      }}>
        <div ref={contentRef} style={{ padding: '20px 28px 28px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* ── Components ────────────────────────────────────────────────── */

const StatCard = ({ label, value, sub, color = colors.accent, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}08, ${color}04)`,
      border: `1px solid ${color}25`,
      borderRadius: '12px',
      padding: '18px 20px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 700, color, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '11px', color: colors.textDim, marginTop: '4px' }}>{sub}</div>}
    </div>
  );
};

const ProgressBar = ({ pct, color = colors.accent, height = 6 }) => (
  <div style={{ width: '100%', height, background: `${color}15`, borderRadius: height, overflow: 'hidden' }}>
    <div style={{
      width: `${Math.min(pct, 100)}%`,
      height: '100%',
      background: `linear-gradient(90deg, ${color}, ${color}cc)`,
      borderRadius: height,
      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: `0 0 12px ${color}40`,
    }} />
  </div>
);

/* ── Custom tooltip ────────────────────────────────────────────── */

const CustomTooltip = ({ active, payload, label: tooltipLabel }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b',
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: '10px',
      padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, marginBottom: '6px' }}>{tooltipLabel}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.text }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span>{p.name}: <strong>{usd(p.value)}</strong></span>
        </div>
      ))}
    </div>
  );
};

/* ── Main ──────────────────────────────────────────────────────── */

const PipelineCosts = () => {
  const [selectedTier, setSelectedTier] = useState(1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const tier = TIERS[selectedTier];
  const costs = computeCosts(tier);
  const allCosts = TIERS.map(computeCosts);

  const comparisonData = TIERS.map((t, i) => ({
    name: `${t.videos}/day`,
    'Daily EC2': allCosts[i].dailyEc2,
    'Monthly Total': allCosts[i].monthlyTotal,
    'Per-Video': allCosts[i].perVideo,
  }));

  const scalingData = TIERS.map((t, i) => ({
    name: `${t.videos}`,
    cost: allCosts[i].perVideo,
    utilization: t.utilization * 100,
  }));

  const pieData = [
    { name: 'EC2 Spot', value: costs.dailyEc2, color: colors.accent },
    { name: 'Lambda', value: costs.dailyLambda || 0.001, color: colors.green },
    { name: 'SQS', value: costs.dailySqs || 0.001, color: colors.purple },
    { name: 'DynamoDB', value: costs.dailyDdb || 0.001, color: colors.amber },
  ];

  const storageItems = [
    { type: 'Raw .MOV', size: `~${RAW_MB} MB`, storageTier: 'Standard-IA', rate: `${S3_IA_GB}/GB/mo`, color: colors.rose },
    { type: 'Processed .mp4', size: `~${PROCESSED_MB} MB`, storageTier: 'Standard-IA', rate: `${S3_IA_GB}/GB/mo`, color: colors.amber },
    { type: 'Keypoints .pkl', size: `~${PKL_MB} MB`, storageTier: 'Standard', rate: `${S3_STANDARD_GB}/GB/mo`, color: colors.green },
    { type: 'Detection .json', size: '<1 KB', storageTier: 'Standard', rate: 'negligible', color: colors.textDim },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif",
      color: colors.text,
      padding: '40px 24px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ─── HEADER ─── */}
        <div style={{
          marginBottom: '40px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.green})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>⛳</div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              margin: 0,
              background: `linear-gradient(135deg, ${colors.text}, ${colors.textMuted})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              Pipeline Cost Projections
            </h1>
          </div>
          <p style={{ color: colors.textDim, fontSize: '14px', margin: 0, paddingLeft: '48px' }}>
            Golf swing processing — Erlang-C fleet model with real-time SLA
          </p>
        </div>

        {/* ─── ASSUMPTIONS ─── */}
        <CollapsibleCard
          title="Processing Assumptions"
          sub="Per-video baseline parameters"
          icon="⚡"
          defaultOpen={true}
          cardStyleOverride={{ background: `linear-gradient(135deg, ${colors.card}, ${colors.bg})` }}
        >
          <div style={glowDot(colors.accent, '-40px', '-40px')} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <StatCard label="Video Length" value="5 min" color={colors.accent} delay={80} />
            <StatCard label="Frame Rate" value="60 fps" color={colors.accent} delay={140} />
            <StatCard label="Raw Size" value="~200 MB" color={colors.accent} delay={200} />
            <StatCard label="Processing" value="~6 min" color={colors.purple} delay={260} />
            <StatCard label="Instance" value="g6.2xl" sub="NVIDIA L4 GPU" color={colors.purple} delay={320} />
            <StatCard label="Spot Price" value="$0.47/hr" color={colors.green} delay={380} />
            <StatCard label="Throughput" value={`${FPS} fps`} color={colors.green} delay={440} />
            <StatCard label="Arrival Window" value="8 hrs/day" color={colors.amber} delay={500} />
          </div>
        </CollapsibleCard>

        {/* ─── TIER SELECTOR ─── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {TIERS.map((t, i) => (
            <button key={t.videos} onClick={() => setSelectedTier(i)} style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: selectedTier === i ? `2px solid ${tierColors[i]}` : `1px solid ${colors.cardBorder}`,
              background: selectedTier === i
                ? `linear-gradient(135deg, ${tierColors[i]}18, ${tierColors[i]}08)`
                : colors.card,
              color: selectedTier === i ? tierColors[i] : colors.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: selectedTier === i ? `0 0 24px ${tierColors[i]}15` : 'none',
              outline: 'none',
            }}>
              {t.videos}/day
            </button>
          ))}
        </div>

        {/* ─── FLEET + DAILY COST ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '0' }}>

          <CollapsibleCard
            title="Fleet Sizing"
            sub={`${tier.videos} videos/day · <5% wait probability`}
            icon="🖥️"
            defaultOpen={true}
            badge={`${tier.fleet} nodes`}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <StatCard label="Arrival Rate" value={`${tier.rate}/hr`} color={colors.amber} delay={0} />
              <StatCard label="Avg Concurrent" value={fmt(tier.avgConcurrent)} color={colors.accent} delay={60} />
              <StatCard label="Fleet Size" value={`${tier.fleet} nodes`} color={colors.purple} delay={120} />
              <StatCard label="Utilization" value={`${Math.round(tier.utilization * 100)}%`} color={colors.green} delay={180} />
            </div>
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.textDim, marginBottom: '8px' }}>
                <span>Fleet utilization across {WINDOW_HRS}hr window</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: colors.green }}>{Math.round(tier.utilization * 100)}%</span>
              </div>
              <ProgressBar pct={tier.utilization * 100} color={colors.green} height={8} />
              <p style={{ fontSize: '11px', color: colors.textDim, marginTop: '10px', lineHeight: 1.6 }}>
                {tier.fleet} nodes warm for {WINDOW_HRS}hrs · ~{VIDEOS_PER_HR} videos/hr/node · Headroom absorbs Poisson bursts
              </p>
            </div>
          </CollapsibleCard>

          <CollapsibleCard
            title="Daily Cost Breakdown"
            sub={`${tier.fleet} nodes × ${WINDOW_HRS}hrs × ${SPOT_RATE}/hr`}
            icon="💰"
            defaultOpen={true}
            badge={usd(costs.dailyTotal)}
          >
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ width: '140px', height: '140px', flexShrink: 0 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1 }}>
                {[
                  { label: 'EC2 Spot (GPU)', amount: costs.dailyEc2, pct: (costs.dailyEc2 / costs.dailyTotal) * 100, color: colors.accent },
                  { label: 'Lambda', amount: costs.dailyLambda, pct: (costs.dailyLambda / costs.dailyTotal) * 100, color: colors.green },
                  { label: 'SQS + DynamoDB', amount: costs.dailySqs + costs.dailyDdb, pct: ((costs.dailySqs + costs.dailyDdb) / costs.dailyTotal) * 100, color: colors.purple },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, display: 'inline-block' }} />
                        {row.label}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: colors.text, fontSize: '12px' }}>{usd(row.amount)}</span>
                    </div>
                    <ProgressBar pct={row.pct} color={row.color} height={4} />
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${colors.divider}`, paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>Daily Total</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '20px', color: colors.accent }}>{usd(costs.dailyTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
                    <span style={{ color: colors.textDim }}>Per-video cost</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: colors.green }}>{usd(costs.perVideo)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        {/* ─── COMPARISON CHART ─── */}
        <CollapsibleCard
          title="Cost Comparison"
          sub="Monthly total across volume tiers"
          icon="📊"
          defaultOpen={true}
          badge={usd(costs.monthlyTotal) + '/mo'}
        >
          <div style={{ height: '260px' }}>
            <ResponsiveContainer>
              <BarChart data={comparisonData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke={colors.cardBorder} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: colors.textDim, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={{ stroke: colors.cardBorder }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: colors.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: `${colors.accent}08` }} />
                <Bar dataKey="Monthly Total" radius={[6, 6, 0, 0]}>
                  {comparisonData.map((_, i) => (
                    <Cell key={i} fill={selectedTier === i ? tierColors[i] : `${tierColors[i]}60`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CollapsibleCard>

        {/* ─── COMPARISON TABLE ─── */}
        <CollapsibleCard
          title="Tier-by-Tier Breakdown"
          sub="All volume levels side-by-side"
          icon="📋"
          defaultOpen={true}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${colors.divider}` }}>Metric</th>
                  {TIERS.map((t, i) => (
                    <th key={t.videos} style={{
                      padding: '10px 16px',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: selectedTier === i ? tierColors[i] : colors.textDim,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      borderBottom: `1px solid ${colors.divider}`,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>{t.videos}/day</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Fleet Nodes', values: TIERS.map(t => `${t.fleet}`) },
                  { label: 'Utilization', values: TIERS.map(t => `${Math.round(t.utilization * 100)}%`) },
                  { label: 'Daily EC2', values: allCosts.map(c => usd(c.dailyEc2)) },
                  { label: 'Daily Total', values: allCosts.map(c => usd(c.dailyTotal)), bold: true },
                  { label: 'Per-Video', values: allCosts.map(c => usd(c.perVideo)), highlight: true },
                  { label: 'Weekly', values: allCosts.map(c => usd(c.weeklyTotal)), divider: true },
                  { label: 'Monthly Compute', values: allCosts.map(c => usd(c.monthlyCompute)) },
                  { label: 'Monthly S3', values: allCosts.map(c => usd(c.monthlyS3)) },
                  { label: 'Monthly Total', values: allCosts.map(c => usd(c.monthlyTotal)), bold: true, accent: true },
                ].map((row, ri) => (
                  <tr key={row.label} style={{
                    background: row.accent ? `${colors.accent}08` : ri % 2 === 0 ? 'transparent' : `${colors.cardBorder}30`,
                    borderTop: row.divider ? `2px solid ${colors.divider}` : undefined,
                  }}>
                    <td style={{ padding: '10px 16px', fontWeight: row.bold ? 700 : 500, color: row.accent ? colors.accent : colors.text }}>
                      {row.label}
                    </td>
                    {row.values.map((v, ci) => (
                      <td key={ci} style={{
                        padding: '10px 16px',
                        textAlign: 'right',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: row.bold ? 700 : 400,
                        fontSize: '12px',
                        color: row.highlight ? colors.green : row.accent ? colors.accent : selectedTier === ci ? colors.text : colors.textMuted,
                      }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleCard>

        {/* ─── ECONOMIES + S3 ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '0' }}>
          <CollapsibleCard
            title="Economies of Scale"
            sub="Per-video cost decreases with volume"
            icon="📉"
            defaultOpen={true}
            badge={usd(costs.perVideo) + '/video'}
          >
            <div style={{ height: '220px' }}>
              <ResponsiveContainer>
                <LineChart data={scalingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.cardBorder} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: colors.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                    axisLine={{ stroke: colors.cardBorder }}
                    tickLine={false}
                    label={{ value: 'videos/day', position: 'insideBottom', offset: -5, fill: colors.textDim, fontSize: 10 }}
                  />
                  <YAxis
                    tick={{ fill: colors.textDim, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v.toFixed(2)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    name="Per-Video Cost"
                    stroke={colors.green}
                    strokeWidth={3}
                    dot={{ fill: colors.green, strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7, fill: colors.green, stroke: colors.bg, strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '11px', color: colors.textDim, marginTop: '12px', lineHeight: 1.6 }}>
              Pure processing: ~$0.04/video. SLA overhead (fleet idle time) drives the rest. Higher volume → better utilization → lower per-video cost.
            </p>
          </CollapsibleCard>

          <CollapsibleCard
            title="S3 Storage Breakdown"
            sub="Lifecycle: raw → IA after 1 day, .pkl stays Standard"
            icon="🗄️"
            defaultOpen={true}
            badge={usd(costs.monthlyS3) + '/mo'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {storageItems.map((item) => (
                <div key={item.type} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: `${item.color}08`,
                  border: `1px solid ${item.color}20`,
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{item.type}</div>
                    <div style={{ fontSize: '11px', color: colors.textDim, marginTop: '2px' }}>{item.storageTier} · {item.rate}</div>
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                    fontWeight: 600,
                    color: item.color,
                    background: `${item.color}15`,
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}>
                    {item.size}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: colors.textDim, marginTop: '14px', lineHeight: 1.6 }}>
              First-month costs shown. Storage accumulates — month 2 ≈ 3× month 1 average. Consider Glacier Instant Retrieval ($0.004/GB/mo) for archived media.
            </p>
          </CollapsibleCard>
        </div>

        {/* ─── NOTES ─── */}
        <CollapsibleCard
          title="Notes & Optimizations"
          icon="💡"
          defaultOpen={true}
          cardStyleOverride={{
            background: `linear-gradient(135deg, ${colors.amber}08, ${colors.amber}03)`,
            border: `1px solid ${colors.amber}20`,
            marginBottom: 0,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { title: 'Auto-scaling', desc: 'SQS-based auto-scaling (accepting ~3 min scale-up lag) can cut EC2 costs 20-30% vs the always-on fleet.', color: colors.green },
              { title: 'Spot diversity', desc: 'At 20 nodes, spread across g6.2xlarge, g5.2xlarge, and multiple AZs to reduce interruption risk.', color: colors.accent },
              { title: 'Storage growth', desc: 'S3 costs are cumulative. Each month adds to the total. Implement lifecycle policies for older data.', color: colors.amber },
              { title: 'Glacier upgrade', desc: 'Moving .mov/.mp4 to Glacier Instant Retrieval ($0.004/GB/mo) saves ~70% on storage costs.', color: colors.purple },
            ].map(note => (
              <div key={note.title} style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: `${note.color}06`,
                border: `1px solid ${note.color}15`,
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: note.color, marginBottom: '4px' }}>{note.title}</div>
                <div style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.5 }}>{note.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleCard>

      </div>
    </div>
  );
};

export default PipelineCosts;

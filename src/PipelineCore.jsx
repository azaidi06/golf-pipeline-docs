import React, { useState, useEffect, useRef } from 'react';

/* ── Color system (shared with PipelineCosts) ─────────────────── */

const colors = {
  bg: '#0a0f1a',
  card: '#111827',
  cardBorder: '#1e293b',
  cardHover: '#162032',
  accent: '#22d3ee',
  accentDim: 'rgba(34,211,238,0.15)',
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

const serviceColors = {
  s3: colors.green,
  sqs: colors.rose,
  ec2: colors.purple,
  lambda: colors.amber,
  db: colors.accent,
  default: colors.textDim,
};

/* ── Chevron SVG ──────────────────────────────────────────────── */

const Chevron = ({ open, color = colors.textDim }) => (
  <svg
    width="20" height="20" viewBox="0 0 20 20" fill="none"
    style={{
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      flexShrink: 0,
    }}
  >
    <path d="M5 7.5L10 12.5L15 7.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Collapsible Card ─────────────────────────────────────────── */

const CollapsibleCard = ({ title, sub, icon, children, defaultOpen = true, badge, cardStyleOverride }) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(2000);

  useEffect(() => {
    if (contentRef.current) setContentHeight(contentRef.current.scrollHeight);
  }, [children, open]);

  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) setContentHeight(contentRef.current.scrollHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: '16px',
      marginBottom: '24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.3s ease',
      ...cardStyleOverride,
    }}>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '22px 28px', paddingBottom: open ? '0px' : '22px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left', outline: 'none',
          transition: 'padding-bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          {icon && <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>}
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
            {sub && (
              <p style={{
                fontSize: '13px', color: colors.textDim, margin: '3px 0 0 0', lineHeight: 1.4,
                opacity: open ? 1 : 0.7, transition: 'opacity 0.3s ease',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{sub}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '16px' }}>
          {badge && !open && (
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', fontWeight: 600,
              color: colors.accent, background: `${colors.accent}15`,
              padding: '4px 10px', borderRadius: '6px', whiteSpace: 'nowrap',
            }}>{badge}</span>
          )}
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: open ? `${colors.accent}12` : `${colors.textDim}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.3s ease',
          }}>
            <Chevron open={open} color={open ? colors.accent : colors.textDim} />
          </div>
        </div>
      </button>

      <div style={{
        maxHeight: open ? `${contentHeight + 40}px` : '0px',
        opacity: open ? 1 : 0, overflow: 'hidden',
        transition: 'max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
      }}>
        <div ref={contentRef} style={{ padding: '20px 28px 28px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

/* ── Stat Card ────────────────────────────────────────────────── */

const StatCard = ({ label, value, sub, color = colors.accent, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}08, ${color}04)`,
      border: `1px solid ${color}25`,
      borderRadius: '12px', padding: '18px 20px',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)',
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

/* ── Pipeline Node ────────────────────────────────────────────── */

const Node = ({ title, subtitle, details, type = 'default', children }) => {
  const borderColor = serviceColors[type] || serviceColors.default;

  return (
    <div style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: '10px',
      padding: '16px 20px',
      width: '100%',
      maxWidth: '420px',
    }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, marginTop: '3px' }}>{subtitle}</div>}
      {details && <div style={{ fontSize: '12px', color: colors.textDim, marginTop: '6px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{details}</div>}
      {children && <div style={{ marginTop: '10px', width: '100%' }}>{children}</div>}
    </div>
  );
};

/* ── Arrow Connector ──────────────────────────────────────────── */

const ArrowDown = ({ label, color = colors.textDim }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0' }}>
    <svg width="2" height="24" style={{ display: 'block' }}>
      <line x1="1" y1="0" x2="1" y2="24" stroke={color} strokeWidth="2" />
    </svg>
    {label && (
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px', fontWeight: 500, color: colors.textMuted,
        background: `${color}15`, padding: '2px 10px', borderRadius: '10px',
        margin: '2px 0', whiteSpace: 'nowrap',
      }}>{label}</span>
    )}
    <svg width="12" height="8" style={{ display: 'block' }}>
      <polygon points="6,8 0,0 12,0" fill={color} />
    </svg>
  </div>
);

/* ── Sub-step (inside EC2 card) ───────────────────────────────── */

const SubStep = ({ label, desc, color = colors.purple }) => (
  <div style={{
    background: `${color}08`,
    border: `1px solid ${color}20`,
    borderRadius: '8px',
    padding: '10px 14px',
  }}>
    <div style={{ fontSize: '12px', fontWeight: 700, color }}>{label}</div>
    <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px', lineHeight: 1.5 }}>{desc}</div>
  </div>
);

/* ── Main ─────────────────────────────────────────────────────── */

const PipelineCore = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif",
      color: colors.text,
      padding: '40px 24px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* ─── HEADER ─── */}
        <div style={{
          marginBottom: '40px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.green})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
            }}>⛳</div>
            <h1 style={{
              fontSize: '28px', fontWeight: 700, margin: 0,
              background: `linear-gradient(135deg, ${colors.text}, ${colors.textMuted})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              Pipeline Architecture
            </h1>
          </div>
          <p style={{ color: colors.textDim, fontSize: '14px', margin: 0, paddingLeft: '48px' }}>
            S3 upload through swing detection, post-processing, and analysis
          </p>
        </div>

        {/* ─── PIPELINE OVERVIEW ─── */}
        <CollapsibleCard
          title="Pipeline Overview"
          sub="End-to-end golf swing processing"
          icon="🔭"
          defaultOpen={true}
          cardStyleOverride={{ background: `linear-gradient(135deg, ${colors.card}, ${colors.bg})` }}
        >
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.accent}15 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <StatCard label="Stages" value="5" sub="ingest → analyze" color={colors.accent} delay={80} />
            <StatCard label="End-to-End" value="~6 min" sub="5-min 60fps video" color={colors.purple} delay={140} />
            <StatCard label="Throughput" value="57.5 fps" sub="turbo + torch.compile" color={colors.green} delay={200} />
            <StatCard label="Cost" value="$0.04" sub="per video (spot)" color={colors.amber} delay={260} />
          </div>
        </CollapsibleCard>

        {/* ─── INGESTION ─── */}
        <CollapsibleCard
          title="Ingestion"
          sub="Raw upload → S3 event → SQS queue"
          icon="📥"
          defaultOpen={true}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
            <Node
              type="s3"
              title="S3: golf-swing-data"
              subtitle="{golfer}/raw/"
              details="Raw .MOV (HEVC 10-bit VFR) or .mp4"
            />
            <ArrowDown label="S3 event (.MOV / .mp4)" color={colors.green} />
            <Node
              type="sqs"
              title="SQS: golf-video-label"
              details="S3 suffix filter triggers notification to queue"
            />
          </div>
        </CollapsibleCard>

        {/* ─── GPU PROCESSING ─── */}
        <CollapsibleCard
          title="GPU Processing"
          sub="EC2 spot worker — transcode + pose estimation"
          icon="🖥️"
          defaultOpen={true}
          badge="g6.2xlarge"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
            <div style={{ width: '100%', marginBottom: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                SQS poll → process → upload
              </div>
            </div>
            <Node
              type="ec2"
              title="EC2 g6.2xlarge (Spot)"
              subtitle="8 vCPU · L4 24GB GPU · auto-terminates on idle"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <SubStep
                  label="Step 1: Transcode"
                  desc="NVDEC decode (HEVC) → NVENC encode (H.264 CFR). ~24s for 5800 frames. libx264 fallback."
                  color={colors.purple}
                />
                <SubStep
                  label="Step 2: Label (Turbo Mode)"
                  desc="NVDEC h264_cuvid → CPU prep → GPU infer. Batched RTMDet + ViTPose-Huge (torch.compile). ~57.5 fps."
                  color={colors.purple}
                />
              </div>
            </Node>

            {/* Dual output */}
            <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '420px', marginTop: '0' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ArrowDown label=".pkl (1.2 MB)" color={colors.green} />
                <Node type="s3" title="S3: /keypoints" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ArrowDown label=".mp4" color={colors.green} />
                <Node type="s3" title="S3: /processed" />
              </div>
            </div>
          </div>
        </CollapsibleCard>

        {/* ─── DETECTION & POST-PROCESSING ─── */}
        <CollapsibleCard
          title="Detection & Post-Processing"
          sub="Swing detection → visualizations → notifications"
          icon="🎯"
          defaultOpen={true}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
            <ArrowDown label="S3 event (.pkl)" color={colors.amber} />
            <Node
              type="lambda"
              title="Lambda: swing_detect"
              details="~13s signal processing. Detects backswings & contacts."
            />

            {/* Dual output */}
            <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '420px', marginTop: '0' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ArrowDown label="PutItem" color={colors.accent} />
                <Node type="db" title="DynamoDB" subtitle="golf-swing-detections" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ArrowDown label=".json" color={colors.green} />
                <Node type="s3" title="S3: /detection" />
              </div>
            </div>

            <ArrowDown label="S3 event (.json)" color={colors.amber} />
            <Node
              type="lambda"
              title="Lambda: post_processing"
              details="Reads .json, .pkl, .mp4. Generates visualizations & finger predictions."
            >
              <div style={{
                background: `${colors.amber}08`,
                border: `1px solid ${colors.amber}18`,
                borderRadius: '8px',
                padding: '10px 14px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Outputs
                </div>
                {[
                  { key: '/fingers', desc: 'JSON' },
                  { key: '/frames', desc: 'JPG overlays' },
                  { key: '/output', desc: 'Grids, plots' },
                  { key: 'DynamoDB', desc: 'update fingers' },
                  { key: 'Pushover', desc: 'mobile notification' },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: colors.amber, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: colors.text }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: colors.amber }}>{item.key}</span>
                      <span style={{ color: colors.textDim }}> — {item.desc}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Node>
          </div>
        </CollapsibleCard>

        {/* ─── ANALYSIS ─── */}
        <CollapsibleCard
          title="Analysis"
          sub="On-demand biomechanical analysis"
          icon="📊"
          defaultOpen={true}
          cardStyleOverride={{
            background: `linear-gradient(135deg, ${colors.purple}08, ${colors.purple}03)`,
            border: `1px solid ${colors.purple}20`,
            marginBottom: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
            <div style={{
              fontSize: '11px', fontWeight: 600, color: colors.textDim,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              background: `${colors.purple}12`, padding: '4px 12px', borderRadius: '10px',
              marginBottom: '12px',
            }}>
              Manual invoke
            </div>
            <Node
              type="lambda"
              title="Lambda: analyze"
              details={"Requires: golfer, score thresholds, phases.\nGenerates SPM plots + Gemini text analysis."}
            />
            <ArrowDown color={colors.purple} />
            <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '420px', flexWrap: 'wrap' }}>
              {[
                { type: 's3', title: 'S3: /analysis', sub: 'Plots, Gemini TXT' },
                { type: 'db', title: 'DynamoDB', sub: 'ANALYSIS item' },
                { type: 'default', title: 'Pushover', sub: 'Mobile notification' },
              ].map(item => (
                <div key={item.title} style={{ flex: '1 1 120px' }}>
                  <Node type={item.type} title={item.title} subtitle={item.sub} />
                </div>
              ))}
            </div>
          </div>
        </CollapsibleCard>

      </div>
    </div>
  );
};

export default PipelineCore;

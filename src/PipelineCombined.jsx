import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colors, serviceColors, pipelineStages, heroStats } from './pipelineData';
import AnimatedNumber from './components/AnimatedNumber';
import useInView from './hooks/useInView';

const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ── Bento Stat Tile ────────────────────────────────────────── */
const StatTile = ({ label, numeric, prefix = '', suffix = '', decimals = 0, sub, color }) => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.card,
        border: `1px solid ${hovered ? color + '40' : colors.cardBorder}`,
        borderRadius: '14px', padding: '20px',
        transition: `all 0.35s ${easing}`,
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: hovered ? `0 6px 24px ${color}15` : 'none',
        opacity: inView ? 1 : 0,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: '-30%', right: '-20%',
        width: '120px', height: '120px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}${hovered ? '12' : '06'} 0%, transparent 70%)`,
        pointerEvents: 'none', transition: `all 0.5s ${easing}`,
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
          {label}
        </div>
        <div style={{ fontSize: '36px', fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
          <AnimatedNumber value={numeric} prefix={prefix} suffix={suffix} decimals={decimals} active={inView} />
        </div>
        {sub && <div style={{ fontSize: '11px', color: colors.textDim, marginTop: '6px' }}>{sub}</div>}
      </div>
    </div>
  );
};

/* ── Stage Divider (from Scroll) ────────────────────────────── */
const StageDivider = ({ from, to, label }) => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <div ref={ref} style={{
      width: '100vw', marginLeft: 'calc(-50vw + 50%)',
      padding: '28px 24px',
      background: `linear-gradient(135deg, ${from}10, ${to}08)`,
      textAlign: 'center',
      opacity: inView ? 1 : 0,
      transition: `opacity 0.6s ${easing}`,
      margin: '36px 0 36px calc(-50vw + 50%)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ flex: 1, maxWidth: '100px', height: '1px', background: `${from}40` }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
        <div style={{ flex: 1, maxWidth: '100px', height: '1px', background: `${to}40` }} />
      </div>
    </div>
  );
};

/* ── Scroll-Reveal Stage Card (from Scroll) ─────────────────── */
const StageCard = ({ stage, children }) => {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const svcColor = serviceColors[stage.service] || serviceColors.default;

  return (
    <div ref={ref} style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: '16px', padding: '24px',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(30px)',
      transition: `all 0.6s ${easing}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '20px' }}>{stage.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>{stage.title}</div>
          <div style={{ fontSize: '12px', color: colors.textDim }}>{stage.sub}</div>
        </div>
        {stage.badge && (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600,
            color: colors.accent, background: `${colors.accent}15`,
            padding: '4px 10px', borderRadius: '6px',
          }}>{stage.badge}</span>
        )}
        <span style={{
          fontSize: '10px', fontWeight: 600, color: svcColor,
          background: `${svcColor}15`, padding: '3px 10px', borderRadius: '6px',
          textTransform: 'uppercase',
        }}>{stage.service}</span>
      </div>
      {children}
    </div>
  );
};

/* ── Node with scroll reveal ────────────────────────────────── */
const CombinedNode = ({ title, subtitle, details, type = 'default', children, delay = 0 }) => {
  const borderColor = serviceColors[type] || serviceColors.default;
  const [ref, inView] = useInView({ threshold: 0.15 });

  return (
    <div ref={ref} style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: '10px', padding: '16px 20px',
      width: '100%', maxWidth: '420px',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateX(0)' : 'translateX(-16px)',
      transition: `all 0.5s ${easing} ${delay}ms`,
    }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, marginTop: '3px' }}>{subtitle}</div>}
      {details && <div style={{ fontSize: '12px', color: colors.textDim, marginTop: '6px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{details}</div>}
      {children && <div style={{ marginTop: '10px', width: '100%' }}>{children}</div>}
    </div>
  );
};

/* ── Arrow with line draw-in ────────────────────────────────── */
const CombinedArrow = ({ label, color = colors.textDim }) => {
  const [ref, inView] = useInView({ threshold: 0.5 });
  return (
    <div ref={ref} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0',
      opacity: inView ? 1 : 0, transition: `opacity 0.4s ${easing}`,
    }}>
      <svg width="2" height="24" style={{ display: 'block' }}>
        <line x1="1" y1="0" x2="1" y2="24" stroke={color} strokeWidth="2"
          strokeDasharray="24" strokeDashoffset={inView ? 0 : 24}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      {label && (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 500,
          color: colors.textMuted, background: `${color}15`, padding: '2px 10px',
          borderRadius: '10px', margin: '2px 0', whiteSpace: 'nowrap',
        }}>{label}</span>
      )}
      <svg width="12" height="8" style={{ display: 'block' }}>
        <polygon points="6,8 0,0 12,0" fill={color} />
      </svg>
    </div>
  );
};

/* ── Sub-step ───────────────────────────────────────────────── */
const SubStep = ({ label, desc, color = colors.purple }) => (
  <div style={{
    background: `${color}08`, border: `1px solid ${color}20`,
    borderRadius: '8px', padding: '10px 14px',
  }}>
    <div style={{ fontSize: '12px', fontWeight: 700, color }}>{label}</div>
    <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px', lineHeight: 1.5 }}>{desc}</div>
  </div>
);

/* ── SVG Flow Backbone ──────────────────────────────────────── */
const FlowBackbone = ({ stageRefs, containerRef }) => {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines = [];

      for (let i = 0; i < stageRefs.length - 1; i++) {
        const fromEl = stageRefs[i]?.current;
        const toEl = stageRefs[i + 1]?.current;
        if (!fromEl || !toEl) continue;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const fx = fromRect.left + fromRect.width / 2 - containerRect.left;
        const fy = fromRect.bottom - containerRect.top;
        const tx = toRect.left + toRect.width / 2 - containerRect.left;
        const ty = toRect.top - containerRect.top;
        const midY = (fy + ty) / 2;

        newLines.push({
          d: `M ${fx} ${fy} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`,
          color: pipelineStages[i + 1].color || colors.textDim,
        });
      }
      setLines(newLines);
    };

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, [stageRefs, containerRef]);

  if (lines.length === 0) return null;
  const containerEl = containerRef.current;
  if (!containerEl) return null;

  return (
    <svg
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', overflow: 'visible',
      }}
    >
      {lines.map((line, i) => (
        <g key={i}>
          <path d={line.d} fill="none" stroke={line.color} strokeWidth="1.5" opacity="0.15" />
          <circle r="3" fill={line.color} opacity="0.6">
            <animateMotion dur="3s" repeatCount="indefinite" path={line.d} begin={`${i * 0.6}s`} />
          </circle>
          <circle r="7" fill={line.color} opacity="0.12">
            <animateMotion dur="3s" repeatCount="indefinite" path={line.d} begin={`${i * 0.6}s`} />
          </circle>
        </g>
      ))}
    </svg>
  );
};

/* ── Main Combined Component ────────────────────────────────── */
const PipelineCombined = () => {
  const containerRef = useRef(null);
  const stageRefs = pipelineStages.map(() => useRef(null));
  const [headerRef, headerInView] = useInView({ threshold: 0.1 });

  return (
    <div ref={containerRef} style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', overflow: 'hidden' }}>
      {/* SVG flow backbone */}
      <FlowBackbone stageRefs={stageRefs} containerRef={containerRef} />

      {/* ─── Hero ─── */}
      <div ref={headerRef} style={{
        textAlign: 'center', marginBottom: '32px', paddingTop: '12px',
        opacity: headerInView ? 1 : 0,
        transform: headerInView ? 'translateY(0)' : 'translateY(16px)',
        transition: `all 0.7s ${easing}`,
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 14px',
          background: `linear-gradient(135deg, ${colors.accent}, ${colors.green})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
        }}>⛳</div>
        <h1 style={{
          fontSize: '32px', fontWeight: 700, margin: '0 0 6px',
          background: `linear-gradient(135deg, ${colors.text}, ${colors.textMuted})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
        }}>
          Pipeline Architecture
        </h1>
        <p style={{ color: colors.textDim, fontSize: '14px', margin: 0 }}>
          Flow + Bento + Scroll — the complete picture
        </p>
      </div>

      {/* ─── Bento Stats ─── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px', marginBottom: '16px',
      }}>
        <StatTile label="Stages" numeric={5} color={colors.accent} sub="ingest → analyze" />
        <StatTile label="End-to-End" numeric={6} prefix="~" suffix=" min" color={colors.purple} sub="5-min 60fps video" />
        <StatTile label="Throughput" numeric={57.5} suffix=" fps" decimals={1} color={colors.green} sub="turbo + torch.compile" />
        <StatTile label="Cost" numeric={0.04} prefix="$" decimals={2} color={colors.amber} sub="per video (spot)" />
      </div>

      {/* ─── Stage 1: Ingestion ─── */}
      <StageDivider from={colors.green} to={colors.green} label="Stage 1 — Ingestion" />
      <div ref={stageRefs[0]}>
        <StageCard stage={pipelineStages[0]}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CombinedNode type="s3" title="S3: golf-swing-data" subtitle="{golfer}/raw/" details="Raw .MOV (HEVC 10-bit VFR) or .mp4" />
            <CombinedArrow label="S3 event (.MOV / .mp4)" color={colors.green} />
            <CombinedNode type="sqs" title="SQS: golf-video-label" details="S3 suffix filter triggers notification to queue" delay={120} />
          </div>
        </StageCard>
      </div>

      {/* ─── Stage 2: GPU Processing ─── */}
      <StageDivider from={colors.green} to={colors.purple} label="Stage 2 — GPU Processing" />
      <div ref={stageRefs[1]}>
        <StageCard stage={pipelineStages[1]}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CombinedNode type="ec2" title="EC2 g6.2xlarge (Spot)" subtitle="8 vCPU · L4 24GB GPU · auto-terminates on idle">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <SubStep label="Step 1: Transcode" desc="NVDEC decode (HEVC) → NVENC encode (H.264 CFR). ~24s for 5800 frames. libx264 fallback." />
                <SubStep label="Step 2: Label (Turbo Mode)" desc="NVDEC h264_cuvid → CPU prep → GPU infer. Batched RTMDet + ViTPose-Huge (torch.compile). ~57.5 fps." />
              </div>
            </CombinedNode>
            <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '420px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CombinedArrow label=".pkl (1.2 MB)" color={colors.green} />
                <CombinedNode type="s3" title="S3: /keypoints" delay={120} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CombinedArrow label=".mp4" color={colors.green} />
                <CombinedNode type="s3" title="S3: /processed" delay={240} />
              </div>
            </div>
          </div>
        </StageCard>
      </div>

      {/* ─── Stage 3: Swing Detection ─── */}
      <StageDivider from={colors.purple} to={colors.amber} label="Stage 3 — Swing Detection" />
      <div ref={stageRefs[2]}>
        <StageCard stage={pipelineStages[2]}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CombinedArrow label="S3 event (.pkl)" color={colors.amber} />
            <CombinedNode type="lambda" title="Lambda: swing_detect" details="~13s signal processing. Detects backswings & contacts." />
            <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '420px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CombinedArrow label="PutItem" color={colors.accent} />
                <CombinedNode type="db" title="DynamoDB" subtitle="golf-swing-detections" delay={120} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CombinedArrow label=".json" color={colors.green} />
                <CombinedNode type="s3" title="S3: /detection" delay={240} />
              </div>
            </div>
          </div>
        </StageCard>
      </div>

      {/* ─── Stage 4: Hand & Score ─── */}
      <StageDivider from={colors.amber} to={colors.amber} label="Stage 4 — Hand & Score Finder" />
      <div ref={stageRefs[3]}>
        <StageCard stage={pipelineStages[3]}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CombinedArrow label="S3 event (.json)" color={colors.amber} />
            <CombinedNode type="lambda" title="Lambda: post_processing" details="Reads .json, .pkl, .mp4. Generates visualizations & finger predictions.">
              <div style={{
                background: `${colors.amber}08`, border: `1px solid ${colors.amber}18`,
                borderRadius: '8px', padding: '10px 14px',
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
            </CombinedNode>
          </div>
        </StageCard>
      </div>

      {/* ─── Stage 5: Analysis ─── */}
      <StageDivider from={colors.amber} to={colors.purple} label="Stage 5 — Analysis" />
      <div ref={stageRefs[4]}>
        <StageCard stage={pipelineStages[4]}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              fontSize: '11px', fontWeight: 600, color: colors.textDim,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              background: `${colors.purple}12`, padding: '4px 12px', borderRadius: '10px',
              marginBottom: '12px',
            }}>
              Manual invoke
            </div>
            <CombinedNode type="lambda" title="Lambda: analyze" details={"Requires: golfer, score thresholds, phases.\nGenerates SPM plots + Gemini text analysis."} />
            <CombinedArrow color={colors.purple} />
            <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '420px', flexWrap: 'wrap' }}>
              {[
                { type: 's3', title: 'S3: /analysis', sub: 'Plots, Gemini TXT' },
                { type: 'db', title: 'DynamoDB', sub: 'ANALYSIS item' },
                { type: 'default', title: 'Pushover', sub: 'Mobile notification' },
              ].map((item, i) => (
                <div key={item.title} style={{ flex: '1 1 120px' }}>
                  <CombinedNode type={item.type} title={item.title} subtitle={item.sub} delay={i * 120} />
                </div>
              ))}
            </div>
          </div>
        </StageCard>
      </div>
    </div>
  );
};

export default PipelineCombined;

import React, { useState, useEffect, useRef } from 'react';
import { colors, serviceColors, pipelineStages, heroStats } from './pipelineData';
import AnimatedNumber from './components/AnimatedNumber';
import useInView from './hooks/useInView';

const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ── Stage Divider ──────────────────────────────────────────── */
const StageDivider = ({ from, to, label }) => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <div ref={ref} style={{
      width: '100vw', marginLeft: 'calc(-50vw + 50%)',
      padding: '32px 24px',
      background: `linear-gradient(135deg, ${from}12, ${to}08)`,
      textAlign: 'center',
      opacity: inView ? 1 : 0,
      transition: `opacity 0.6s ${easing}`,
      margin: '40px 0 40px calc(-50vw + 50%)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <div style={{ flex: 1, maxWidth: '120px', height: '1px', background: `${from}40` }} />
        <span style={{
          fontSize: '12px', fontWeight: 600, color: colors.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          {label}
        </span>
        <div style={{ flex: 1, maxWidth: '120px', height: '1px', background: `${to}40` }} />
      </div>
    </div>
  );
};

/* ── Scroll Reveal Card ─────────────────────────────────────── */
const RevealCard = ({ children, delay = 0, color = colors.accent, style: extra }) => {
  const [ref, inView] = useInView({ threshold: 0.15 });

  return (
    <div ref={ref} style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.6s ${easing} ${delay}ms, transform 0.6s ${easing} ${delay}ms`,
      ...extra,
    }}>
      {children}
    </div>
  );
};

/* ── Scroll Stat Card ───────────────────────────────────────── */
const ScrollStat = ({ label, numeric, prefix = '', suffix = '', decimals = 0, sub, color, delay = 0 }) => {
  const [ref, inView] = useInView({ threshold: 0.3 });

  return (
    <div ref={ref} style={{
      background: `linear-gradient(135deg, ${color}08, ${color}04)`,
      border: `1px solid ${color}25`,
      borderRadius: '12px', padding: '18px 20px',
      opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `all 0.6s ${easing} ${delay}ms`,
    }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1.1, fontFamily: "'JetBrains Mono', monospace" }}>
        <AnimatedNumber value={numeric} prefix={prefix} suffix={suffix} decimals={decimals} active={inView} />
      </div>
      {sub && <div style={{ fontSize: '11px', color: colors.textDim, marginTop: '4px' }}>{sub}</div>}
    </div>
  );
};

/* ── SVG Connecting Line ────────────────────────────────────── */
const ConnectingLine = ({ color = colors.textDim }) => {
  const [ref, inView] = useInView({ threshold: 0.5 });
  return (
    <div ref={ref} style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
      <svg width="2" height="48" style={{ display: 'block' }}>
        <line
          x1="1" y1="0" x2="1" y2="48"
          stroke={color} strokeWidth="2"
          strokeDasharray="48"
          strokeDashoffset={inView ? 0 : 48}
          style={{ transition: `stroke-dashoffset 0.8s ease` }}
        />
      </svg>
    </div>
  );
};

/* ── Pipeline Node ──────────────────────────────────────────── */
const ScrollNode = ({ title, subtitle, details, type = 'default', children, delay = 0 }) => {
  const borderColor = serviceColors[type] || serviceColors.default;
  const [ref, inView] = useInView({ threshold: 0.15 });

  return (
    <div ref={ref} style={{
      background: colors.card,
      border: `1px solid ${colors.cardBorder}`,
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: '10px',
      padding: '16px 20px',
      width: '100%',
      maxWidth: '420px',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateX(0)' : 'translateX(-20px)',
      transition: `all 0.6s ${easing} ${delay}ms`,
    }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>{title}</div>
      {subtitle && <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, marginTop: '3px' }}>{subtitle}</div>}
      {details && <div style={{ fontSize: '12px', color: colors.textDim, marginTop: '6px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{details}</div>}
      {children && <div style={{ marginTop: '10px', width: '100%' }}>{children}</div>}
    </div>
  );
};

/* ── Arrow with reveal ──────────────────────────────────────── */
const ScrollArrow = ({ label, color = colors.textDim }) => {
  const [ref, inView] = useInView({ threshold: 0.5 });
  return (
    <div ref={ref} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0',
      opacity: inView ? 1 : 0, transition: `opacity 0.5s ${easing}`,
    }}>
      <svg width="2" height="24" style={{ display: 'block' }}>
        <line x1="1" y1="0" x2="1" y2="24" stroke={color} strokeWidth="2"
          strokeDasharray="24" strokeDashoffset={inView ? 0 : 24}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
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

/* ── Parallax Hero ──────────────────────────────────────────── */
const ParallaxHero = ({ children }) => {
  const [offset, setOffset] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setOffset(rect.top * 0.3);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={ref} style={{ transform: `translateY(${offset}px)` }}>
      {children}
    </div>
  );
};

/* ── Main Scroll Component ──────────────────────────────────── */
const PipelineScroll = () => {
  const [headerRef, headerInView] = useInView({ threshold: 0.1 });

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', overflow: 'hidden' }}>
      {/* ─── Hero with parallax ─── */}
      <ParallaxHero>
        <div ref={headerRef} style={{
          textAlign: 'center', marginBottom: '48px', paddingTop: '20px',
          opacity: headerInView ? 1 : 0,
          transform: headerInView ? 'translateY(0)' : 'translateY(20px)',
          transition: `all 0.8s ${easing}`,
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.green})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
          }}>⛳</div>
          <h1 style={{
            fontSize: '36px', fontWeight: 700, margin: '0 0 8px',
            background: `linear-gradient(135deg, ${colors.text}, ${colors.textMuted})`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            Pipeline Architecture
          </h1>
          <p style={{ color: colors.textDim, fontSize: '15px', margin: 0 }}>
            From phone to analysis in ~6 minutes
          </p>
        </div>
      </ParallaxHero>

      {/* ─── Animated Stats ─── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px',
        marginBottom: '24px',
      }}>
        <ScrollStat label="Stages" numeric={5} color={colors.accent} delay={0} sub="ingest → analyze" />
        <ScrollStat label="End-to-End" numeric={6} prefix="~" suffix=" min" color={colors.purple} delay={120} sub="5-min 60fps video" />
        <ScrollStat label="Throughput" numeric={57.5} suffix=" fps" decimals={1} color={colors.green} delay={240} sub="turbo + torch.compile" />
        <ScrollStat label="Cost" numeric={0.04} prefix="$" decimals={2} color={colors.amber} delay={360} sub="per video (spot)" />
      </div>

      {/* ─── Stage 1: Ingestion ─── */}
      <StageDivider from={colors.green} to={colors.green} label="Stage 1 — Ingestion" />
      <RevealCard color={colors.green}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>📥</span>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>Ingestion</div>
            <div style={{ fontSize: '12px', color: colors.textDim }}>Raw upload → S3 event → SQS queue</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ScrollNode type="s3" title="S3: golf-swing-data" subtitle="{golfer}/raw/" details="Raw .MOV (HEVC 10-bit VFR) or .mp4" />
          <ScrollArrow label="S3 event (.MOV / .mp4)" color={colors.green} />
          <ScrollNode type="sqs" title="SQS: golf-video-label" details="S3 suffix filter triggers notification to queue" delay={120} />
        </div>
      </RevealCard>

      {/* ─── Stage 2: GPU Processing ─── */}
      <ConnectingLine color={colors.purple} />
      <StageDivider from={colors.green} to={colors.purple} label="Stage 2 — GPU Processing" />
      <RevealCard color={colors.purple}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>🚂</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>GPU Processing</div>
            <div style={{ fontSize: '12px', color: colors.textDim }}>EC2 spot worker — transcode + pose estimation</div>
          </div>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600,
            color: colors.accent, background: `${colors.accent}15`,
            padding: '4px 10px', borderRadius: '6px',
          }}>g6.2xlarge</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ScrollNode type="ec2" title="EC2 g6.2xlarge (Spot)" subtitle="8 vCPU · L4 24GB GPU · auto-terminates on idle">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SubStep label="Step 1: Transcode" desc="NVDEC decode (HEVC) → NVENC encode (H.264 CFR). ~24s for 5800 frames. libx264 fallback." color={colors.purple} />
              <SubStep label="Step 2: Label (Turbo Mode)" desc="NVDEC h264_cuvid → CPU prep → GPU infer. Batched RTMDet + ViTPose-Huge (torch.compile). ~57.5 fps." color={colors.purple} />
            </div>
          </ScrollNode>
          <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '420px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScrollArrow label=".pkl (1.2 MB)" color={colors.green} />
              <ScrollNode type="s3" title="S3: /keypoints" delay={120} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScrollArrow label=".mp4" color={colors.green} />
              <ScrollNode type="s3" title="S3: /processed" delay={240} />
            </div>
          </div>
        </div>
      </RevealCard>

      {/* ─── Stage 3: Swing Detection ─── */}
      <ConnectingLine color={colors.amber} />
      <StageDivider from={colors.purple} to={colors.amber} label="Stage 3 — Swing Detection" />
      <RevealCard color={colors.amber}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>Swing Landmark Detection</div>
            <div style={{ fontSize: '12px', color: colors.textDim }}>Signal processing on keypoints → backswing & contact frames</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ScrollArrow label="S3 event (.pkl)" color={colors.amber} />
          <ScrollNode type="lambda" title="Lambda: swing_detect" details="~13s signal processing. Detects backswings & contacts." />
          <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '420px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScrollArrow label="PutItem" color={colors.accent} />
              <ScrollNode type="db" title="DynamoDB" subtitle="golf-swing-detections" delay={120} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScrollArrow label=".json" color={colors.green} />
              <ScrollNode type="s3" title="S3: /detection" delay={240} />
            </div>
          </div>
        </div>
      </RevealCard>

      {/* ─── Stage 4: Hand & Score ─── */}
      <ConnectingLine color={colors.amber} />
      <StageDivider from={colors.amber} to={colors.amber} label="Stage 4 — Hand & Score Finder" />
      <RevealCard color={colors.amber}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>✌️</span>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>Hand & Score Finder</div>
            <div style={{ fontSize: '12px', color: colors.textDim }}>Visualizations, finger predictions & notifications</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ScrollArrow label="S3 event (.json)" color={colors.amber} />
          <ScrollNode type="lambda" title="Lambda: post_processing" details="Reads .json, .pkl, .mp4. Generates visualizations & finger predictions.">
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
          </ScrollNode>
        </div>
      </RevealCard>

      {/* ─── Stage 5: Analysis ─── */}
      <ConnectingLine color={colors.purple} />
      <StageDivider from={colors.amber} to={colors.purple} label="Stage 5 — Analysis" />
      <RevealCard color={colors.purple} style={{
        background: `linear-gradient(135deg, ${colors.purple}08, ${colors.purple}03)`,
        border: `1px solid ${colors.purple}20`,
        marginBottom: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>📊</span>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>Analysis</div>
            <div style={{ fontSize: '12px', color: colors.textDim }}>On-demand biomechanical analysis</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            fontSize: '11px', fontWeight: 600, color: colors.textDim,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            background: `${colors.purple}12`, padding: '4px 12px', borderRadius: '10px',
            marginBottom: '12px',
          }}>
            Manual invoke
          </div>
          <ScrollNode type="lambda" title="Lambda: analyze" details={"Requires: golfer, score thresholds, phases.\nGenerates SPM plots + Gemini text analysis."} />
          <ScrollArrow color={colors.purple} />
          <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '420px', flexWrap: 'wrap' }}>
            {[
              { type: 's3', title: 'S3: /analysis', sub: 'Plots, Gemini TXT' },
              { type: 'db', title: 'DynamoDB', sub: 'ANALYSIS item' },
              { type: 'default', title: 'Pushover', sub: 'Mobile notification' },
            ].map((item, i) => (
              <div key={item.title} style={{ flex: '1 1 120px' }}>
                <ScrollNode type={item.type} title={item.title} subtitle={item.sub} delay={i * 120} />
              </div>
            ))}
          </div>
        </div>
      </RevealCard>
    </div>
  );
};

export default PipelineScroll;

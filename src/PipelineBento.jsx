import React, { useState } from 'react';
import { colors, serviceColors, pipelineStages, heroStats } from './pipelineData';
import AnimatedNumber from './components/AnimatedNumber';
import useInView from './hooks/useInView';

const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ── Keyframes (injected once) ───────────────────────────────── */
const BentoStyles = () => (
  <style>{`
    @keyframes bento-border-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes bento-flow-pulse {
      0%, 100% { opacity: 0.15; transform: scale(0.7); }
      50% { opacity: 0.85; transform: scale(1.3); }
    }
  `}</style>
);

/* ── Dot-Grid Background ─────────────────────────────────────── */
const DotGrid = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `radial-gradient(circle, ${colors.textDim}15 1px, transparent 1px)`,
    backgroundSize: '32px 32px',
    maskImage: 'radial-gradient(ellipse 80% 50% at 50% 35%, black 15%, transparent 65%)',
    WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 35%, black 15%, transparent 65%)',
  }} />
);

/* ── Flow Connector (between tile groups) ────────────────────── */
const FlowConnector = ({ color = colors.textDim, label }) => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <div ref={ref} style={{
      gridColumn: '1 / -1',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '0', padding: '20px 0',
      opacity: inView ? 1 : 0,
      transition: `opacity 0.6s ${easing}`,
    }}>
      {/* Top gradient rule */}
      <div style={{
        width: '100%', height: '1px',
        background: `linear-gradient(to right, transparent 5%, ${color}30 30%, ${color}30 70%, transparent 95%)`,
      }} />

      {/* Dots + label row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '8px', padding: '14px 0',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '5px', height: '5px', borderRadius: '50%', background: color,
            animation: inView ? `bento-flow-pulse 2s ${easing} ${i * 0.35}s infinite` : 'none',
          }} />
        ))}
        {label && <span style={{
          fontSize: '10px', fontWeight: 600, color: `${color}bb`,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          fontFamily: "'JetBrains Mono', monospace",
          padding: '0 4px',
        }}>{label}</span>}
        {[0, 1, 2].map(i => (
          <div key={i + 3} style={{
            width: '5px', height: '5px', borderRadius: '50%', background: color,
            animation: inView ? `bento-flow-pulse 2s ${easing} ${(i + 3) * 0.35}s infinite` : 'none',
          }} />
        ))}
      </div>

      {/* Bottom gradient rule */}
      <div style={{
        width: '100%', height: '1px',
        background: `linear-gradient(to right, transparent 5%, ${color}30 30%, ${color}30 70%, transparent 95%)`,
      }} />
    </div>
  );
};

/* ── Bento Tile ─────────────────────────────────────────────── */
const BentoTile = ({ children, span = 1, rowSpan = 1, color = colors.accent, glowOnHover = true, style: extraStyle, delay = 0 }) => {
  const [hovered, setHovered] = useState(false);
  const [ref, inView] = useInView({ threshold: 0.1 });

  return (
    /* Entrance wrapper — handles fade + slide-up with stagger delay */
    <div ref={ref} style={{
      gridColumn: `span ${span}`,
      gridRow: `span ${rowSpan}`,
      display: 'flex',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(16px)',
      transition: `opacity 0.6s ${easing} ${delay}ms, transform 0.6s ${easing} ${delay}ms`,
    }}>
      {/* Hover wrapper — handles scale + animated border */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1,
          display: 'flex',
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          background: colors.cardBorder,
          transition: `transform 0.35s ${easing}, box-shadow 0.35s ${easing}`,
          transform: hovered ? 'scale(1.015)' : 'scale(1)',
          boxShadow: hovered ? `0 8px 32px ${color}20` : 'none',
        }}
      >
        {/* Rotating conic-gradient — visible on hover as the "border" */}
        {glowOnHover && (
          <div style={{
            position: 'absolute', top: '-50%', left: '-50%',
            width: '200%', height: '200%',
            background: `conic-gradient(from 0deg, transparent, ${color}45, transparent, transparent, ${color}45, transparent)`,
            animation: 'bento-border-spin 4s linear infinite',
            opacity: hovered ? 1 : 0,
            transition: `opacity 0.5s ${easing}`,
            pointerEvents: 'none',
          }} />
        )}

        {/* Inner content — 1px inset reveals the border */}
        <div style={{
          flex: 1,
          position: 'relative',
          margin: '1px',
          borderRadius: '15px',
          background: colors.card,
          padding: '24px',
          ...extraStyle,
        }}>
          {glowOnHover && (
            <div style={{
              position: 'absolute', top: '-50%', right: '-30%',
              width: '200px', height: '200px', borderRadius: '50%',
              background: `radial-gradient(circle, ${color}${hovered ? '15' : '08'} 0%, transparent 70%)`,
              transition: `all 0.5s ${easing}`, pointerEvents: 'none',
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>
      </div>
    </div>
  );
};

/* ── Stat Tile (1x1) ────────────────────────────────────────── */
const StatTile = ({ label, value, sub, color, numeric, prefix = '', suffix = '', decimals = 0, delay = 0 }) => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <BentoTile color={color} delay={delay}>
      <div ref={ref}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: colors.textDim,
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '42px', fontWeight: 700, color,
          fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
        }}>
          {numeric != null
            ? <AnimatedNumber value={numeric} prefix={prefix} suffix={suffix} decimals={decimals} active={inView} />
            : value}
        </div>
        {sub && <div style={{ fontSize: '11px', color: colors.textDim, marginTop: '6px' }}>{sub}</div>}
      </div>
    </BentoTile>
  );
};

/* ── Stage Tile ─────────────────────────────────────────────── */
const StageTile = ({ stage, span = 1, rowSpan = 1, delay = 0 }) => {
  const svcColor = serviceColors[stage.service] || serviceColors.default;

  return (
    <BentoTile span={span} rowSpan={rowSpan} color={svcColor} delay={delay}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ fontSize: '20px' }}>{stage.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>{stage.title}</div>
          <div style={{ fontSize: '11px', color: colors.textDim, marginTop: '2px' }}>{stage.sub}</div>
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 600, color: svcColor,
          background: `${svcColor}15`, padding: '3px 10px', borderRadius: '6px',
          textTransform: 'uppercase',
        }}>
          {stage.service}
        </span>
      </div>

      {/* Nodes */}
      {stage.nodes.filter(n => !n.arrow).map((node, i) => (
        <div key={i} style={{
          background: `${svcColor}06`,
          borderLeft: `2px solid ${svcColor}`,
          borderRadius: '0 8px 8px 0',
          padding: '10px 14px',
          marginBottom: '8px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.text }}>{node.title}</div>
          {node.subtitle && <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{node.subtitle}</div>}
          {node.details && <div style={{ fontSize: '11px', color: colors.textDim, marginTop: '4px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{node.details}</div>}
          {node.steps && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {node.steps.map((step, j) => (
                <div key={j} style={{
                  background: `${colors.purple}08`, border: `1px solid ${colors.purple}12`,
                  borderRadius: '6px', padding: '8px 10px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: colors.purple }}>{step.label}</div>
                  <div style={{ fontSize: '10px', color: colors.textDim, marginTop: '2px', lineHeight: 1.4 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          )}
          {node.outputs && (
            <div style={{ marginTop: '8px' }}>
              {node.outputs.map((o, k) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: svcColor }} />
                  <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: svcColor }}>{o.key}</span>
                  <span style={{ fontSize: '10px', color: colors.textDim }}>— {o.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Outputs row */}
      {stage.outputs && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
          {stage.outputs.map((out, i) => {
            const outColor = serviceColors[out.type] || colors.textDim;
            return (
              <div key={i} style={{
                flex: '1 1 80px',
                background: `${outColor}08`, border: `1px solid ${outColor}15`,
                borderRadius: '8px', padding: '8px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: outColor }}>{out.title}</div>
                {out.subtitle && <div style={{ fontSize: '9px', color: colors.textDim, marginTop: '2px' }}>{out.subtitle}</div>}
                {out.label && <div style={{ fontSize: '9px', fontFamily: "'JetBrains Mono', monospace", color: colors.textDim, marginTop: '2px' }}>{out.label}</div>}
              </div>
            );
          })}
        </div>
      )}
    </BentoTile>
  );
};

/* ── Main Bento Grid ────────────────────────────────────────── */
const PipelineBento = () => {
  const [ref, inView] = useInView({ threshold: 0.05 });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative' }}>
      <BentoStyles />
      <DotGrid />

      {/* Header */}
      <div ref={ref} style={{
        textAlign: 'center', marginBottom: '32px', position: 'relative',
        opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: `all 0.7s ${easing}`,
      }}>
        <h1 style={{
          fontSize: '28px', fontWeight: 700, margin: '0 0 6px',
          background: `linear-gradient(135deg, ${colors.text}, ${colors.textMuted})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Pipeline Architecture
        </h1>
        <p style={{ color: colors.textDim, fontSize: '13px', margin: 0 }}>
          End-to-end golf swing processing at a glance
        </p>
      </div>

      {/* Bento Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        position: 'relative',
      }}>
        {/* Hero tile — pipeline overview (2-col) */}
        <BentoTile span={2} color={colors.accent} delay={0} style={{
          background: `linear-gradient(135deg, ${colors.card}, ${colors.bg})`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.green})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>⛳</div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>Golf Swing Pipeline</div>
              <div style={{ fontSize: '12px', color: colors.textDim }}>
                Phone → S3 → GPU → Detection → Analysis
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', gap: '12px', flexWrap: 'wrap',
            background: `${colors.accent}06`, borderRadius: '10px', padding: '14px',
          }}>
            {['📥 Ingest', '🚂 GPU', '🎯 Detect', '✌️ Hands', '📊 Analyze'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px' }}>{s}</span>
                {i < 4 && <span style={{ color: colors.textDim, fontSize: '12px' }}>→</span>}
              </div>
            ))}
          </div>
        </BentoTile>

        {/* Stat tiles (staggered entrance) */}
        <StatTile {...heroStats[0]} delay={60} />
        <StatTile {...heroStats[1]} prefix="~" suffix=" min" decimals={0} numeric={6} delay={120} />
        <StatTile {...heroStats[2]} suffix=" fps" decimals={1} delay={180} />
        <StatTile {...heroStats[3]} prefix="$" suffix="" decimals={2} delay={240} />

        {/* ── Flow: upload → processing ── */}
        <FlowConnector color={colors.green} label="S3 → SQS" />

        {/* GPU Processing (2-col) */}
        <StageTile stage={pipelineStages[1]} span={2} delay={0} />

        {/* Ingestion */}
        <StageTile stage={pipelineStages[0]} delay={60} />

        {/* Swing Detection */}
        <StageTile stage={pipelineStages[2]} delay={120} />

        {/* ── Flow: detection → post-processing ── */}
        <FlowConnector color={colors.amber} label=".pkl → Lambda" />

        {/* Hand & Score Finder (2-col) */}
        <StageTile stage={pipelineStages[3]} span={2} delay={0} />

        {/* Analysis (2-col) */}
        <StageTile stage={pipelineStages[4]} span={2} delay={60} />
      </div>
    </div>
  );
};

export default PipelineBento;

import React, { useState } from 'react';
import { colors, serviceColors, pipelineStages, heroStats } from './pipelineData';
import AnimatedNumber from './components/AnimatedNumber';
import useInView from './hooks/useInView';

const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ── Bento Tile ─────────────────────────────────────────────── */
const BentoTile = ({ children, span = 1, rowSpan = 1, color = colors.accent, glowOnHover = true, style: extraStyle }) => {
  const [hovered, setHovered] = useState(false);
  const [ref, inView] = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: `span ${span}`,
        gridRow: `span ${rowSpan}`,
        background: colors.card,
        border: `1px solid ${hovered && glowOnHover ? color + '40' : colors.cardBorder}`,
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        transition: `all 0.35s ${easing}`,
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: hovered ? `0 8px 32px ${color}15` : 'none',
        opacity: inView ? 1 : 0,
        ...extraStyle,
      }}
    >
      {/* Subtle gradient glow */}
      {glowOnHover && (
        <div style={{
          position: 'absolute', top: '-50%', right: '-30%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: `radial-gradient(circle, ${color}${hovered ? '15' : '08'} 0%, transparent 70%)`,
          transition: `all 0.5s ${easing}`,
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

/* ── Stat Tile (1x1) ────────────────────────────────────────── */
const StatTile = ({ label, value, sub, color, numeric, prefix = '', suffix = '', decimals = 0 }) => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <BentoTile color={color}>
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
const StageTile = ({ stage, span = 1, rowSpan = 1 }) => {
  const svcColor = serviceColors[stage.service] || serviceColors.default;

  return (
    <BentoTile span={span} rowSpan={rowSpan} color={svcColor}>
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
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div ref={ref} style={{
        textAlign: 'center', marginBottom: '32px',
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
      }}>
        {/* Hero tile — pipeline overview (2-col) */}
        <BentoTile span={2} color={colors.accent} style={{
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
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ fontSize: '13px' }}>{s}</span>
                {i < 4 && <span style={{ color: colors.textDim, fontSize: '12px' }}>→</span>}
              </div>
            ))}
          </div>
        </BentoTile>

        {/* Stat tiles */}
        <StatTile {...heroStats[0]} />
        <StatTile {...heroStats[1]} prefix="~" suffix=" min" decimals={0} numeric={6} />
        <StatTile {...heroStats[2]} suffix=" fps" decimals={1} />
        <StatTile {...heroStats[3]} prefix="$" suffix="" decimals={2} />

        {/* GPU Processing — featured large tile (2-col, 2-row) */}
        <StageTile stage={pipelineStages[1]} span={2} rowSpan={2} />

        {/* Ingestion */}
        <StageTile stage={pipelineStages[0]} />

        {/* Swing Detection */}
        <StageTile stage={pipelineStages[2]} />

        {/* Hand & Score Finder (2-col) */}
        <StageTile stage={pipelineStages[3]} span={2} />

        {/* Analysis */}
        <StageTile stage={pipelineStages[4]} span={2} />
      </div>
    </div>
  );
};

export default PipelineBento;

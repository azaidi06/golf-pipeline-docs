import React, { useState, useEffect, useRef, useCallback } from 'react';
import { colors, serviceColors, pipelineStages, heroStats } from './pipelineData';

const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ── Service icon mapping ───────────────────────────────────── */
const serviceIcons = {
  s3: '🪣', sqs: '📬', ec2: '🖥️', lambda: '⚡', db: '🗃️', default: '📦',
};

/* ── Flow Node Chip ─────────────────────────────────────────── */
const FlowNode = ({ stage, expanded, onToggle, style }) => {
  const svcColor = serviceColors[stage.service] || serviceColors.default;

  return (
    <div
      onClick={onToggle}
      style={{
        position: 'absolute',
        ...style,
        background: colors.card,
        border: `1px solid ${expanded ? svcColor + '60' : colors.cardBorder}`,
        borderRadius: '14px',
        padding: expanded ? '20px' : '12px 18px',
        cursor: 'pointer',
        transition: `all 0.45s ${easing}`,
        zIndex: expanded ? 20 : 10,
        boxShadow: expanded ? `0 8px 32px ${svcColor}20` : 'none',
        width: expanded ? '320px' : 'auto',
        maxWidth: expanded ? '320px' : '220px',
      }}
    >
      {/* Chip header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '16px' }}>{stage.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px', fontWeight: 700, color: colors.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {stage.title}
          </div>
          {!expanded && (
            <div style={{ fontSize: '11px', color: colors.textDim, marginTop: '2px' }}>
              {stage.sub}
            </div>
          )}
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 600, color: svcColor,
          background: `${svcColor}15`, padding: '3px 8px', borderRadius: '6px',
          whiteSpace: 'nowrap', textTransform: 'uppercase',
        }}>
          {stage.service}
        </span>
      </div>

      {/* Expanded details */}
      <div style={{
        maxHeight: expanded ? '500px' : '0px',
        opacity: expanded ? 1 : 0,
        overflow: 'hidden',
        transition: `max-height 0.45s ${easing}, opacity 0.3s ease`,
        marginTop: expanded ? '14px' : '0',
      }}>
        <div style={{
          fontSize: '12px', color: colors.textMuted, lineHeight: 1.6,
          paddingTop: '12px', borderTop: `1px solid ${colors.cardBorder}`,
        }}>
          {stage.sub}
        </div>

        {/* Node details */}
        {stage.nodes.filter(n => !n.arrow).map((node, i) => (
          <div key={i} style={{
            background: `${svcColor}08`,
            border: `1px solid ${svcColor}18`,
            borderRadius: '8px',
            padding: '10px 14px',
            marginTop: '10px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: svcColor }}>{node.title}</div>
            {node.subtitle && <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{node.subtitle}</div>}
            {node.details && <div style={{ fontSize: '11px', color: colors.textDim, marginTop: '4px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{node.details}</div>}
            {node.steps && node.steps.map((step, j) => (
              <div key={j} style={{
                background: `${colors.purple}08`, border: `1px solid ${colors.purple}15`,
                borderRadius: '6px', padding: '8px 10px', marginTop: '6px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: colors.purple }}>{step.label}</div>
                <div style={{ fontSize: '10px', color: colors.textDim, marginTop: '2px', lineHeight: 1.4 }}>{step.desc}</div>
              </div>
            ))}
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

        {/* Outputs */}
        {stage.outputs && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            {stage.outputs.map((out, i) => (
              <div key={i} style={{
                flex: '1 1 80px',
                background: `${serviceColors[out.type] || colors.textDim}08`,
                border: `1px solid ${serviceColors[out.type] || colors.textDim}18`,
                borderRadius: '6px', padding: '8px 10px',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: serviceColors[out.type] || colors.textDim }}>{out.title}</div>
                {out.subtitle && <div style={{ fontSize: '9px', color: colors.textDim, marginTop: '2px' }}>{out.subtitle}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Flow Component ────────────────────────────────────── */
const PipelineFlow = () => {
  const containerRef = useRef(null);
  const [expanded, setExpanded] = useState(null);
  const [positions, setPositions] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);

  // Compute node positions based on container width
  const computePositions = useCallback((width) => {
    const isWide = width > 700;
    const stages = pipelineStages;

    if (isWide) {
      // Horizontal zigzag layout
      const xLeft = 40;
      const xRight = width - 280;
      const xCenter = width / 2 - 110;
      return stages.map((_, i) => {
        const y = 100 + i * 160;
        const x = i === 0 ? xLeft : i === stages.length - 1 ? xCenter : (i % 2 === 1 ? xRight : xLeft);
        return { x, y };
      });
    } else {
      // Vertical centered
      return stages.map((_, i) => ({
        x: Math.max(10, width / 2 - 110),
        y: 100 + i * 180,
      }));
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.offsetWidth;
      setContainerWidth(w);
      setPositions(computePositions(w));
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [computePositions]);

  const totalHeight = positions.length > 0
    ? Math.max(...positions.map(p => p.y)) + 240
    : 1200;

  // Build SVG path segments between consecutive nodes
  const buildPaths = () => {
    if (positions.length < 2) return [];
    const paths = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const from = positions[i];
      const to = positions[i + 1];
      const fx = from.x + 110;
      const fy = from.y + 50;
      const tx = to.x + 110;
      const ty = to.y;
      const midY = (fy + ty) / 2;
      const d = `M ${fx} ${fy} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
      paths.push({ d, color: pipelineStages[i + 1].color || colors.textDim, index: i });
    }
    return paths;
  };

  const paths = buildPaths();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center', marginBottom: '16px',
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        transition: `all 0.7s ${easing}`,
      }}>
        <h1 style={{
          fontSize: '28px', fontWeight: 700, margin: '0 0 6px',
          background: `linear-gradient(135deg, ${colors.text}, ${colors.textMuted})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Pipeline Flow
        </h1>
        <p style={{ color: colors.textDim, fontSize: '13px', margin: 0 }}>
          Click any node to expand details
        </p>
      </div>

      {/* Hero stats row */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap',
        opacity: mounted ? 1 : 0, transition: `opacity 0.6s ${easing} 0.2s`,
      }}>
        {heroStats.map(s => (
          <div key={s.label} style={{
            background: `${s.color}08`, border: `1px solid ${s.color}20`,
            borderRadius: '10px', padding: '10px 18px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {s.value}
            </div>
            <div style={{ fontSize: '10px', color: colors.textDim, textTransform: 'uppercase', fontWeight: 600, marginTop: '2px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Flow diagram container */}
      <div ref={containerRef} style={{ position: 'relative', minHeight: `${totalHeight}px`, width: '100%' }}>
        {/* SVG connections */}
        <svg
          width={containerWidth}
          height={totalHeight}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
        >
          <defs>
            {paths.map((p, i) => (
              <linearGradient key={`grad-${i}`} id={`flowGrad${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={pipelineStages[i].color || colors.textDim} stopOpacity="0.6" />
                <stop offset="100%" stopColor={p.color} stopOpacity="0.6" />
              </linearGradient>
            ))}
          </defs>

          {paths.map((p, i) => {
            const pathLen = 400; // approximate
            return (
              <g key={i}>
                {/* Background path */}
                <path
                  d={p.d}
                  fill="none"
                  stroke={`url(#flowGrad${i})`}
                  strokeWidth="2"
                  strokeDasharray={pathLen}
                  strokeDashoffset={mounted ? 0 : pathLen}
                  style={{
                    transition: `stroke-dashoffset 1.2s ease ${0.3 + i * 0.2}s`,
                    opacity: 0.4,
                  }}
                />
                {/* Animated pulsing dot */}
                {mounted && (
                  <circle r="4" fill={p.color} opacity="0.8">
                    <animateMotion
                      dur="2.5s"
                      repeatCount="indefinite"
                      path={p.d}
                      begin={`${i * 0.5}s`}
                    />
                  </circle>
                )}
                {/* Glow dot */}
                {mounted && (
                  <circle r="8" fill={p.color} opacity="0.2">
                    <animateMotion
                      dur="2.5s"
                      repeatCount="indefinite"
                      path={p.d}
                      begin={`${i * 0.5}s`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Flow nodes */}
        {pipelineStages.map((stage, i) => {
          const pos = positions[i];
          if (!pos) return null;
          return (
            <FlowNode
              key={stage.id}
              stage={stage}
              expanded={expanded === stage.id}
              onToggle={() => setExpanded(expanded === stage.id ? null : stage.id)}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'scale(1)' : 'scale(0.9)',
                transition: `opacity 0.5s ${easing} ${0.1 + i * 0.12}s, transform 0.5s ${easing} ${0.1 + i * 0.12}s, all 0.45s ${easing}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PipelineFlow;

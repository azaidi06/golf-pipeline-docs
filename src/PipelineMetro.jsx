import React, { useState, useEffect, useRef } from 'react';
import { colors, serviceColors, pipelineStages, heroStats } from './pipelineData';
import useInView from './hooks/useInView';

const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
const mono = '"JetBrains Mono", monospace';

/* ── Keyframes (injected once) ───────────────────────────────── */
const MetroStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes station-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
      50% { box-shadow: 0 0 12px 4px rgba(255,255,255,0.15); }
    }
    @keyframes dot-glow {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes led-flicker {
      0%, 100% { opacity: 1; }
      92% { opacity: 1; }
      93% { opacity: 0.7; }
      94% { opacity: 1; }
    }
  `}} />
);

/* ── Layout constants ────────────────────────────────────────── */
const VERTICAL_SPACING = 180;
const SVG_PAD_TOP = 40;
const PATH_LEN_ESTIMATE = 600;

/**
 * Compute station positions zigzagging left/right.
 * In compact mode (< 640px), all stations center at x=50.
 */
function stationPositions(stages, compact) {
  return stages.map((_, i) => ({
    x: compact ? 50 : (i % 2 === 0 ? 20 : 80),
    y: SVG_PAD_TOP + i * VERTICAL_SPACING,
  }));
}

/**
 * Build angular metro-style SVG path between two stations.
 * Uses only horizontal, vertical, and 45-degree diagonal segments
 * for an authentic transit-map aesthetic.
 */
function metroPath(from, to, svgW) {
  const x1 = (from.x / 100) * svgW, y1 = from.y;
  const x2 = (to.x / 100) * svgW, y2 = to.y;

  // Straight vertical in compact mode
  if (x1 === x2) return `M ${x1} ${y1} L ${x2} ${y2}`;

  // Diagonal-then-vertical-then-horizontal routing
  const dx = x2 - x1;
  const diagLen = Math.min(Math.abs(dx), (y2 - y1) * 0.4);
  const diagX = x1 + Math.sign(dx) * diagLen;
  const diagY = y1 + diagLen;

  return `M ${x1} ${y1} L ${diagX} ${diagY} L ${diagX} ${y2} L ${x2} ${y2}`;
}

/** Reusable pill badge for service tags */
const Pill = ({ color, children }) => (
  <span style={{
    fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 4,
    background: `${color}15`, color, border: `1px solid ${color}30`,
  }}>
    {children}
  </span>
);

/* ── Departure Board ─────────────────────────────────────────── */
const DepartureBoard = () => {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setRevealed(true), 200);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <div ref={ref} style={{
      background: '#1a1a2e', border: `1px solid ${colors.cardBorder}`,
      borderRadius: 10, padding: '24px 20px', marginBottom: 48,
      boxShadow: '0 0 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
    }}>
      {/* Board header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 18, borderBottom: `1px solid ${colors.divider}`, paddingBottom: 12,
      }}>
        <span style={{ fontSize: 18 }}>🚇</span>
        <span style={{
          fontFamily: mono, fontSize: 13, fontWeight: 700, letterSpacing: 2,
          color: colors.amber, textTransform: 'uppercase',
          textShadow: '0 0 8px #fbbf24',
        }}>
          Pipeline Departures
        </span>
        <span style={{
          marginLeft: 'auto', fontFamily: mono, fontSize: 11, color: colors.textDim,
        }}>
          LIVE
        </span>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: colors.green,
          boxShadow: `0 0 6px ${colors.green}`, animation: 'dot-glow 2s ease infinite',
        }} />
      </div>

      {/* Stats grid — 4 cells, amber LED values */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 16,
      }}>
        {heroStats.map((stat, i) => (
          <div key={stat.label} style={{
            background: 'rgba(0,0,0,0.3)', border: `1px solid ${colors.divider}`,
            borderRadius: 6, padding: '14px 12px',
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(8px)',
            transition: `all 0.5s ${easing} ${i * 120}ms`,
          }}>
            <div style={{
              fontFamily: mono, fontSize: 10, color: colors.textDim,
              textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6,
            }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: mono, fontSize: 22, fontWeight: 700,
              color: colors.amber, textShadow: '0 0 8px #fbbf24',
              animation: 'led-flicker 4s ease infinite', lineHeight: 1.1,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontFamily: mono, fontSize: 10, color: colors.textMuted, marginTop: 4,
            }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Station Card ────────────────────────────────────────────── */
const Station = ({ stage, index, pos, compact }) => {
  const [ref, inView] = useInView({ threshold: 0.15 });
  const [hovered, setHovered] = useState(false);
  const svcColor = serviceColors[stage.service] || serviceColors.default;
  const isLeft = pos.x < 50;
  const flexDir = (!compact && !isLeft) ? 'row-reverse' : 'row';
  const textAlign = compact ? 'left' : (isLeft ? 'left' : 'right');
  const pillJustify = compact ? 'flex-start' : (isLeft ? 'flex-start' : 'flex-end');

  const stationDot = (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      background: '#fff', border: `3px solid ${svcColor}`,
      flexShrink: 0, zIndex: 3,
      boxShadow: hovered
        ? `0 0 14px ${svcColor}, 0 0 4px ${svcColor}`
        : '0 0 6px rgba(0,0,0,0.4)',
      animation: hovered ? 'station-pulse 1.5s ease infinite' : 'none',
      transition: 'box-shadow 0.3s ease',
    }} />
  );

  const titleRow = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      flexDirection: flexDir, marginBottom: 4,
    }}>
      <span style={{ fontSize: 20 }}>{stage.icon}</span>
      <span style={{
        fontSize: 16, fontWeight: 700, color: colors.text, letterSpacing: 0.3,
      }}>
        {stage.title}
      </span>
      {stage.badge && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
          background: `${svcColor}20`, color: svcColor, border: `1px solid ${svcColor}40`,
        }}>
          {stage.badge}
        </span>
      )}
      {stage.manual && (
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
          background: `${colors.amber}15`, color: colors.amber,
          border: `1px solid ${colors.amber}30`,
        }}>
          manual
        </span>
      )}
    </div>
  );

  const subtitle = (
    <div style={{
      fontSize: 12, color: colors.textMuted, lineHeight: 1.5, maxWidth: 340,
      marginLeft: (!compact && !isLeft) ? 'auto' : 0,
    }}>
      {stage.sub}
    </div>
  );

  const servicePills = (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8,
      justifyContent: pillJustify,
    }}>
      {stage.nodes.filter(n => n.type).map((n, ni) => (
        <Pill key={ni} color={serviceColors[n.type] || colors.textDim}>
          {n.title}
        </Pill>
      ))}
      {(stage.outputs || []).filter(o => o.type).map((o, oi) => (
        <Pill key={`o-${oi}`} color={serviceColors[o.type] || colors.textDim}>
          {o.label ? `${o.label} → ` : ''}{o.title}
        </Pill>
      ))}
    </div>
  );

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        top: pos.y - 12,
        left: compact ? '8%' : (isLeft ? '4%' : '36%'),
        width: compact ? '84%' : '60%',
        display: 'flex', alignItems: 'flex-start', gap: 14,
        flexDirection: flexDir,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: `all 0.7s ${easing} ${index * 100}ms`,
        cursor: 'default', zIndex: 2,
      }}
    >
      {stationDot}
      <div style={{ flex: 1, textAlign }}>
        {titleRow}
        {subtitle}
        {servicePills}
      </div>
    </div>
  );
};

/* ── Metro Lines (SVG layer) ─────────────────────────────────── */
const MetroLines = ({ positions, stages, svgW, svgH }) => {
  const [ref, inView] = useInView({ threshold: 0.05 });

  // Pre-compute all line segments
  const segments = [];
  for (let i = 0; i < positions.length - 1; i++) {
    const lineColor = serviceColors[stages[i].service] || serviceColors.default;
    const pathD = metroPath(positions[i], positions[i + 1], svgW);
    segments.push({ lineColor, pathD, i });
  }

  return (
    <svg
      ref={ref}
      width={svgW}
      height={svgH}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
    >
      <defs>
        {/* Glow filter for animated travel dots */}
        <filter id="metro-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Track lines with dash draw-in animation */}
      {segments.map(({ lineColor, pathD, i }) => (
        <path
          key={`line-${i}`}
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.7}
          style={{
            strokeDasharray: PATH_LEN_ESTIMATE,
            strokeDashoffset: inView ? 0 : PATH_LEN_ESTIMATE,
            transition: `stroke-dashoffset 1.2s ${easing} ${i * 250}ms`,
          }}
        />
      ))}

      {/* Animated travel dots with glow */}
      {segments.map(({ lineColor, pathD, i }) => (
        <circle
          key={`dot-${i}`}
          r={5}
          fill={lineColor}
          filter="url(#metro-glow)"
          style={{
            opacity: inView ? 1 : 0,
            transition: `opacity 0.5s ease ${i * 250 + 800}ms`,
          }}
        >
          <animateMotion
            dur={`${2 + i * 0.3}s`}
            repeatCount="indefinite"
            begin={`${i * 0.5}s`}
            path={pathD}
          />
        </circle>
      ))}
    </svg>
  );
};

/* ── Legend ───────────────────────────────────────────────────── */
const LEGEND_ITEMS = [
  { label: 'S3 Line', color: serviceColors.s3 },
  { label: 'EC2 Line', color: serviceColors.ec2 },
  { label: 'Lambda Line', color: serviceColors.lambda },
  { label: 'DynamoDB Line', color: serviceColors.db },
];

const Legend = () => {
  const [ref, inView] = useInView({ threshold: 0.3 });

  return (
    <div ref={ref} style={{
      display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center',
      padding: '20px 0', marginTop: 32,
      borderTop: `1px solid ${colors.divider}`,
      opacity: inView ? 1 : 0, transition: `opacity 0.6s ${easing}`,
    }}>
      {LEGEND_ITEMS.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 6, borderRadius: 3,
            background: item.color, boxShadow: `0 0 6px ${item.color}60`,
          }} />
          <span style={{
            fontSize: 11, color: colors.textMuted, fontFamily: mono, letterSpacing: 0.5,
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────────── */
function PipelineMetro() {
  const containerRef = useRef(null);
  const [compact, setCompact] = useState(false);
  const [containerW, setContainerW] = useState(900);

  // ResizeObserver — toggle compact mode below 640px
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setCompact(w < 640);
        setContainerW(w);
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const positions = stationPositions(pipelineStages, compact);
  const svgH = SVG_PAD_TOP + (pipelineStages.length - 1) * VERTICAL_SPACING + 80;
  const totalHeight = svgH + 40;

  return (
    <div style={{
      maxWidth: 900, margin: '0 auto', padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <MetroStyles />

      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{
          fontSize: 28, fontWeight: 800, color: colors.text,
          margin: 0, letterSpacing: -0.5,
        }}>
          <span style={{ color: colors.accent }}>Pipeline</span> Metro Map
        </h2>
        <p style={{
          fontSize: 14, color: colors.textMuted, marginTop: 8,
          maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Follow the line from raw upload to biomechanical analysis.
          Each station is a pipeline stage connected by service-colored routes.
        </p>
      </div>

      {/* Departure Board */}
      <DepartureBoard />

      {/* Metro map container */}
      <div
        ref={containerRef}
        style={{
          position: 'relative', width: '100%',
          height: totalHeight, marginBottom: 16,
        }}
      >
        {/* SVG lines layer behind stations */}
        <MetroLines
          positions={positions}
          stages={pipelineStages}
          svgW={containerW}
          svgH={svgH}
        />

        {/* Station cards */}
        {pipelineStages.map((stage, i) => (
          <Station
            key={stage.id}
            stage={stage}
            index={i}
            pos={positions[i]}
            compact={compact}
          />
        ))}
      </div>

      {/* Legend */}
      <Legend />
    </div>
  );
}

export default PipelineMetro;

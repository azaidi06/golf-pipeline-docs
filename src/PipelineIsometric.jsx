import React, { useState, useEffect, useRef } from 'react';
import { colors, serviceColors, pipelineStages, heroStats } from './pipelineData';
import useInView from './hooks/useInView';

const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* ── Keyframes (injected once) ───────────────────────────────── */
const IsoStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes iso-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    @keyframes iso-flow {
      0% { transform: translateY(-20px); opacity: 0; }
      15% { opacity: 1; }
      85% { opacity: 1; }
      100% { transform: translateY(var(--pipe-height, 60px)); opacity: 0; }
    }
    @keyframes iso-shimmer {
      0%, 100% { opacity: 1; filter: brightness(1); }
      50% { opacity: 0.85; filter: brightness(1.25); }
    }
  `}} />
);

/* ── Color helpers ───────────────────────────────────────────── */
const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
};

const adjustBrightness = (hex, factor) => {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v) => Math.min(255, Math.max(0, Math.round(v * factor)));
  return `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`;
};

/* ── Isometric Cube ──────────────────────────────────────────── */
const IsoCube = ({ color, size = 100, height = 80, icon, isGpu = false, hovered = false, inView = false }) => {
  const cubeHeight = isGpu ? height * 2 : height;
  const topColor = color;
  const rightColor = adjustBrightness(color, 0.8);
  const leftColor = adjustBrightness(color, 0.6);
  const w = size;
  const h = cubeHeight;

  return (
    <div style={{
      position: 'relative',
      width: `${w}px`,
      height: `${w * 0.6 + h}px`,
      transition: `transform 0.4s ${easing}, filter 0.4s ${easing}`,
      transform: hovered ? 'translateY(-12px)' : 'translateY(0)',
      filter: hovered ? `drop-shadow(0 20px 40px ${color}40)` : `drop-shadow(0 8px 20px ${color}15)`,
      animation: inView ? 'iso-float 4s ease-in-out infinite' : 'none',
      animationDelay: isGpu ? '0.5s' : '0s',
    }}>
      {/* Top face */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${w}px`,
        height: `${w}px`,
        transformOrigin: '0 0',
        transform: 'rotate(210deg) skew(-30deg) scaleY(0.864)',
        background: `linear-gradient(135deg, ${topColor}, ${adjustBrightness(color, 1.15)})`,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: hovered ? 'iso-shimmer 2s ease-in-out infinite' : 'none',
      }}>
        {/* Icon sits in a non-transformed child so it reads upright */}
      </div>

      {/* Icon overlay (positioned at top face center, un-transformed) */}
      <div style={{
        position: 'absolute',
        top: `${w * 0.08}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: isGpu ? '32px' : '26px',
        zIndex: 5,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
      }}>
        {icon}
      </div>

      {/* Left face */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: `${w / 2}px`,
        height: `${h}px`,
        transformOrigin: '0 100%',
        transform: 'skewY(30deg)',
        background: `linear-gradient(180deg, ${leftColor}, ${adjustBrightness(color, 0.45)})`,
        borderRadius: '0 0 0 4px',
      }} />

      {/* Right face */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: `${w / 2}px`,
        height: `${h}px`,
        transformOrigin: '100% 100%',
        transform: 'skewY(-30deg)',
        background: `linear-gradient(180deg, ${rightColor}, ${adjustBrightness(color, 0.55)})`,
        borderRadius: '0 0 4px 0',
      }} />

      {/* Badge for GPU */}
      {isGpu && (
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          color: colors.bg,
          background: color,
          padding: '2px 8px',
          borderRadius: '4px',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
          zIndex: 6,
        }}>
          g6.2xlarge
        </div>
      )}
    </div>
  );
};

/* ── Connecting Pipe with flowing dots ───────────────────────── */
const ConnectorPipe = ({ height = 60, color = colors.textDim, inView = false, dotCount = 3 }) => (
  <div style={{
    position: 'relative',
    width: '4px',
    height: `${height}px`,
    margin: '0 auto',
    background: `linear-gradient(180deg, ${color}60, ${color}30)`,
    borderRadius: '2px',
    overflow: 'visible',
    '--pipe-height': `${height}px`,
  }}>
    {/* Glow behind pipe */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: '-6px',
      width: '16px',
      height: '100%',
      background: `linear-gradient(180deg, ${color}15, transparent)`,
      borderRadius: '8px',
      pointerEvents: 'none',
    }} />

    {/* Flowing dots */}
    {Array.from({ length: dotCount }).map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        left: '-2px',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}80`,
        animation: inView ? `iso-flow 2s ease-in-out ${i * (2 / dotCount)}s infinite` : 'none',
        '--pipe-height': `${height}px`,
      }} />
    ))}
  </div>
);

/* ── Hero Stats Row ──────────────────────────────────────────── */
const HeroStatsRow = () => {
  const [ref, inView] = useInView({ threshold: 0.2 });

  return (
    <div ref={ref} style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      justifyContent: 'center',
      marginBottom: '48px',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.7s ${easing}, transform 0.7s ${easing}`,
    }}>
      {heroStats.map((stat, i) => (
        <div key={stat.label} style={{
          flex: '1 1 160px',
          maxWidth: '200px',
          background: `${stat.color}08`,
          border: `1px solid ${stat.color}20`,
          borderRadius: '12px',
          padding: '16px 20px',
          textAlign: 'center',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity 0.5s ${easing} ${i * 80}ms, transform 0.5s ${easing} ${i * 80}ms`,
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: colors.textDim,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '4px',
          }}>
            {stat.label}
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 700,
            color: stat.color,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.2,
          }}>
            {stat.value}
          </div>
          <div style={{
            fontSize: '10px',
            color: colors.textDim,
            marginTop: '4px',
          }}>
            {stat.sub}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Stage Row (alternating layout) ──────────────────────────── */
const StageRow = ({ stage, index }) => {
  const [ref, inView] = useInView({ threshold: 0.15 });
  const [hovered, setHovered] = useState(false);
  const svcColor = serviceColors[stage.service] || serviceColors.default;
  const isGpu = stage.id === 'gpu';
  const isEven = index % 2 === 0;

  const cubeSize = isGpu ? 120 : 100;
  const cubeHeight = isGpu ? 70 : 60;

  /* Text block */
  const textBlock = (
    <div style={{
      flex: 1,
      minWidth: '200px',
      padding: '12px 0',
    }}>
      {/* Service badge */}
      <div style={{
        display: 'inline-block',
        fontSize: '9px',
        fontWeight: 700,
        color: svcColor,
        background: `${svcColor}15`,
        padding: '3px 10px',
        borderRadius: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontFamily: "'JetBrains Mono', monospace",
        marginBottom: '10px',
      }}>
        {stage.service}
        {stage.badge ? ` / ${stage.badge}` : ''}
      </div>

      {/* Title */}
      <h3 style={{
        margin: '0 0 6px',
        fontSize: '20px',
        fontWeight: 700,
        color: colors.text,
      }}>
        {stage.title}
      </h3>

      {/* Subtitle */}
      <p style={{
        margin: 0,
        fontSize: '13px',
        color: colors.textMuted,
        lineHeight: 1.5,
      }}>
        {stage.sub}
      </p>

      {/* Manual trigger indicator */}
      {stage.manual && (
        <div style={{
          marginTop: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px',
          color: colors.textDim,
          background: `${colors.textDim}10`,
          padding: '4px 10px',
          borderRadius: '6px',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: colors.textDim,
          }} />
          On-demand trigger
        </div>
      )}

      {/* Outputs */}
      {stage.outputs && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          flexWrap: 'wrap',
        }}>
          {stage.outputs.map((out, i) => {
            const outColor = serviceColors[out.type] || colors.textDim;
            return (
              <div key={i} style={{
                background: `${outColor}08`,
                border: `1px solid ${outColor}18`,
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '10px',
              }}>
                <span style={{ color: outColor, fontWeight: 600 }}>{out.title}</span>
                {out.label && (
                  <span style={{
                    color: colors.textDim,
                    fontFamily: "'JetBrains Mono', monospace",
                    marginLeft: '6px',
                  }}>
                    {out.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* Cube block */
  const cubeBlock = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: `${cubeSize + 40}px`,
        cursor: 'default',
      }}
    >
      <IsoCube
        color={svcColor}
        size={cubeSize}
        height={cubeHeight}
        icon={stage.icon}
        isGpu={isGpu}
        hovered={hovered}
        inView={inView}
      />
    </div>
  );

  return (
    <div ref={ref} style={{
      display: 'flex',
      flexDirection: isEven ? 'row' : 'row-reverse',
      alignItems: 'center',
      gap: '32px',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.7s ${easing}, transform 0.7s ${easing}`,
      padding: '8px 0',
    }}>
      {cubeBlock}
      {textBlock}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────────── */
const PipelineIsometric = () => {
  const [headerRef, headerInView] = useInView({ threshold: 0.2 });

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0 24px',
      position: 'relative',
    }}>
      <IsoStyles />

      {/* Subtle dot-grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, ${colors.textDim}10 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 90% 60% at 50% 30%, black 10%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 60% at 50% 30%, black 10%, transparent 70%)',
      }} />

      {/* Header */}
      <div ref={headerRef} style={{
        textAlign: 'center',
        marginBottom: '36px',
        position: 'relative',
        opacity: headerInView ? 1 : 0,
        transform: headerInView ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.7s ${easing}`,
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          margin: '0 0 6px',
          background: `linear-gradient(135deg, ${colors.text}, ${colors.textMuted})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Pipeline Architecture
        </h1>
        <p style={{
          color: colors.textDim,
          fontSize: '13px',
          margin: 0,
        }}>
          Isometric view of the end-to-end processing flow
        </p>
      </div>

      {/* Hero Stats */}
      <HeroStatsRow />

      {/* Stages with connecting pipes */}
      <div style={{ position: 'relative' }}>
        {pipelineStages.map((stage, i) => {
          const svcColor = serviceColors[stage.service] || serviceColors.default;
          const isLast = i === pipelineStages.length - 1;
          const nextColor = !isLast
            ? serviceColors[pipelineStages[i + 1].service] || serviceColors.default
            : null;
          const pipeColor = nextColor
            ? svcColor
            : null;

          /* Determine pipe label between stages */
          const pipeLabels = [
            'S3 event',   // ingest -> gpu
            '.pkl trigger', // gpu -> detect
            '.json trigger', // detect -> hand
            'on-demand',     // hand -> analyze
          ];

          return (
            <React.Fragment key={stage.id}>
              <StageRow stage={stage} index={i} />

              {/* Connecting pipe (skip after last stage) */}
              {!isLast && (
                <PipeSection
                  color={pipeColor}
                  label={pipeLabels[i]}
                  isManual={pipelineStages[i + 1].manual}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/* ── Pipe Section between stages ─────────────────────────────── */
const PipeSection = ({ color, label, isManual = false }) => {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const pipeHeight = 56;

  return (
    <div ref={ref} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4px 0',
      opacity: inView ? 1 : 0,
      transition: `opacity 0.5s ${easing}`,
    }}>
      <ConnectorPipe
        height={pipeHeight}
        color={color}
        inView={inView && !isManual}
        dotCount={isManual ? 0 : 3}
      />

      {label && (
        <div style={{
          marginTop: '6px',
          fontSize: '9px',
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: `${color}aa`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          {isManual && (
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: colors.textDim,
              display: 'inline-block',
            }} />
          )}
          {label}
        </div>
      )}
    </div>
  );
};

export default PipelineIsometric;

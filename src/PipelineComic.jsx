import React, { useState, useEffect, useRef } from 'react';
import { colors, serviceColors, pipelineStages, heroStats } from './pipelineData';
import useInView from './hooks/useInView';

/* ── Keyframes (injected once via dangerouslySetInnerHTML) ── */
const ComicStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes comic-pop {
      0%   { transform: scale(0.8); opacity: 0; }
      70%  { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes comic-shake {
      0%   { transform: rotate(0deg); }
      25%  { transform: rotate(-2deg); }
      50%  { transform: rotate(2deg); }
      75%  { transform: rotate(-1deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes comic-burst {
      0%   { transform: scale(1) rotate(var(--burst-rot, -3deg)); }
      50%  { transform: scale(1.1) rotate(var(--burst-rot, -3deg)); }
      100% { transform: scale(1) rotate(var(--burst-rot, -3deg)); }
    }
  `}} />
);

/* ── Constants ─────────────────────────────────────────────── */
const panelRotations = [
  'rotate(-0.5deg)', 'rotate(0.3deg)', 'rotate(-0.2deg)', 'rotate(0.4deg)',
  'rotate(-0.3deg)', 'rotate(0.5deg)', 'rotate(-0.4deg)', 'rotate(0.2deg)',
];

const actionWords = [
  { text: 'UPLOAD!',  color: colors.green,  rotation: 'rotate(-3deg)' },
  { text: 'CRUNCH!',  color: colors.purple, rotation: 'rotate(4deg)' },
  { text: 'DETECT!',  color: colors.amber,  rotation: 'rotate(-2deg)' },
  { text: 'SCORE!',   color: colors.rose,   rotation: 'rotate(5deg)' },
  { text: 'ANALYZE!', color: colors.accent,  rotation: 'rotate(-4deg)' },
];

const popEasing = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';

/* ── Shared style builders ─────────────────────────────────── */
const burstTextStyle = (c, size = 28) => ({
  fontSize: size,
  fontWeight: 900,
  fontFamily: "'Impact', 'Arial Black', sans-serif",
  color: c,
  letterSpacing: '0.08em',
  userSelect: 'none',
  textShadow: `2px 2px 0 ${colors.bg}, -1px -1px 0 ${colors.bg}`,
});

const burstPillStyle = (w, inView, pad = '6px 28px') => ({
  '--burst-rot': w.rotation,
  display: 'inline-block',
  background: `${w.color}22`,
  border: `3px solid ${w.color}66`,
  borderRadius: 12,
  padding: pad,
  transform: w.rotation,
  animation: inView ? 'comic-burst 2s ease-in-out infinite' : 'none',
});

/* ── Speech Bubble ─────────────────────────────────────────── */
const SpeechBubble = ({ title, service, isCompact }) => {
  const [hovered, setHovered] = useState(false);
  const svcColor = serviceColors[service] || serviceColors.default;
  const svcLabel = service ? service.toUpperCase() : '';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}
    >
      {/* Bubble body */}
      <div style={{
        background: 'rgba(226, 232, 240, 0.95)',
        borderRadius: 16,
        padding: isCompact ? '8px 12px' : '10px 16px',
        border: `2px solid ${colors.text}`,
        boxShadow: `2px 2px 0 ${colors.cardBorder}`,
        color: colors.bg,
        fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif",
        transition: 'transform 0.3s ease',
        transform: hovered ? 'rotate(-1deg)' : 'rotate(0deg)',
        animation: hovered ? 'comic-shake 0.4s ease' : 'none',
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: isCompact ? 13 : 15,
          lineHeight: 1.3,
          marginBottom: svcLabel ? 4 : 0,
        }}>
          {title}
        </div>
        {svcLabel && (
          <span style={{
            display: 'inline-block',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 6,
            background: `${svcColor}22`,
            color: svcColor,
            border: `1px solid ${svcColor}44`,
            letterSpacing: '0.05em',
          }}>
            {svcLabel}
          </span>
        )}
      </div>
      {/* Tail: rotated square positioned beneath the bubble */}
      <div style={{
        position: 'absolute',
        bottom: -6,
        left: 20,
        width: 12,
        height: 12,
        background: 'rgba(226, 232, 240, 0.95)',
        border: `2px solid ${colors.text}`,
        borderTop: 'none',
        borderRight: 'none',
        transform: 'rotate(-45deg)',
        boxShadow: `-1px 1px 0 ${colors.cardBorder}`,
      }} />
    </div>
  );
};

/* ── Caption Box ───────────────────────────────────────────── */
const CaptionBox = ({ text, isCompact }) => (
  <div style={{
    background: 'rgba(251, 191, 36, 0.15)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: 4,
    padding: isCompact ? '4px 8px' : '5px 10px',
    fontSize: isCompact ? 10 : 11,
    fontStyle: 'italic',
    color: colors.amber,
    lineHeight: 1.4,
    fontFamily: "'Georgia', serif",
    maxWidth: '90%',
  }}>
    {text}
  </div>
);

/* ── Action Word Burst (spans full grid width) ─────────────── */
const ActionWordBurst = ({ word, index, inView }) => (
  <div style={{
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 0',
    opacity: inView ? 1 : 0,
    transform: inView ? 'scale(1)' : 'scale(0.5)',
    transition: `all 0.5s ${popEasing} ${index * 0.1}s`,
  }}>
    <div style={burstPillStyle(word, inView)}>
      <span style={burstTextStyle(word.color)}>{word.text}</span>
    </div>
  </div>
);

/* ── Inline Burst (sits in one grid cell alongside a panel) ── */
const InlineBurst = ({ word, inView, delay = 0 }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: inView ? 1 : 0,
    transform: inView ? 'scale(1)' : 'scale(0.5)',
    transition: `all 0.5s ${popEasing} ${delay}s`,
  }}>
    <div style={burstPillStyle(word, inView, '6px 24px')}>
      <span style={burstTextStyle(word.color, 24)}>{word.text}</span>
    </div>
  </div>
);

/* ── Halftone Overlay ──────────────────────────────────────── */
const HalftoneOverlay = ({ color }) => (
  <div style={{
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    borderRadius: 6,
    backgroundImage: `radial-gradient(circle, ${color}22 1px, transparent 1px)`,
    backgroundSize: '8px 8px',
    opacity: 0.6,
  }} />
);

/* ── Narrative Connector ("Meanwhile...", "And then...") ───── */
const NarrativeBox = ({ text, color, inView }) => (
  <div style={{
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'center',
    padding: '2px 0',
    opacity: inView ? 1 : 0,
    transition: `opacity 0.5s ${popEasing} 0.15s`,
  }}>
    <div style={{
      background: 'rgba(251, 191, 36, 0.12)',
      border: `1px solid rgba(251, 191, 36, 0.25)`,
      borderRadius: 4,
      padding: '3px 16px',
      fontSize: 11,
      fontStyle: 'italic',
      color: colors.amber,
      fontFamily: "'Georgia', serif",
    }}>
      {text}
    </div>
  </div>
);

/* ── Stage Panel ───────────────────────────────────────────── */
const StagePanel = ({ stage, index, inView, isCompact, spanFull }) => {
  const rot = isCompact ? 'rotate(0deg)' : panelRotations[index % panelRotations.length];
  const showHalftone = index % 2 === 0;

  return (
    <div style={{
      gridColumn: spanFull ? '1 / -1' : undefined,
      position: 'relative',
      background: colors.card,
      border: `3px solid ${colors.text}`,
      borderRadius: 6,
      padding: isCompact ? 14 : 20,
      boxShadow: `4px 4px 0 ${colors.cardBorder}`,
      transform: inView ? rot : `${rot} scale(0.8)`,
      opacity: inView ? 1 : 0,
      transition: `all 0.5s ${popEasing} ${index * 0.1}s`,
      overflow: 'hidden',
      minHeight: isCompact ? 160 : 200,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {showHalftone && <HalftoneOverlay color={stage.color} />}

      {/* Caption box at top-left */}
      <CaptionBox text={stage.sub} isCompact={isCompact} />

      {/* Emoji character in corner */}
      <div style={{
        position: 'absolute',
        top: isCompact ? 8 : 12,
        right: isCompact ? 8 : 14,
        fontSize: isCompact ? 36 : 48,
        lineHeight: 1,
        opacity: 0.9,
        filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.3))',
        zIndex: 1,
      }}>
        {stage.icon}
      </div>

      {/* Speech bubble with title and service badge */}
      <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
        <SpeechBubble title={stage.title} service={stage.service} isCompact={isCompact} />
      </div>

      {/* Instance badge (e.g. g6.2xlarge) */}
      {stage.badge && (
        <div style={{
          position: 'absolute',
          bottom: isCompact ? 10 : 14,
          right: isCompact ? 10 : 14,
          fontSize: 9,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          padding: '2px 8px',
          borderRadius: 4,
          background: `${stage.color}22`,
          color: stage.color,
          border: `1px solid ${stage.color}44`,
          letterSpacing: '0.05em',
          zIndex: 1,
        }}>
          {stage.badge}
        </div>
      )}

      {/* On-demand indicator */}
      {stage.manual && (
        <div style={{
          position: 'absolute',
          bottom: isCompact ? 10 : 14,
          right: isCompact ? 10 : 14,
          fontSize: 9,
          fontWeight: 600,
          color: colors.textDim,
          fontStyle: 'italic',
          zIndex: 1,
        }}>
          on-demand
        </div>
      )}
    </div>
  );
};

/* ── Hero Stats Strip (comic title card) ───────────────────── */
const HeroStrip = ({ inView, isCompact }) => (
  <div style={{
    gridColumn: '1 / -1',
    position: 'relative',
    background: colors.card,
    border: `4px solid ${colors.text}`,
    borderRadius: 8,
    padding: isCompact ? '16px 12px' : '24px 28px',
    boxShadow: `5px 5px 0 ${colors.cardBorder}`,
    transform: inView ? 'rotate(-0.3deg)' : 'rotate(-0.3deg) scale(0.8)',
    opacity: inView ? 1 : 0,
    transition: `all 0.6s ${popEasing}`,
    overflow: 'hidden',
  }}>
    <HalftoneOverlay color={colors.accent} />

    {/* Big comic title */}
    <div style={{
      textAlign: 'center',
      marginBottom: isCompact ? 12 : 18,
      position: 'relative',
      zIndex: 1,
    }}>
      <h2 style={{
        fontSize: isCompact ? 28 : 40,
        fontWeight: 900,
        fontFamily: "'Impact', 'Arial Black', sans-serif",
        color: colors.text,
        letterSpacing: '0.06em',
        textShadow: `3px 3px 0 ${colors.accent}44, -1px -1px 0 ${colors.bg}`,
        margin: 0,
        lineHeight: 1.1,
        textTransform: 'uppercase',
      }}>
        Golf Pipeline
      </h2>
      <div style={{
        fontSize: isCompact ? 11 : 13,
        color: colors.textMuted,
        fontStyle: 'italic',
        fontFamily: "'Georgia', serif",
        marginTop: 4,
      }}>
        A comic-book guide to video processing
      </div>
    </div>

    {/* Stats row */}
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: isCompact ? 12 : 24,
      flexWrap: 'wrap',
      position: 'relative',
      zIndex: 1,
    }}>
      {heroStats.map((s) => (
        <div key={s.label} style={{
          textAlign: 'center',
          minWidth: isCompact ? 70 : 100,
          padding: isCompact ? '6px 8px' : '8px 12px',
          background: `${s.color}11`,
          borderRadius: 8,
          border: `2px solid ${s.color}33`,
        }}>
          <div style={{
            fontSize: isCompact ? 20 : 28,
            fontWeight: 900,
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            color: s.color,
            lineHeight: 1.1,
          }}>
            {s.value}
          </div>
          <div style={{
            fontSize: isCompact ? 10 : 11,
            fontWeight: 700,
            color: colors.text,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginTop: 2,
          }}>
            {s.label}
          </div>
          <div style={{
            fontSize: isCompact ? 8 : 9,
            color: colors.textDim,
            marginTop: 1,
          }}>
            {s.sub}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ── GPU Panel (full-width, special layout) ────────────────── */
const GpuPanel = ({ stage, inView, isCompact }) => {
  const rot = isCompact ? 'rotate(0deg)' : 'rotate(0.3deg)';

  return (
    <div style={{
      gridColumn: '1 / -1',
      position: 'relative',
      background: colors.card,
      border: `4px solid ${colors.text}`,
      borderRadius: 6,
      padding: isCompact ? 16 : 24,
      boxShadow: `4px 4px 0 ${colors.cardBorder}`,
      transform: inView ? rot : `${rot} scale(0.8)`,
      opacity: inView ? 1 : 0,
      transition: `all 0.5s ${popEasing} 0.1s`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: isCompact ? 'column' : 'row',
      gap: isCompact ? 12 : 24,
      alignItems: 'flex-start',
    }}>
      <HalftoneOverlay color={stage.color} />

      {/* Left: emoji character + caption */}
      <div style={{
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          fontSize: isCompact ? 48 : 64,
          lineHeight: 1,
          filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.3))',
        }}>
          {stage.icon}
        </div>
        <CaptionBox text={stage.sub} isCompact={isCompact} />
      </div>

      {/* Right: speech bubble + processing step details */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        zIndex: 1,
      }}>
        <SpeechBubble title={stage.title} service={stage.service} isCompact={isCompact} />

        {/* Transcode + label step cards */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          {(stage.nodes?.[0]?.steps || []).map((step, i) => (
            <div key={i} style={{
              flex: '1 1 200px',
              background: `${stage.color}11`,
              border: `1px solid ${stage.color}33`,
              borderRadius: 6,
              padding: isCompact ? '6px 8px' : '8px 12px',
            }}>
              <div style={{
                fontSize: isCompact ? 10 : 11,
                fontWeight: 700,
                color: stage.color,
                marginBottom: 2,
              }}>
                {step.label}
              </div>
              <div style={{
                fontSize: isCompact ? 9 : 10,
                color: colors.textMuted,
                lineHeight: 1.4,
              }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Instance type badge */}
        {stage.badge && (
          <span style={{
            alignSelf: 'flex-end',
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            padding: '2px 10px',
            borderRadius: 4,
            background: `${stage.color}22`,
            color: stage.color,
            border: `1px solid ${stage.color}44`,
          }}>
            {stage.badge}
          </span>
        )}
      </div>
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────── */
function PipelineComic() {
  const containerRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);
  const [heroRef, heroInView] = useInView({ threshold: 0.15 });
  const [gridRef, gridInView] = useInView({ threshold: 0.05 });

  /* Responsive: collapse to single column below 640px */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setIsCompact(entry.contentRect.width < 640);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [ingest, gpu, detect, hand, analyze] = pipelineStages;
  const cols = isCompact ? '1fr' : 'repeat(2, 1fr)';

  return (
    <section ref={containerRef} style={{
      width: '100%',
      maxWidth: 960,
      margin: '0 auto',
      padding: '32px 16px',
    }}>
      <ComicStyles />

      {/* Hero title card */}
      <div ref={heroRef} style={{ display: 'grid', gridTemplateColumns: cols, gap: 16 }}>
        <HeroStrip inView={heroInView} isCompact={isCompact} />
      </div>

      {/* Main comic grid */}
      <div ref={gridRef} style={{
        display: 'grid',
        gridTemplateColumns: cols,
        gap: 16,
        marginTop: 16,
      }}>
        {/* Row 1: UPLOAD! action word */}
        <ActionWordBurst word={actionWords[0]} index={0} inView={gridInView} />

        {/* Row 2: Ingest panel + CRUNCH! burst side-by-side */}
        <StagePanel stage={ingest} index={0} inView={gridInView} isCompact={isCompact} />
        <InlineBurst word={actionWords[1]} inView={gridInView} delay={0.1} />

        {/* Narrative connector */}
        <NarrativeBox text="Meanwhile, on the GPU..." color={colors.purple} inView={gridInView} />

        {/* Row 3: GPU Processing panel (full width) */}
        <GpuPanel stage={gpu} inView={gridInView} isCompact={isCompact} />

        {/* Row 4: DETECT! action word */}
        <ActionWordBurst word={actionWords[2]} index={2} inView={gridInView} />

        {/* Row 5: Detection panel + SCORE! burst side-by-side */}
        <StagePanel stage={detect} index={2} inView={gridInView} isCompact={isCompact} />
        <InlineBurst word={actionWords[3]} inView={gridInView} delay={0.3} />

        {/* Narrative connector */}
        <NarrativeBox text="And then..." color={colors.amber} inView={gridInView} />

        {/* Row 6: Hand & Score Finder (full width) */}
        <StagePanel stage={hand} index={3} inView={gridInView} isCompact={isCompact} spanFull />

        {/* Row 7: ANALYZE! action word */}
        <ActionWordBurst word={actionWords[4]} index={4} inView={gridInView} />

        {/* Row 8: Analysis panel (full width) */}
        <StagePanel stage={analyze} index={4} inView={gridInView} isCompact={isCompact} spanFull />
      </div>
    </section>
  );
}

export default PipelineComic;

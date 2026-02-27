import React, { useState, useEffect, useRef } from 'react';
import { colors, serviceColors, pipelineStages, heroStats } from './pipelineData';
import useInView from './hooks/useInView';

/* ── Keyframes (injected once) ─────────────────────────────── */
const TerminalKeyframes = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes cursor-blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    @keyframes scanline-drift {
      0% { background-position: 0 0; }
      100% { background-position: 0 4px; }
    }
    @keyframes progress-fill {
      0% { width: 0%; }
      100% { width: 100%; }
    }
  `}} />
);

/* ── Constants ─────────────────────────────────────────────── */
const TERM_BG = '#0d1117';
const TERM_FG = '#86efac';
const CMD_GREEN = '#4ade80';
const PROMPT_COLOR = '#6ee7b7';
const MUTED = '#4b5563';
const CHAR_INTERVAL = 28;
const CURSOR_CHAR = '\u258C'; // ▌
const MONO = "'JetBrains Mono', monospace";

/* ── Service badge color mapping ───────────────────────────── */
const badgeColor = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes('s3')) return serviceColors.s3;
  if (t.includes('sqs')) return serviceColors.sqs;
  if (t.includes('ec2')) return serviceColors.ec2;
  if (t.includes('lambda')) return serviceColors.lambda;
  if (t.includes('dynamo') || t.includes('db')) return serviceColors.db;
  if (t.includes('push')) return colors.rose;
  return serviceColors.default;
};

/* ── TypedText ─────────────────────────────────────────────── */
const TypedText = ({ text, active, delay = 0, onDone, style }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    setShowCursor(true);

    timeoutRef.current = setTimeout(() => {
      let idx = 0;
      intervalRef.current = setInterval(() => {
        idx += 1;
        setDisplayed(text.slice(0, idx));
        if (idx >= text.length) {
          clearInterval(intervalRef.current);
          setDone(true);
          if (onDone) onDone();
          // Keep cursor blinking for a moment, then hide
          setTimeout(() => setShowCursor(false), 1200);
        }
      }, CHAR_INTERVAL);
    }, delay);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [active, text, delay]);

  return (
    <span style={{ ...style }}>
      {displayed}
      {showCursor && (
        <span style={{
          animation: done ? 'cursor-blink 1s step-end infinite' : 'none',
          color: CMD_GREEN,
        }}>{CURSOR_CHAR}</span>
      )}
    </span>
  );
};

/* ── ASCII Progress Bar ────────────────────────────────────── */
const AsciiProgressBar = ({ active, label = '57.5 fps', duration = 2800, width = 24 }) => {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const elapsed = now - start;
      const pct = Math.min(elapsed / duration, 1);
      setFill(Math.round(pct * width));
      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration, width]);

  const filled = '\u2588'.repeat(fill);       // ████
  const empty = '\u2591'.repeat(width - fill); // ░░░░
  const pct = Math.round((fill / width) * 100);

  return (
    <span style={{ color: colors.purple }}>
      [{filled}<span style={{ color: MUTED }}>{empty}</span>] {pct}%{' '}
      <span style={{ color: colors.green }}>{fill === width ? label : ''}</span>
    </span>
  );
};

/* ── Build terminal content from pipelineStages ────────────── */
const buildStageOutput = (stage) => {
  const lines = [];
  const svc = stage.service.toUpperCase();

  // Header info line
  lines.push({ text: `[INFO] Stage: ${stage.title}`, color: TERM_FG });
  lines.push({ text: `[INFO] ${stage.sub}`, color: MUTED });

  // Nodes
  stage.nodes.forEach((node) => {
    if (node.arrow) {
      lines.push({ text: `  --> ${node.label}`, color: node.color || MUTED, tag: 'EVENT' });
    } else {
      lines.push({ text: `[${svc}]  ${node.title}`, color: TERM_FG, tag: svc });
      if (node.subtitle) {
        lines.push({ text: `       ${node.subtitle}`, color: MUTED });
      }
      if (node.details) {
        node.details.split('\n').forEach((d) => {
          lines.push({ text: `       ${d}`, color: MUTED });
        });
      }
      if (node.steps) {
        node.steps.forEach((step) => {
          lines.push({ text: `  [STEP] ${step.label}`, color: colors.purple });
          lines.push({ text: `         ${step.desc}`, color: MUTED });
        });
      }
      if (node.outputs) {
        node.outputs.forEach((o) => {
          lines.push({ text: `    -> ${o.key}: ${o.desc}`, color: TERM_FG, tag: o.key.replace('/', '') });
        });
      }
    }
  });

  // Outputs
  if (stage.outputs) {
    stage.outputs.forEach((out) => {
      const outTag = out.type.toUpperCase();
      lines.push({
        text: `[OUT]  ${out.title}${out.subtitle ? ' (' + out.subtitle + ')' : ''}${out.label ? ' ' + out.label : ''}`,
        color: TERM_FG,
        tag: outTag,
      });
    });
  }

  lines.push({ text: `[OK]   Stage "${stage.id}" complete.`, color: CMD_GREEN });
  return lines;
};

/* ── Hero Stats ASCII Table ────────────────────────────────── */
const buildHeroTable = () => {
  // Column widths
  const cols = heroStats.map((s) => Math.max(s.label.length, s.value.length, s.sub.length) + 2);

  const hBar = (left, mid, right, fill = '\u2500') =>
    left + cols.map((w) => fill.repeat(w)).join(mid) + right;

  const row = (getter) =>
    '\u2502' + cols.map((w, i) => {
      const val = getter(heroStats[i]);
      const pad = w - val.length;
      const lp = Math.floor(pad / 2);
      const rp = pad - lp;
      return ' '.repeat(lp) + val + ' '.repeat(rp);
    }).join('\u2502') + '\u2502';

  return [
    hBar('\u250C', '\u252C', '\u2510'),
    row((s) => s.label),
    hBar('\u251C', '\u253C', '\u2524'),
    row((s) => s.value),
    hBar('\u251C', '\u253C', '\u2524'),
    row((s) => s.sub),
    hBar('\u2514', '\u2534', '\u2518'),
  ].join('\n');
};

/* ── Colored output line with optional service tag ─────────── */
const OutputLine = ({ text, color, tag, preformatted }) => {
  const tagColor = tag ? badgeColor(tag) : null;

  // Preformatted blocks (like the hero ASCII table) need whitespace preserved
  if (preformatted || text.includes('\n')) {
    return (
      <pre style={{
        margin: 0,
        fontFamily: MONO,
        fontSize: 'inherit',
        color: color || TERM_FG,
        lineHeight: 1.6,
        whiteSpace: 'pre',
      }}>{text}</pre>
    );
  }

  // Colorize bracketed prefixes like [INFO], [OK], [S3], etc.
  const match = text.match(/^(\[[\w]+\])(.*)/);
  if (match) {
    const prefix = match[1];
    const rest = match[2];
    const prefixColor = prefix === '[OK]' ? CMD_GREEN
      : prefix === '[INFO]' ? colors.accent
      : prefix === '[OUT]' ? colors.amber
      : prefix === '[STEP]' ? colors.purple
      : tagColor || MUTED;

    return (
      <div style={{ lineHeight: 1.6 }}>
        <span style={{ color: prefixColor, fontWeight: 600 }}>{prefix}</span>
        <span style={{ color: color || TERM_FG }}>{rest}</span>
      </div>
    );
  }

  return (
    <div style={{ color: color || TERM_FG, lineHeight: 1.6 }}>{text}</div>
  );
};

/* ── Command Block ─────────────────────────────────────────── */
const CommandBlock = ({ command, outputLines, showProgress, stageIndex }) => {
  const [ref, inView] = useInView({ threshold: 0.2 });
  const [typed, setTyped] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    if (typed) {
      const t = setTimeout(() => setShowOutput(true), 200);
      return () => clearTimeout(t);
    }
  }, [typed]);

  return (
    <div ref={ref} style={{ marginBottom: '20px' }}>
      {/* Prompt + command */}
      <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1.6 }}>
        <span style={{ color: PROMPT_COLOR, fontWeight: 700, marginRight: '8px', userSelect: 'none' }}>$</span>
        <TypedText
          text={command}
          active={inView}
          onDone={() => setTyped(true)}
          style={{ color: CMD_GREEN, fontWeight: 500 }}
        />
      </div>

      {/* Output lines */}
      {showOutput && (
        <div style={{
          paddingLeft: '18px',
          marginTop: '4px',
          opacity: showOutput ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}>
          {outputLines.map((line, i) => (
            <OutputLine key={i} text={line.text} color={line.color} tag={line.tag} preformatted={line.preformatted} />
          ))}
          {showProgress && (
            <div style={{ lineHeight: 1.6, marginTop: '2px' }}>
              <span style={{ color: MUTED }}>[GPU]  </span>
              <AsciiProgressBar active={showOutput} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────── */
const PipelineTerminal = () => {
  const [ref, inView] = useInView({ threshold: 0.05 });
  const heroTable = buildHeroTable();

  const stageBlocks = pipelineStages.map((stage, i) => ({
    command: `pipeline run --stage ${stage.id}`,
    outputLines: buildStageOutput(stage),
    showProgress: stage.id === 'gpu',
    stageIndex: i,
  }));

  return (
    <div ref={ref} style={{
      maxWidth: '820px',
      margin: '0 auto',
      position: 'relative',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <TerminalKeyframes />

      {/* Terminal window */}
      <div style={{
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px ${colors.cardBorder}`,
      }}>

        {/* Title bar — macOS chrome */}
        <div style={{
          background: '#1c2333',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.cardBorder}`,
          userSelect: 'none',
        }}>
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
          </div>
          {/* Title */}
          <div style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '12px',
            fontFamily: MONO,
            color: colors.textDim,
            letterSpacing: '0.02em',
          }}>
            golf-pipeline -- bash
          </div>
          {/* Spacer to balance traffic lights */}
          <div style={{ width: '60px' }} />
        </div>

        {/* Terminal body */}
        <div style={{
          background: TERM_BG,
          padding: '24px 28px 28px',
          fontFamily: MONO,
          fontSize: '12.5px',
          position: 'relative',
          minHeight: '400px',
          overflowX: 'auto',
        }}>
          {/* Scanline overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.03) 2px,
              rgba(255,255,255,0.03) 4px
            )`,
            backgroundSize: '100% 4px',
            animation: 'scanline-drift 8s linear infinite',
            zIndex: 2,
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Welcome banner */}
            <div style={{ color: MUTED, marginBottom: '4px', lineHeight: 1.6 }}>
              # golf-pipeline v2.0 -- video processing for swing analysis
            </div>
            <div style={{ color: MUTED, marginBottom: '16px', lineHeight: 1.6 }}>
              # ingest -> transcode -> pose estimation -> swing detection -> analyze
            </div>

            {/* Hero stats command */}
            <CommandBlock
              command="pipeline stats --overview"
              outputLines={[
                { text: '[INFO] Pipeline statistics:', color: TERM_FG },
                { text: heroTable, color: colors.accent, preformatted: true },
              ]}
              showProgress={false}
              stageIndex={-1}
            />

            {/* Separator */}
            <div style={{
              borderBottom: `1px dashed ${MUTED}40`,
              margin: '12px 0 20px',
            }} />

            {/* Stage blocks */}
            {stageBlocks.map((block, i) => (
              <CommandBlock
                key={pipelineStages[i].id}
                command={block.command}
                outputLines={block.outputLines}
                showProgress={block.showProgress}
                stageIndex={block.stageIndex}
              />
            ))}

            {/* Final prompt */}
            <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1.6, marginTop: '8px' }}>
              <span style={{ color: PROMPT_COLOR, fontWeight: 700, marginRight: '8px', userSelect: 'none' }}>$</span>
              <span style={{
                color: CMD_GREEN,
                animation: 'cursor-blink 1s step-end infinite',
              }}>{CURSOR_CHAR}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineTerminal;

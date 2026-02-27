import React, { useState, lazy, Suspense } from 'react';
import { colors } from './pipelineData';

const PipelineClassic = lazy(() => import('./PipelineClassic'));
const PipelineBento = lazy(() => import('./PipelineBento'));
const PipelineScroll = lazy(() => import('./PipelineScroll'));
const PipelineCombined = lazy(() => import('./PipelineCombined'));

const VARIANTS = [
  { id: 'classic', label: 'Classic', component: PipelineClassic },
  { id: 'bento', label: 'Bento', component: PipelineBento },
  { id: 'scroll', label: 'Scroll', component: PipelineScroll },
  { id: 'combined', label: 'Combined', component: PipelineCombined },
];

const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';

const PipelineCore = () => {
  const [active, setActive] = useState('classic');
  const ActiveComponent = VARIANTS.find(v => v.id === active).component;

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif",
      color: colors.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* ── Sticky pill selector ── */}
      <div style={{
        position: 'sticky',
        top: '56px',
        zIndex: 40,
        background: `linear-gradient(to bottom, ${colors.bg} 60%, transparent)`,
        padding: '16px 24px 24px',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          gap: '4px',
          background: `${colors.card}ee`,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '14px',
          padding: '4px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          {VARIANTS.map(v => {
            const isActive = active === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setActive(v.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: "'DM Sans', -apple-system, sans-serif",
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  background: isActive
                    ? `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`
                    : 'transparent',
                  color: isActive ? colors.accent : colors.textDim,
                  boxShadow: isActive ? `0 0 12px ${colors.accent}15` : 'none',
                  transition: `all 0.25s ${easing}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active variant ── */}
      <div style={{ padding: '0 24px 40px' }}>
        <Suspense fallback={
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '60vh', color: colors.textDim, fontSize: '14px',
          }}>
            Loading...
          </div>
        }>
          <ActiveComponent />
        </Suspense>
      </div>
    </div>
  );
};

export default PipelineCore;

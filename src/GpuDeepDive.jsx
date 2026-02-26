import React, { useState } from 'react';
import GpuTricks from './GpuTricks';
import GpuUtilRoadmap from './GpuUtilRoadmap';

const colors = {
  bg: '#0a0f1a',
  card: '#111827',
  cardBorder: '#1e293b',
  accent: '#60a5fa',
  green: '#34d399',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
};

const sections = [
  { id: 'journey', label: 'GPU Optimization', sub: '18 min \u2192 6 min', component: GpuTricks },
  { id: 'next', label: "What's Next", sub: '6 min → 4 min', component: GpuUtilRoadmap },
];

export default function GpuDeepDive() {
  const [active, setActive] = useState('journey');
  const ActiveComponent = sections.find(s => s.id === active).component;

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      {/* Sub-navigation bar */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '28px 16px 0',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0px',
        }}>
          {sections.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => setActive(s.id)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: active === s.id ? `1px solid ${active === 'journey' ? colors.accent : colors.green}40` : `1px solid ${colors.cardBorder}`,
                  background: active === s.id
                    ? `${active === 'journey' ? colors.accent : colors.green}10`
                    : colors.card,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  outline: 'none',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: "'DM Sans', -apple-system, sans-serif",
                  color: active === s.id
                    ? (s.id === 'journey' ? colors.accent : colors.green)
                    : colors.textDim,
                  letterSpacing: '-0.01em',
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: active === s.id ? colors.textMuted : colors.textDim,
                  marginTop: '2px',
                  opacity: 0.8,
                }}>
                  {s.sub}
                </div>
              </button>
              {i < sections.length - 1 && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                  <path d="M9 6l6 6-6 6" stroke={colors.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Active section */}
      <ActiveComponent />
    </div>
  );
}

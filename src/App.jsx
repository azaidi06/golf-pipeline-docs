import React, { useState } from 'react';
import PipelineCore from './PipelineCore';
import PipelineCosts from './PipelineCosts';
import GpuDeepDive from './GpuDeepDive';

const colors = {
  bg: '#0a0f1a',
  card: '#111827',
  cardBorder: '#1e293b',
  accent: '#22d3ee',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
};

const TABS = [
  { id: 'core', label: 'Architecture', component: PipelineCore },
  { id: 'costs', label: 'Costs', component: PipelineCosts },
  { id: 'gpu', label: 'GPU Deep Dive', component: GpuDeepDive },
];

export default function App() {
  const [active, setActive] = useState('core');
  const ActiveComponent = TABS.find((t) => t.id === active).component;

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <nav style={{
        background: colors.card,
        borderBottom: `1px solid ${colors.cardBorder}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          height: '56px',
          gap: '24px',
        }}>
          <span style={{
            fontFamily: "'DM Sans', -apple-system, sans-serif",
            fontWeight: 700,
            fontSize: '18px',
            color: colors.text,
            letterSpacing: '-0.01em',
          }}>
            Golf Pipeline
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: "'DM Sans', -apple-system, sans-serif",
                  border: active === tab.id ? `1px solid ${colors.accent}40` : '1px solid transparent',
                  background: active === tab.id ? `${colors.accent}15` : 'transparent',
                  color: active === tab.id ? colors.accent : colors.textDim,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <ActiveComponent />
    </div>
  );
}

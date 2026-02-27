import React, { lazy, Suspense } from 'react';
import { colors } from './pipelineData';

const PipelineCombined = lazy(() => import('./PipelineCombined'));

const PipelineCore = () => (
  <div style={{
    minHeight: '100vh',
    background: colors.bg,
    fontFamily: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif",
    color: colors.text,
  }}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <div style={{ padding: '16px 24px 40px' }}>
      <Suspense fallback={
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          minHeight: '60vh', color: colors.textDim, fontSize: '14px',
        }}>
          Loading...
        </div>
      }>
        <PipelineCombined />
      </Suspense>
    </div>
  </div>
);

export default PipelineCore;

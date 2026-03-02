import { useState, useEffect } from 'react';

const colors = {
  bg: '#0a0f1a',
  card: '#111827',
  cardBorder: '#1e293b',
  accent: '#22d3ee',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  green: '#4ade80',
  red: '#f87171',
  yellow: '#fbbf24',
};

const DEFAULT_URL = 'http://localhost:5555';

function StatusDot({ status }) {
  const col = { idle: colors.textDim, checking: colors.yellow, ok: colors.green, err: colors.red }[status];
  const label = { idle: 'not connected', checking: 'connecting…', ok: 'connected', err: 'unreachable' }[status];
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: col }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0,
        boxShadow: status === 'ok' ? `0 0 6px ${col}` : 'none',
        animation: status === 'checking' ? 'pulse 1s infinite' : 'none',
      }} />
      {label}
    </span>
  );
}

export default function SwingReview() {
  const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const [serverUrl, setServerUrl] = useState(DEFAULT_URL);
  const [inputVal,  setInputVal]  = useState(DEFAULT_URL);
  const [status,    setStatus]    = useState('idle');   // idle | checking | ok | err
  const [showFrame, setShowFrame] = useState(false);

  // Auto-attempt on localhost
  useEffect(() => {
    if (isLocal) tryConnect(DEFAULT_URL);
  }, []);

  function tryConnect(url) {
    setStatus('checking');
    setShowFrame(false);
    fetch(`${url}/api/videos`, { signal: AbortSignal.timeout(4000) })
      .then(r => { if (!r.ok) throw new Error(); return r; })
      .then(() => { setServerUrl(url); setStatus('ok'); setShowFrame(true); })
      .catch(() => { setStatus('err'); setShowFrame(false); });
  }

  // ── Connected — full iframe ──────────────────────────────────────────
  if (showFrame && status === 'ok') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}>
        <div style={{
          background: colors.card, borderBottom: `1px solid ${colors.cardBorder}`,
          padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        }}>
          <StatusDot status={status} />
          <span style={{ fontSize: 12, color: colors.textDim, fontFamily: 'monospace' }}>{serverUrl}</span>
          <button onClick={() => { setShowFrame(false); setStatus('idle'); }}
            style={{ marginLeft: 'auto', fontSize: 12, color: colors.textDim, background: 'none', border: 'none', cursor: 'pointer' }}>
            ✕ disconnect
          </button>
        </div>
        <iframe src={serverUrl} style={{ flex: 1, border: 'none', display: 'block' }} title="Swing Review" />
      </div>
    );
  }

  // ── Not connected — instructions + connect panel ─────────────────────
  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)', background: colors.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32,
    }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <div style={{ maxWidth: 620, width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: colors.text, margin: '0 0 8px',
            fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
            Swing Detection Review
          </h2>
          <p style={{ color: colors.textMuted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            This panel is a local dev tool — it connects to a Flask server running on your machine
            that re-runs the detection pipeline and serves interactive signal charts.
          </p>
        </div>

        {/* Connect panel */}
        <div style={{
          background: colors.card, border: `1px solid ${colors.cardBorder}`,
          borderRadius: 12, padding: '20px 24px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <StatusDot status={status} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryConnect(inputVal)}
              placeholder="http://localhost:5555"
              style={{
                flex: 1, background: '#0a0f1a', border: `1px solid ${colors.cardBorder}`,
                borderRadius: 8, padding: '8px 12px', color: colors.text,
                fontSize: 13, fontFamily: 'monospace', outline: 'none',
              }}
            />
            <button
              onClick={() => tryConnect(inputVal)}
              disabled={status === 'checking'}
              style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: status === 'checking' ? colors.cardBorder : `${colors.accent}20`,
                border: `1px solid ${status === 'checking' ? 'transparent' : `${colors.accent}50`}`,
                color: status === 'checking' ? colors.textDim : colors.accent,
                cursor: status === 'checking' ? 'default' : 'pointer',
                fontFamily: "'DM Sans', -apple-system, sans-serif",
              }}
            >
              {status === 'checking' ? 'Connecting…' : 'Connect'}
            </button>
          </div>
          {status === 'err' && (
            <p style={{ color: colors.red, fontSize: 12, margin: '10px 0 0', lineHeight: 1.5 }}>
              Could not reach the server. Make sure it's running and the URL is correct.
              {!isLocal && ' Note: browsers block HTTP iframes on HTTPS pages — run the docs locally instead.'}
            </p>
          )}
        </div>

        {/* Setup instructions */}
        <div style={{
          background: colors.card, border: `1px solid ${colors.cardBorder}`,
          borderRadius: 12, padding: '20px 24px',
        }}>
          <p style={{ color: colors.textMuted, fontSize: 13, fontWeight: 600, margin: '0 0 14px',
            textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            How to start the server
          </p>
          {[
            { n: 1, label: 'Activate the conda env',        code: 'conda activate fastdl' },
            { n: 2, label: 'Navigate to the review server', code: 'cd testing/end2end' },
            { n: 3, label: 'Start the server',
              code: 'python review_server.py \\\n  --data-dir ../data/oct25/ \\\n  --output-dir ../oct25_testing/' },
            { n: 4, label: 'Open the docs locally',         code: 'cd ../../golf-pipeline-final/_output_artifacts\nnpm run dev' },
          ].map(({ n, label, code }) => (
            <div key={n} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: `${colors.accent}18`, border: `1px solid ${colors.accent}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: colors.accent,
              }}>{n}</span>
              <div>
                <p style={{ color: colors.text, fontSize: 13, margin: '0 0 6px' }}>{label}</p>
                <pre style={{
                  background: '#0a0f1a', border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 6, padding: '8px 12px', margin: 0,
                  fontSize: 12, color: '#a5d6a7', lineHeight: 1.6,
                  fontFamily: 'monospace', whiteSpace: 'pre',
                }}>{code}</pre>
              </div>
            </div>
          ))}
          {!isLocal && (
            <div style={{
              marginTop: 8, padding: '10px 14px', borderRadius: 8,
              background: `${colors.yellow}10`, border: `1px solid ${colors.yellow}30`,
            }}>
              <p style={{ color: colors.yellow, fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                <strong>GitHub Pages note:</strong> this page is served over HTTPS, which blocks
                connections to plain HTTP localhost. Run the docs locally with{' '}
                <code style={{ fontFamily: 'monospace', background: '#0a0f1a', padding: '1px 4px', borderRadius: 3 }}>
                  npm run dev
                </code>
                {' '}to use this tab.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

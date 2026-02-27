/* ── Shared pipeline data & colors ──────────────────────────── */

export const colors = {
  bg: '#0a0f1a',
  card: '#111827',
  cardBorder: '#1e293b',
  cardHover: '#162032',
  accent: '#22d3ee',
  accentDim: 'rgba(34,211,238,0.15)',
  green: '#34d399',
  greenDim: 'rgba(52,211,153,0.15)',
  amber: '#fbbf24',
  amberDim: 'rgba(251,191,36,0.12)',
  purple: '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.15)',
  rose: '#fb7185',
  roseDim: 'rgba(251,113,133,0.12)',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  divider: '#1e293b',
};

export const serviceColors = {
  s3: colors.green,
  sqs: colors.rose,
  ec2: colors.purple,
  lambda: colors.amber,
  db: colors.accent,
  default: colors.textDim,
};

export const heroStats = [
  { label: 'Stages', value: '5', sub: 'ingest → analyze', color: colors.accent, numeric: 5 },
  { label: 'End-to-End', value: '~6 min', sub: '5-min 60fps video', color: colors.purple, numeric: 6 },
  { label: 'Throughput', value: '57.5 fps', sub: 'turbo + torch.compile', color: colors.green, numeric: 57.5 },
  { label: 'Cost', value: '$0.04', sub: 'per video (spot)', color: colors.amber, numeric: 0.04 },
];

export const pipelineStages = [
  {
    id: 'ingest',
    title: 'Ingestion',
    sub: 'Raw upload → S3 event → SQS queue',
    icon: '📥',
    service: 's3',
    color: colors.green,
    nodes: [
      { type: 's3', title: 'S3: golf-swing-data', subtitle: '{golfer}/raw/', details: 'Raw .MOV (HEVC 10-bit VFR) or .mp4' },
      { arrow: true, label: 'S3 event (.MOV / .mp4)', color: colors.green },
      { type: 'sqs', title: 'SQS: golf-video-label', details: 'S3 suffix filter triggers notification to queue' },
    ],
  },
  {
    id: 'gpu',
    title: 'GPU Processing',
    sub: 'EC2 spot worker — transcode + pose estimation',
    icon: '🚂',
    service: 'ec2',
    color: colors.purple,
    badge: 'g6.2xlarge',
    nodes: [
      {
        type: 'ec2', title: 'EC2 g6.2xlarge (Spot)',
        subtitle: '8 vCPU · L4 24GB GPU · auto-terminates on idle',
        steps: [
          { label: 'Step 1: Transcode', desc: 'NVDEC decode (HEVC) → NVENC encode (H.264 CFR). ~24s for 5800 frames. libx264 fallback.' },
          { label: 'Step 2: Label (Turbo Mode)', desc: 'NVDEC h264_cuvid → CPU prep → GPU infer. Batched RTMDet + ViTPose-Huge (torch.compile). ~57.5 fps.' },
        ],
      },
    ],
    outputs: [
      { label: '.pkl (1.2 MB)', type: 's3', title: 'S3: /keypoints' },
      { label: '.mp4', type: 's3', title: 'S3: /processed' },
    ],
  },
  {
    id: 'detect',
    title: 'Swing Landmark Detection',
    sub: 'Signal processing on keypoints → backswing & contact frames',
    icon: '🎯',
    service: 'lambda',
    color: colors.amber,
    nodes: [
      { arrow: true, label: 'S3 event (.pkl)', color: colors.amber },
      { type: 'lambda', title: 'Lambda: swing_detect', details: '~13s signal processing. Detects backswings & contacts.' },
    ],
    outputs: [
      { label: 'PutItem', type: 'db', title: 'DynamoDB', subtitle: 'golf-swing-detections' },
      { label: '.json', type: 's3', title: 'S3: /detection' },
    ],
  },
  {
    id: 'hand',
    title: 'Hand & Score Finder',
    sub: 'Visualizations, finger predictions & notifications',
    icon: '✌️',
    service: 'lambda',
    color: colors.amber,
    nodes: [
      { arrow: true, label: 'S3 event (.json)', color: colors.amber },
      {
        type: 'lambda', title: 'Lambda: post_processing',
        details: 'Reads .json, .pkl, .mp4. Generates visualizations & finger predictions.',
        outputs: [
          { key: '/fingers', desc: 'JSON' },
          { key: '/frames', desc: 'JPG overlays' },
          { key: '/output', desc: 'Grids, plots' },
          { key: 'DynamoDB', desc: 'update fingers' },
          { key: 'Pushover', desc: 'mobile notification' },
        ],
      },
    ],
  },
  {
    id: 'analyze',
    title: 'Analysis',
    sub: 'On-demand biomechanical analysis',
    icon: '📊',
    service: 'lambda',
    color: colors.purple,
    manual: true,
    nodes: [
      { type: 'lambda', title: 'Lambda: analyze', details: 'Requires: golfer, score thresholds, phases.\nGenerates SPM plots + Gemini text analysis.' },
    ],
    outputs: [
      { type: 's3', title: 'S3: /analysis', subtitle: 'Plots, Gemini TXT' },
      { type: 'db', title: 'DynamoDB', subtitle: 'ANALYSIS item' },
      { type: 'default', title: 'Pushover', subtitle: 'Mobile notification' },
    ],
  },
];

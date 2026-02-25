import React, { useState } from 'react';

const TIERS = [
  { videos: 100,  rate: 12.5,   avgConcurrent: 1.25,  fleet: 3,  utilization: 0.42 },
  { videos: 250,  rate: 31.25,  avgConcurrent: 3.13,  fleet: 6,  utilization: 0.52 },
  { videos: 500,  rate: 62.5,   avgConcurrent: 6.25,  fleet: 11, utilization: 0.57 },
  { videos: 1000, rate: 125,    avgConcurrent: 12.5,  fleet: 20, utilization: 0.63 },
];

const SPOT_RATE = 0.47;       // $/hr g6.2xlarge spot
const WINDOW_HRS = 8;         // daily arrival window
const VIDEO_PROC_MIN = 6;     // minutes per video
const FPS = 57.5;             // turbo compiled throughput
const VIDEOS_PER_HR = 10;     // per node

// S3 pricing
const S3_STANDARD_GB = 0.023;
const S3_IA_GB = 0.0125;
const RAW_MB = 200;
const PROCESSED_MB = 50;
const PKL_MB = 5;
const IA_MB_PER_VIDEO = RAW_MB + PROCESSED_MB;
const STD_MB_PER_VIDEO = PKL_MB;

// Per-video tiny costs
const LAMBDA_PER_VIDEO = 0.00006;
const SQS_PER_VIDEO = 0.0000004;
const DDB_PER_VIDEO = 0.00000125;

const fmt = (n, decimals = 2) => n.toLocaleString('en-US', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
});

const usd = (n) => {
  if (n < 0.01) return '<$0.01';
  if (n < 1) return `$${fmt(n)}`;
  if (n >= 1000) return `$${fmt(n, 0)}`;
  return `$${fmt(n)}`;
};

/* ── Reusable pieces ─────────────────────────────────────────────── */

const SectionTitle = ({ children, sub }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-gray-800">{children}</h2>
    {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
  </div>
);

const Pill = ({ label, value, color = 'gray' }) => (
  <div className={`bg-${color}-50 border border-${color}-200 rounded-lg px-4 py-2 text-center`}>
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className={`text-lg font-bold text-${color}-700`}>{value}</p>
  </div>
);

const Bar = ({ pct, color = 'purple' }) => (
  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
    <div
      className={`bg-${color}-500 h-full rounded-full transition-all`}
      style={{ width: `${Math.min(pct, 100)}%` }}
    />
  </div>
);

const Th = ({ children, align = 'left' }) => (
  <th className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-${align} border-b border-gray-200`}>
    {children}
  </th>
);

const Td = ({ children, bold, highlight, align = 'left' }) => (
  <td className={`px-4 py-3 text-sm text-${align} ${bold ? 'font-bold text-gray-900' : 'text-gray-700'} ${highlight ? 'bg-green-50' : ''}`}>
    {children}
  </td>
);

/* ── Compute helpers ─────────────────────────────────────────────── */

function computeCosts(tier) {
  const dailyEc2 = tier.fleet * WINDOW_HRS * SPOT_RATE;
  const dailyLambda = tier.videos * LAMBDA_PER_VIDEO;
  const dailySqs = tier.videos * SQS_PER_VIDEO;
  const dailyDdb = tier.videos * DDB_PER_VIDEO;
  const dailyOther = dailyLambda + dailySqs + dailyDdb;
  const dailyTotal = dailyEc2 + dailyOther;
  const perVideo = dailyTotal / tier.videos;

  // S3: first-month average (linear accumulation over 30 days → avg = 15.5 days of data)
  const avgDays = 15.5;
  const monthlyIaGb = (tier.videos * IA_MB_PER_VIDEO * avgDays) / 1000;
  const monthlyStdGb = (tier.videos * STD_MB_PER_VIDEO * avgDays) / 1000;
  const monthlyS3 = monthlyIaGb * S3_IA_GB + monthlyStdGb * S3_STANDARD_GB;

  const weeklyTotal = dailyTotal * 7;
  const monthlyCompute = dailyTotal * 30;
  const monthlyTotal = monthlyCompute + monthlyS3;

  return { dailyEc2, dailyOther, dailyTotal, perVideo, monthlyS3, weeklyTotal, monthlyCompute, monthlyTotal };
}

/* ── Main Component ──────────────────────────────────────────────── */

const PipelineCosts = () => {
  const [selectedTier, setSelectedTier] = useState(1); // default 250/day
  const tier = TIERS[selectedTier];
  const costs = computeCosts(tier);
  const allCosts = TIERS.map(computeCosts);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">Pipeline Cost Projections</h1>
          <p className="text-gray-500 mt-1">
            Golf swing processing pipeline — real-time SLA cost model
          </p>
        </div>

        {/* Assumptions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <SectionTitle sub="Per-video baseline">Assumptions</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Pill label="Video Length" value="5 min" color="blue" />
            <Pill label="Frame Rate" value="60 fps" color="blue" />
            <Pill label="Raw Size" value="~200 MB" color="blue" />
            <Pill label="Processing" value="~6 min" color="purple" />
            <Pill label="Instance" value="g6.2xlarge" color="purple" />
            <Pill label="Spot Price" value="$0.47/hr" color="green" />
            <Pill label="Throughput" value={`${FPS} fps`} color="green" />
            <Pill label="Arrival Window" value="8 hrs/day" color="orange" />
          </div>
        </div>

        {/* Tier Selector */}
        <div className="flex gap-3 mb-8">
          {TIERS.map((t, i) => (
            <button
              key={t.videos}
              onClick={() => setSelectedTier(i)}
              className={`px-5 py-3 rounded-lg font-semibold text-sm transition-all ${
                selectedTier === i
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
              }`}
            >
              {t.videos}/day
            </button>
          ))}
        </div>

        {/* Fleet Sizing Detail */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <SectionTitle sub="Erlang-C model, <5% wait probability">
            Fleet Sizing — {tier.videos} videos/day
          </SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Pill label="Arrival Rate" value={`${tier.rate}/hr`} color="orange" />
            <Pill label="Avg Concurrent" value={fmt(tier.avgConcurrent)} color="blue" />
            <Pill label="Fleet Size" value={`${tier.fleet} nodes`} color="purple" />
            <Pill label="Utilization" value={`${Math.round(tier.utilization * 100)}%`} color="green" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Fleet utilization during {WINDOW_HRS}hr window</span>
              <span>{Math.round(tier.utilization * 100)}%</span>
            </div>
            <Bar pct={tier.utilization * 100} color="purple" />
            <p className="text-xs text-gray-400 mt-2">
              {tier.fleet} nodes warm for {WINDOW_HRS}hrs. Each processes ~{VIDEOS_PER_HR} videos/hr.
              Headroom absorbs Poisson bursts without queuing.
            </p>
          </div>
        </div>

        {/* Daily Breakdown (selected tier) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <SectionTitle sub={`${tier.fleet} nodes x ${WINDOW_HRS}hrs x $${SPOT_RATE}/hr`}>
            Daily Cost — {tier.videos} videos
          </SectionTitle>
          <div className="space-y-3">
            {[
              { label: 'EC2 Spot (GPU fleet)', amount: costs.dailyEc2, pct: (costs.dailyEc2 / costs.dailyTotal) * 100, color: 'purple' },
              { label: 'Lambda + SQS + DynamoDB', amount: costs.dailyOther, pct: (costs.dailyOther / costs.dailyTotal) * 100, color: 'orange' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{row.label}</span>
                  <span className="font-semibold">{usd(row.amount)}</span>
                </div>
                <Bar pct={row.pct} color={row.color} />
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="font-bold text-gray-800">Daily Total</span>
              <span className="font-bold text-gray-800 text-lg">{usd(costs.dailyTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Per-video cost</span>
              <span className="font-semibold text-green-700">{usd(costs.perVideo)}</span>
            </div>
          </div>
        </div>

        {/* Comparison Table — All Tiers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm overflow-x-auto">
          <SectionTitle sub="Side-by-side across all volume tiers">
            Cost Comparison
          </SectionTitle>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <Th>Metric</Th>
                {TIERS.map((t, i) => (
                  <Th key={t.videos} align="right">
                    <span className={selectedTier === i ? 'text-purple-600' : ''}>{t.videos}/day</span>
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td bold>Fleet Nodes</Td>
                {TIERS.map((t) => <Td key={t.videos} align="right">{t.fleet}</Td>)}
              </tr>
              <tr className="bg-gray-50">
                <Td bold>Utilization</Td>
                {TIERS.map((t) => <Td key={t.videos} align="right">{Math.round(t.utilization * 100)}%</Td>)}
              </tr>
              <tr>
                <Td bold>Daily EC2</Td>
                {allCosts.map((c, i) => <Td key={i} align="right">{usd(c.dailyEc2)}</Td>)}
              </tr>
              <tr className="bg-gray-50">
                <Td bold>Daily Total</Td>
                {allCosts.map((c, i) => <Td key={i} align="right" bold>{usd(c.dailyTotal)}</Td>)}
              </tr>
              <tr>
                <Td bold>Per-Video</Td>
                {allCosts.map((c, i) => <Td key={i} align="right" highlight>{usd(c.perVideo)}</Td>)}
              </tr>
              <tr className="border-t-2 border-gray-300">
                <Td bold>Weekly</Td>
                {allCosts.map((c, i) => <Td key={i} align="right">{usd(c.weeklyTotal)}</Td>)}
              </tr>
              <tr className="bg-gray-50">
                <Td bold>Monthly Compute</Td>
                {allCosts.map((c, i) => <Td key={i} align="right">{usd(c.monthlyCompute)}</Td>)}
              </tr>
              <tr>
                <Td bold>Monthly S3 Storage</Td>
                {allCosts.map((c, i) => <Td key={i} align="right">{usd(c.monthlyS3)}</Td>)}
              </tr>
              <tr className="bg-purple-50 border-t-2 border-purple-200">
                <Td bold>Monthly Total</Td>
                {allCosts.map((c, i) => <Td key={i} align="right" bold>{usd(c.monthlyTotal)}</Td>)}
              </tr>
            </tbody>
          </table>
        </div>

        {/* S3 Storage Deep Dive */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <SectionTitle sub=".mov/.mp4 → Standard-IA after 1 day, .pkl stays in Standard">
            S3 Storage Breakdown
          </SectionTitle>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <Th>Data Type</Th>
                <Th align="right">Size/Video</Th>
                <Th align="right">Tier</Th>
                <Th align="right">Rate</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>Raw .MOV upload</Td>
                <Td align="right">~{RAW_MB} MB</Td>
                <Td align="right">Standard-IA</Td>
                <Td align="right">${S3_IA_GB}/GB/mo</Td>
              </tr>
              <tr className="bg-gray-50">
                <Td>Processed .mp4</Td>
                <Td align="right">~{PROCESSED_MB} MB</Td>
                <Td align="right">Standard-IA</Td>
                <Td align="right">${S3_IA_GB}/GB/mo</Td>
              </tr>
              <tr>
                <Td>Keypoints .pkl</Td>
                <Td align="right">~{PKL_MB} MB</Td>
                <Td align="right">Standard</Td>
                <Td align="right">${S3_STANDARD_GB}/GB/mo</Td>
              </tr>
              <tr className="bg-gray-50">
                <Td>Detection .json</Td>
                <Td align="right">&lt;1 KB</Td>
                <Td align="right">Standard</Td>
                <Td align="right">negligible</Td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-4">
            First-month costs shown. Storage accumulates — month 2 is ~3x month 1 average.
            Consider Glacier Instant Retrieval ($0.004/GB/mo) for further savings on archived .mov/.mp4.
          </p>
        </div>

        {/* Scaling Insight */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <SectionTitle sub="Per-video cost decreases with volume">
            Economies of Scale
          </SectionTitle>
          <div className="space-y-4">
            {TIERS.map((t, i) => {
              const c = allCosts[i];
              const maxCost = allCosts[0].perVideo;
              return (
                <div key={t.videos}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 w-20">{t.videos}/day</span>
                    <div className="flex-1 mx-4">
                      <Bar pct={(c.perVideo / maxCost) * 100} color="green" />
                    </div>
                    <span className="font-bold text-green-700 w-20 text-right">{usd(c.perVideo)}</span>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-gray-400 mt-2">
              Pure processing cost is ~$0.04/video. The SLA overhead (fleet idle time) accounts for the rest.
              Higher volume = better utilization = lower per-video cost.
            </p>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-amber-800 mb-3">Notes & Optimizations</h3>
          <ul className="space-y-2 text-sm text-amber-900">
            <li>
              <strong>Auto-scaling alternative:</strong> SQS-based auto-scaling (accepting ~3 min scale-up lag)
              can reduce EC2 costs by 20-30% vs the always-on fleet model shown here.
            </li>
            <li>
              <strong>Spot interruptions:</strong> At 20 nodes, diversify across g6.2xlarge, g5.2xlarge,
              and multiple AZs to reduce interruption risk.
            </li>
            <li>
              <strong>Storage grows:</strong> S3 costs are cumulative. Each month adds to the total.
              Implement lifecycle policies or periodic cleanup for older data.
            </li>
            <li>
              <strong>Glacier upgrade:</strong> Moving .mov/.mp4 to Glacier Instant Retrieval ($0.004/GB/mo)
              instead of Standard-IA saves an additional ~70% on storage.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default PipelineCosts;

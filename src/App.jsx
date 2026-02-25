import React, { useState } from 'react';
import PipelineCore from './PipelineCore';
import PipelineCosts from './PipelineCosts';
import PipelineDataflow from './PipelineDataflow';

const TABS = [
  { id: 'core', label: 'Architecture', component: PipelineCore },
  { id: 'dataflow', label: 'Dataflow', component: PipelineDataflow },
  { id: 'costs', label: 'Costs', component: PipelineCosts },
];

export default function App() {
  const [active, setActive] = useState('core');
  const ActiveComponent = TABS.find((t) => t.id === active).component;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-6">
          <span className="font-bold text-gray-800 text-lg">Golf Pipeline</span>
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
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

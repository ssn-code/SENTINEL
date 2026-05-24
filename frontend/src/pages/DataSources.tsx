import React from 'react';
import { Database, FileText, Globe, ShieldCheck } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import GradientText from '../components/GradientText';

export const DataSources: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2">
          <Database className="h-4 w-4 text-cyan-300" />
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-200/80">Data Sources</span>
        </div>

        <h1 className="mt-6 text-5xl font-display font-bold leading-[0.95] text-white md:text-7xl">
          NCRB
          <br />
          <GradientText
            colors={['#38bdf8', '#c084fc', '#22d3ee', '#38bdf8']}
            animationSpeed={6}
            showBorder={false}
            className="inline-block"
          >
            Source Intelligence
          </GradientText>
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-gray-400">
          SENTINEL uses official National Crime Records Bureau publications and open geographic data to visualize state-level crime intelligence.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <SpotlightCard className="rounded-[2rem] border border-border bg-surface p-8" spotlightColor="rgba(56, 189, 248, 0.14)">
          <div className="mb-5 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">Primary Dataset</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Crime totals are sourced from NCRB publications covering IPC crimes, women crimes, and cyber crimes at the state level.
          </p>
          <a
            href="https://ncrb.gov.in"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Visit NCRB Official
          </a>
        </SpotlightCard>

        <SpotlightCard className="rounded-[2rem] border border-border bg-surface p-8" spotlightColor="rgba(192, 132, 252, 0.14)">
          <div className="mb-5 inline-flex rounded-2xl bg-violet-400/10 p-3 text-violet-300">
            <Globe className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">Geographic Boundaries</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            The India map uses open-source GeoJSON boundaries stored locally in the app for consistent rendering and no paid mapping dependency.
          </p>
          <p className="mt-6 rounded-xl border border-white/8 bg-bg/50 px-4 py-3 text-sm text-gray-300">
            Local file: <span className="font-mono text-white">public/india-states.geojson</span>
          </p>
        </SpotlightCard>

        <SpotlightCard className="rounded-[2rem] border border-border bg-surface p-8" spotlightColor="rgba(250, 204, 21, 0.14)">
          <div className="mb-5 inline-flex rounded-2xl bg-amber-400/10 p-3 text-amber-300">
            <FileText className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">Data Processing</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Backend records are normalized for inconsistent state spellings and used to calculate or fallback-generate safety scores for visualization.
          </p>
        </SpotlightCard>

        <SpotlightCard className="rounded-[2rem] border border-border bg-surface p-8" spotlightColor="rgba(34, 197, 94, 0.14)">
          <div className="mb-5 inline-flex rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
            <Database className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">Current Fields</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-400">
            <li>`state`</li>
            <li>`ipc_crimes`</li>
            <li>`women_crimes`</li>
            <li>`cyber_crimes`</li>
            <li>`safety_score` when available</li>
          </ul>
        </SpotlightCard>
      </div>
    </div>
  );
};

export default DataSources;

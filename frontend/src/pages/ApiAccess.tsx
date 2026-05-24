import React from 'react';
import { Braces, DatabaseZap, Globe, Server } from 'lucide-react';
import SpotlightCard from '../components/SpotlightCard';
import GradientText from '../components/GradientText';
import { API_BASE_URL } from '../lib/api';

export const ApiAccess: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-2">
          <Server className="h-4 w-4 text-emerald-300" />
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-emerald-200/80">API Access</span>
        </div>

        <h1 className="mt-6 text-5xl font-display font-bold leading-[0.95] text-white md:text-7xl">
          SENTINEL
          <br />
          <GradientText
            colors={['#4ade80', '#22d3ee', '#c084fc', '#4ade80']}
            animationSpeed={6}
            showBorder={false}
            className="inline-block"
          >
            Backend Endpoint
          </GradientText>
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-gray-400">
          The dashboard currently reads state-level crime intelligence from your local FastAPI backend.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SpotlightCard className="rounded-[2rem] border border-border bg-surface p-8" spotlightColor="rgba(34, 197, 94, 0.14)">
          <div className="mb-5 inline-flex rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
            <Globe className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">Active Endpoint</h2>
          <div className="mt-4 rounded-2xl border border-white/8 bg-bg/60 p-5 font-mono text-sm text-cyan-300">
            {`${API_BASE_URL}/states`}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-gray-400">
            This endpoint powers the dashboard table and the India crime map. It is expected to return an array of state-level records.
          </p>
        </SpotlightCard>

        <SpotlightCard className="rounded-[2rem] border border-border bg-surface p-8" spotlightColor="rgba(192, 132, 252, 0.14)">
          <div className="mb-5 inline-flex rounded-2xl bg-violet-400/10 p-3 text-violet-300">
            <Braces className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">Expected Response</h2>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/8 bg-bg/60 p-5 text-xs text-gray-300">
{`[
  {
    "id": 1,
    "state": "Uttar Pradesh",
    "ipc_crimes": 428794,
    "women_crimes": 66381,
    "cyber_crimes": 10794,
    "safety_score": 14
  }
]`}
          </pre>
        </SpotlightCard>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <SpotlightCard className="rounded-[2rem] border border-border bg-surface p-8" spotlightColor="rgba(56, 189, 248, 0.14)">
          <div className="mb-5 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <DatabaseZap className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">Frontend Usage</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            The frontend fetches this endpoint directly in the dashboard and map modules. If `safety_score` is missing, the map currently derives a fallback score from `ipc_crimes`.
          </p>
        </SpotlightCard>

        <SpotlightCard className="rounded-[2rem] border border-border bg-surface p-8" spotlightColor="rgba(250, 204, 21, 0.14)">
          <div className="mb-5 inline-flex rounded-2xl bg-amber-400/10 p-3 text-amber-300">
            <Server className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">Recommendation</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Return a normalized `safety_score` field consistently from the backend so the choropleth map and state detail pages do not rely on derived fallback logic.
          </p>
        </SpotlightCard>
      </div>
    </div>
  );
};

export default ApiAccess;

import React, { useMemo, useState } from 'react';
import { Activity, AlertTriangle, MapPinned, Shield } from 'lucide-react';
import IndiaCrimeMap, { CrimeMapRow } from '../components/IndiaCrimeMap';
import GradientText from '../components/GradientText';
import SpotlightCard from '../components/SpotlightCard';
import { API_BASE_URL } from '../lib/api';

function deriveSafetyScore(row: CrimeMapRow) {
  if (typeof row.safety_score === 'number') {
    return Math.max(0, Math.min(100, row.safety_score));
  }

  return Math.max(10, Math.min(100, Math.round(100 - row.ipc_crimes / 5000)));
}

function getRiskLabel(score: number) {
  if (score <= 20) return 'Very Unsafe';
  if (score <= 40) return 'Unsafe';
  if (score <= 60) return 'Moderate';
  if (score <= 80) return 'Safe';
  return 'Very Safe';
}

export const MapIntel: React.FC = () => {
  const [selectedState, setSelectedState] = useState<CrimeMapRow | null>(null);
  const [selectedStateName, setSelectedStateName] = useState<string | null>(null);

  const selectedScore = useMemo(
    () => (selectedState ? deriveSafetyScore(selectedState) : null),
    [selectedState],
  );

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-20 pt-32">
      <section className="mb-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2">
            <MapPinned className="h-4 w-4 text-cyan-300" />
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-200/80">Geo Intelligence</span>
          </div>

          <h1 className="mt-6 text-5xl font-display font-bold leading-[0.95] text-white md:text-7xl">
            India Crime
            <br />
            <GradientText
              colors={['#38bdf8', '#c084fc', '#22d3ee', '#38bdf8']}
              animationSpeed={6}
              showBorder={false}
              className="inline-block"
            >
              Command Map
            </GradientText>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-400">
            SENTINEL visualizes NCRB state crime exposure on a dedicated India map using open-source boundaries and live FastAPI data.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SpotlightCard className="rounded-[1.75rem] border border-border bg-surface p-6" spotlightColor="rgba(56, 189, 248, 0.14)">
            <div className="mb-4 inline-flex rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
              <MapPinned className="h-5 w-5" />
            </div>
            <div className="text-sm text-gray-500">Map Source</div>
            <div className="mt-2 text-xl font-bold text-white">India States GeoJSON</div>
          </SpotlightCard>

          <SpotlightCard className="rounded-[1.75rem] border border-border bg-surface p-6" spotlightColor="rgba(244, 114, 182, 0.14)">
            <div className="mb-4 inline-flex rounded-2xl bg-pink-400/10 p-3 text-pink-300">
              <Activity className="h-5 w-5" />
            </div>
            <div className="text-sm text-gray-500">Signal</div>
            <div className="mt-2 text-xl font-bold text-white">{`Live from ${API_BASE_URL}/states`}</div>
          </SpotlightCard>

          <SpotlightCard className="rounded-[1.75rem] border border-border bg-surface p-6" spotlightColor="rgba(132, 204, 22, 0.14)">
            <div className="mb-4 inline-flex rounded-2xl bg-lime-400/10 p-3 text-lime-300">
              <Shield className="h-5 w-5" />
            </div>
            <div className="text-sm text-gray-500">Fallback</div>
            <div className="mt-2 text-xl font-bold text-white">Derived score if backend omits safety_score</div>
          </SpotlightCard>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(10,18,28,0.98),rgba(7,12,18,0.98))] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:p-6">
          <IndiaCrimeMap
            selectedStateName={selectedStateName}
            onStateSelect={(state, stateName) => {
              setSelectedState(state);
              setSelectedStateName(stateName);
            }}
          />
        </div>

        <aside className="space-y-6">
          <SpotlightCard className="rounded-[2rem] border border-border bg-surface p-6" spotlightColor="rgba(192, 132, 252, 0.16)">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-gray-500">Selected State</div>
                <h2 className="mt-3 text-3xl font-bold text-white">{selectedStateName ?? 'Hover or click a state'}</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">
                {selectedScore !== null ? getRiskLabel(selectedScore) : 'Awaiting selection'}
              </div>
            </div>

            {selectedState && selectedScore !== null ? (
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-white/8 bg-bg/60 p-4">
                  <div className="text-sm text-gray-500">Safety Score</div>
                  <div className="mt-2 text-5xl font-bold text-white">{selectedScore}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl border border-white/8 bg-bg/60 p-4">
                    <div className="text-sm text-gray-500">IPC Crimes</div>
                    <div className="mt-2 text-2xl font-bold text-white">{selectedState.ipc_crimes.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-bg/60 p-4">
                    <div className="text-sm text-gray-500">Women Crimes</div>
                    <div className="mt-2 text-2xl font-bold text-white">{selectedState.women_crimes.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-bg/60 p-4">
                    <div className="text-sm text-gray-500">Cyber Crimes</div>
                    <div className="mt-2 text-2xl font-bold text-white">{selectedState.cyber_crimes.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-bg/40 p-6 text-sm leading-relaxed text-gray-400">
                Click a state on the map to inspect its crime totals and safety classification.
              </div>
            )}
          </SpotlightCard>

          <SpotlightCard className="rounded-[2rem] border border-border bg-surface p-6" spotlightColor="rgba(56, 189, 248, 0.12)">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-bold text-white">Data Notes</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-gray-400">
              <li>State matching now normalizes backend spellings such as `Uttarpradesh`, `Tamilnadu`, `Telengana`, and `A&N Islands`.</li>
              <li>The map uses a state-level GeoJSON file stored locally in `public/india-states.geojson`.</li>
              <li>If `safety_score` is missing from the backend, SENTINEL derives it from IPC crime totals so the choropleth still renders.</li>
            </ul>
          </SpotlightCard>
        </aside>
      </section>
    </div>
  );
};

export default MapIntel;

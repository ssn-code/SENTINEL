import React from 'react';
import TargetCursor from '../components/TargetCursor';

export const TargetCursorDemo: React.FC = () => {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
      <TargetCursor spinDuration={2} hideDefaultCursor parallaxOn hoverDuration={0.2} />

      <section className="rounded-2xl border border-border bg-surface p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <h1 className="text-4xl font-bold text-white mb-4">Target Cursor Demo</h1>
        <p className="text-gray-400 mb-6">This page demonstrates the custom target cursor behavior for interactive regions. Hover elements with the <code>.cursor-target</code> class to activate the animation.</p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <button className="cursor-target rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-4 text-left text-white transition hover:bg-cyan-400/15">
            <h3 className="text-lg font-semibold">Interactive Button</h3>
            <p className="mt-1 text-sm text-gray-300">Hover over and click to see cursor response.</p>
          </button>

          <div className="cursor-target rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-gray-300">
            <h3 className="mb-2 text-lg font-semibold text-white">Interactive Box</h3>
            <p>Hover small card to activate target cursor effects.</p>
          </div>

          <a href="#/map" className="cursor-target rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-sm text-gray-300 hover:bg-indigo-500/15">
            <h3 className="text-lg font-semibold text-white">Go to Map</h3>
            <p className="mt-1">Cursor target also applies to the map page wrapper.</p>
          </a>
        </div>
      </section>
    </div>
  );
};

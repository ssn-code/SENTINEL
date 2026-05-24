import React from 'react';

export const CookiePolicy: React.FC = () => {
  return (
    <div className="px-6 pb-20 pt-32">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-5xl font-display font-bold text-white">Cookie Policy</h1>

        <article className="rounded-3xl border border-border bg-surface p-8 space-y-6 text-gray-300">
          <p>
            SENTINEL uses minimal cookies and local storage only for session persistence and analytics. We do not
            track users across other sites.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-white">Necessary Cookies</h2>
            <p>
              Essential cookies are used only to keep the UI functional and are set by the application itself.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">Analytics</h2>
            <p>
              Optional analytics cookies may be used for anonymous traffic patterns; you can disable these in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">Changes</h2>
            <p>
              We may update this Cookie Policy over time; review it occasionally for any changes.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default CookiePolicy;

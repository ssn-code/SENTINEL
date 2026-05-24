import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="px-6 pb-20 pt-32">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-5xl font-display font-bold text-white">Privacy Policy</h1>

        <article className="rounded-3xl border border-border bg-surface p-8 space-y-6 text-gray-300">
          <p>
            SENTINEL is committed to protecting your privacy. This Privacy Policy explains how we collect,
            use, disclose and safeguard your information when you use our website.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
            <ul className="list-disc list-inside mt-3 space-y-2">
              <li>Anonymous analytics data (e.g., page views, usage patterns).</li>
              <li>Data from third-party services only when explicitly consented.</li>
              <li>No personal data is stored on our servers unless provided voluntarily to support feedback requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">How We Use Information</h2>
            <p>
              We use collected data to improve the product, to analyse usage trends, and to keep the site secure.
              We do not sell personal data, and we share information only for legal compliance or to protect our rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">Contact Us</h2>
            <p>
              For privacy concerns, contact the project maintainer via the GitHub repository issue tracker.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

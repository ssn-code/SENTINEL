import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="px-6 pb-20 pt-32">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-5xl font-display font-bold text-white">Terms of Service</h1>

        <article className="rounded-3xl border border-border bg-surface p-8 space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white">Acceptance of Terms</h2>
            <p>
              By accessing SENTINEL, you agree to these Terms of Service. If you disagree, do not use this website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">Use of the Website</h2>
            <p>
              You may use the dashboard for informational purposes only. Data is provided "as is" and may contain
              errors. SENTINEL is not responsible for decisions made based on this information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">Intellectual Property</h2>
            <p>
              The content, design, and code of SENTINEL are owned by the maintainers and contributors. You may
              not reproduce or republish without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">Limitation of Liability</h2>
            <p>
              We are not liable for any damages resulting from use or inability to use this site. Use at your own risk.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default TermsOfService;

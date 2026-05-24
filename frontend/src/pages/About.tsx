import React from 'react';
import { Database, ExternalLink, Info, Shield } from 'lucide-react';
import ProjectFeedback from '../components/ProjectFeedback';

export const About: React.FC = () => {
  return (
    <div className="px-6 pb-20 pt-32">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-5xl font-display font-bold text-white">About SENTINEL</h1>

        <div className="space-y-12">
          <section className="rounded-3xl border border-border bg-surface p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-safe/10">
                <Database className="h-6 w-6 text-safe" />
              </div>
              <h2 className="text-2xl font-bold text-white">Data Sources</h2>
            </div>
            <p className="mb-6 leading-relaxed text-gray-400">
              Our data is primarily sourced from the annual "Crime in India" reports published by the <strong>National Crime Records Bureau (NCRB)</strong>, Ministry of Home Affairs, Government of India. We utilize validated datasets to present regional safety insights in a structured format.
            </p>
            <a
              href="https://ncrb.gov.in"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 font-bold text-safe hover:underline"
            >
              Visit NCRB Official Website
              <ExternalLink className="h-4 w-4" />
            </a>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-moderate/10">
                <Info className="h-6 w-6 text-moderate" />
              </div>
              <h2 className="text-2xl font-bold text-white">Methodology</h2>
            </div>
            <div className="space-y-6 leading-relaxed text-gray-400">
              <p>
                The <strong>Safety Score (0-100)</strong> is a weighted composite index calculated based on several factors:
              </p>
              <ul className="list-disc space-y-3 pl-6">
                <li><strong>IPC Crime Rate (30%):</strong> Total cognizable crimes per 100,000 population.</li>
                <li><strong>Violent Crime Index (25%):</strong> Incidents of murder, assault, and kidnapping.</li>
                <li><strong>Women Safety Index (20%):</strong> Reported crimes against women and conviction rates.</li>
                <li><strong>Property and Cyber Crime (15%):</strong> Theft, burglary, and digital fraud incidents.</li>
                <li><strong>Detection and Conviction Rate (10%):</strong> Efficiency of local law enforcement.</li>
              </ul>
              <p>
                Scores are normalized against national averages to provide relative safety levels: Safe (&gt;75), Moderate (60-75), Elevated (45-60), and High Risk (&lt;45).
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Disclaimer</h2>
            </div>
            <p className="leading-relaxed italic text-gray-400">
              SENTINEL is an informational dashboard and should not be used as the sole basis for making critical safety decisions. Crime rates can be influenced by reporting efficiency and local law enforcement policies. Always consult official local advisories for immediate safety concerns.
            </p>
          </section>

          <ProjectFeedback />
        </div>
      </div>
    </div>
  );
};

export default About;

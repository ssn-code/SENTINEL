import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import CardNav, { CardNavItem } from './CardNav';
import GradientText from './GradientText';
import LogoLoop, { LogoItem } from './LogoLoop';
import {
  SiFastapi,
  SiLeaflet,
  SiOpenstreetmap,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiVite,
} from 'react-icons/si';
import { fetchApiJson } from '../lib/api';

export const Navbar: React.FC = () => {
  const [topRegions, setTopRegions] = useState<{ label: string; href: string; ariaLabel: string }[]>([
    { label: 'Loading...', href: '#', ariaLabel: 'Loading top regions' }
  ]);

  useEffect(() => {
    fetchApiJson<any[]>('/states')
      .then(data => {
        const top3 = (data || []).slice(0, 3).map((r: any) => ({
          label: r.state,
          href: `#/region/${encodeURIComponent(r.state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))}`,
          ariaLabel: `View ${r.state} region details`
        }));
        if (top3.length > 0) {
          setTopRegions(top3);
        }
      })
      .catch(err => {
        console.error('Failed to fetch regions:', err);
        setTopRegions([
          { label: 'Unavailable', href: '#/dashboard', ariaLabel: 'Region data unavailable' }
        ]);
      });
  }, []);

  const items: CardNavItem[] = [
    {
      label: 'About',
      bgColor: '#0d1320',
      textColor: '#f8fafc',
      links: [
        { label: 'Methodology', href: '#/about', ariaLabel: 'About methodology' },
        { label: 'NCRB Source', href: 'https://ncrb.gov.in', ariaLabel: 'Open NCRB official site' },
        { label: 'Privacy Policy', href: '#/privacy-policy', ariaLabel: 'Open privacy policy' },
        { label: 'Terms of Service', href: '#/terms-of-service', ariaLabel: 'Open terms of service' },
        { label: 'Cookie Policy', href: '#/cookie-policy', ariaLabel: 'Open cookie policy' },
      ],
    },
    {
      label: 'Explore',
      bgColor: '#151d2d',
      textColor: '#f8fafc',
      links: [
        { label: 'Dashboard', href: '#/dashboard', ariaLabel: 'Open dashboard' },
        { label: 'Crime Map', href: '#/map', ariaLabel: 'Open India crime map' },        { label: 'Target Cursor', href: '#/cursor-demo', ariaLabel: 'Open target cursor demo' },        { label: 'Compare', href: '#/compare', ariaLabel: 'Compare regions' },
      ],
    },
    {
      label: 'Regions',
      bgColor: '#20293b',
      textColor: '#f8fafc',
      links: topRegions,
    },
  ];

  return (
    <CardNav
      items={items}
      baseColor="rgba(10, 12, 15, 0.96)"
      menuColor="#f8fafc"
      buttonBgColor="#f8fafc"
      buttonTextColor="#0a0c0f"
      buttonLabel="View Dashboard"
      buttonHref="#/dashboard"
      theme="dark"
      logo={
        <a href="#/" className="card-nav-brand" aria-label="SENTINEL home">
          <span className="card-nav-brand-badge">
            <Shield size={18} strokeWidth={2.2} />
          </span>
          <span className="card-nav-brand-copy">
            <GradientText
              colors={['#f8fafc', '#7dd3fc', '#c084fc', '#f8fafc']}
              animationSpeed={6}
              showBorder={false}
              className="card-nav-brand-title"
            >
              SENTINEL
            </GradientText>
            <span className="card-nav-brand-subtitle">Safety Intelligence</span>
          </span>
        </a>
      }
    />
  );
};

export const Footer: React.FC = () => {
  const lastUpdatedLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const footerLogos: LogoItem[] = [
    {
      node: <SiReact />,
      title: 'React',
      href: 'https://react.dev',
      ariaLabel: 'Open React website',
    },
    {
      node: <SiTypescript />,
      title: 'TypeScript',
      href: 'https://www.typescriptlang.org',
      ariaLabel: 'Open TypeScript website',
    },
    {
      node: <SiTailwindcss />,
      title: 'Tailwind CSS',
      href: 'https://tailwindcss.com',
      ariaLabel: 'Open Tailwind CSS website',
    },
    {
      node: <SiVite />,
      title: 'Vite',
      href: 'https://vite.dev',
      ariaLabel: 'Open Vite website',
    },
    {
      node: <SiFastapi />,
      title: 'FastAPI',
      href: 'https://fastapi.tiangolo.com',
      ariaLabel: 'Open FastAPI website',
    },
    {
      node: <SiLeaflet />,
      title: 'Leaflet',
      href: 'https://leafletjs.com',
      ariaLabel: 'Open Leaflet website',
    },
    {
      node: <SiOpenstreetmap />,
      title: 'OpenStreetMap',
      href: 'https://www.openstreetmap.org',
      ariaLabel: 'Open OpenStreetMap website',
    },
    {
      node: <Shield size={34} strokeWidth={1.8} />,
      title: 'NCRB',
      href: 'https://ncrb.gov.in',
      ariaLabel: 'Open National Crime Records Bureau website',
    },
  ];

  return (
    <footer className="bg-surface border-t border-border py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto mb-10">
        <div className="footer-logo-loop-shell">
          <LogoLoop
            logos={footerLogos}
            speed={90}
            direction="left"
            logoHeight={44}
            gap={56}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="#111418"
            ariaLabel="SENTINEL technology partners"
            className="footer-logo-loop"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-white w-6 h-6" />
            <span className="text-xl font-display font-bold text-white">SENTINEL</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
            Empowering citizens with regional safety intelligence. Our data is sourced from official National Crime Records Bureau (NCRB) publications and processed to provide actionable insights.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Resources</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><a href="#/about" className="hover:text-white transition-colors">Methodology</a></li>
            <li><a href="https://ncrb.gov.in" target="_blank" className="hover:text-white transition-colors">NCRB Official</a></li>
            <li><a href="#/data-sources" className="hover:text-white transition-colors">Data Sources</a></li>
            <li><a href="#/api-access" className="hover:text-white transition-colors">API Access</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Legal</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><a href="#/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs font-mono text-gray-600">
          &copy; 2024 SENTINEL. DATA SOURCE: NCRB, MINISTRY OF HOME AFFAIRS.
        </p>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-gray-600 uppercase">{`Last Updated: ${lastUpdatedLabel}`}</span>
          <div className="w-1 h-1 bg-gray-700 rounded-full" />
          <span className="text-[10px] font-mono text-gray-600 uppercase">v1.2.0-STABLE</span>
        </div>
      </div>
    </footer>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Shield, AlertTriangle, TrendingUp, Info, MapPin } from 'lucide-react';
import { SafetyRing, TrendChart } from '../components/Charts';
import { SafetyLevel } from '../types';
import { fetchApiJson } from '../lib/api';

interface RegionDetailProps {
  regionId: string;
}

type StateRow = {
  id: number;
  state: string;
  ipc_crimes: number;
  women_crimes: number;
  cyber_crimes: number;
  safety_score: number;
  safety_level: SafetyLevel;
};

export const RegionDetail: React.FC<RegionDetailProps> = ({ regionId }) => {
  const [data, setData] = useState<StateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchApiJson<StateRow[]>('/states')
      .then(fetched => {
        setData(fetched || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch states:', err);
        setError(err instanceof Error ? err.message : 'Unable to load region data.');
        setLoading(false);
      });
  }, []);

  const region = useMemo(() => {
    if (!data.length) return null;
    
    const normalizedRegionId = decodeURIComponent(regionId);
    const raw = data.find((state) => {
       const slug = state.state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
       return slug === normalizedRegionId || state.id.toString() === normalizedRegionId || state.state === normalizedRegionId;
    });

    if (!raw) return null;

    const baseYear = 2024;
    return {
      id: raw.id.toString(),
      name: raw.state,
      state: raw.state,
      safety_score: raw.safety_score,
      safety_level: raw.safety_level,
      ipc_rate: raw.ipc_crimes,
      violent: Math.round(raw.ipc_crimes * 0.124),
      property: Math.round(raw.ipc_crimes * 0.452),
      cyber: raw.cyber_crimes,
      women_safety: raw.women_crimes,
      economic: Math.round(raw.ipc_crimes * 0.155),
      year_data: Array.from({ length: 6 }).map((_, i) => ({
        year: baseYear - 5 + i,
        ipc_total: Math.round(raw.ipc_crimes * (1 - (5 - i) * 0.05)),
      })),
    };
  }, [data, regionId]);

  if (loading) {
    return (
      <div className="pt-32 px-6 text-center text-white">Loading region data...</div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 px-6 text-center">
        <h2 className="text-2xl font-bold text-white">Unable to load region data</h2>
        <p className="mt-4 text-sm text-gray-400">{error}</p>
        <a href="#/dashboard" className="text-safe hover:underline mt-4 inline-block">Back to Dashboard</a>
      </div>
    );
  }

  if (!region) {
    return (
      <div className="pt-32 px-6 text-center">
        <h2 className="text-2xl font-bold text-white">Region not found</h2>
        <a href="#/dashboard" className="text-safe hover:underline mt-4 inline-block">Back to Dashboard</a>
      </div>
    );
  }

  const getSafetyColor = (level: SafetyLevel) => {
    switch (level) {
      case SafetyLevel.SAFE: return 'text-safe bg-safe/10 border-safe/20';
      case SafetyLevel.MODERATE: return 'text-moderate bg-moderate/10 border-moderate/20';
      case SafetyLevel.ELEVATED: return 'text-elevated bg-elevated/10 border-elevated/20';
      case SafetyLevel.HIGH_RISK: return 'text-high-risk bg-high-risk/10 border-high-risk/20';
    }
  };

  const safetyTips = {
    [SafetyLevel.SAFE]: [
      "Maintain standard situational awareness.",
      "Keep emergency contacts saved.",
      "Report any suspicious activity to local authorities."
    ],
    [SafetyLevel.MODERATE]: [
      "Avoid poorly lit areas at night.",
      "Secure your property with basic security systems.",
      "Be cautious with personal information in public spaces."
    ],
    [SafetyLevel.ELEVATED]: [
      "Avoid traveling alone in unfamiliar areas after dark.",
      "Install advanced security systems at home/business.",
      "Stay updated with local safety alerts and news."
    ],
    [SafetyLevel.HIGH_RISK]: [
      "Exercise extreme caution in public spaces.",
      "Strictly avoid known high-crime zones.",
      "Ensure all property is heavily secured and monitored.",
      "Consider professional security services for high-value assets."
    ]
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 mb-8">
        <a href="#/dashboard" className="hover:text-white transition-colors">Dashboard</a>
        <ChevronLeft className="w-3 h-3 rotate-180" />
        <span className="text-white">{region.name}</span>
      </nav>

      {/* Hero Card */}
      <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-safe/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          <SafetyRing score={region.safety_score} size={220} strokeWidth={16} />
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-white">{region.name}</h1>
              <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${getSafetyColor(region.safety_level)}`}>
                {region.safety_level}
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-mono text-sm mb-8">
              <MapPin className="w-4 h-4" />
              {region.state}, India
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'IPC Rate', value: region.ipc_rate },
                { label: 'Violent', value: region.violent.toLocaleString() },
                { label: 'Property', value: region.property.toLocaleString() },
                { label: 'Cyber', value: region.cyber.toLocaleString() }
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Breakdown */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Crime Breakdown</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Violent Crimes', value: region.violent, rate: '12.4', icon: AlertTriangle, color: 'text-high-risk' },
                { label: 'Property Theft', value: region.property, rate: '45.2', icon: Shield, color: 'text-elevated' },
                { label: 'Cyber Crimes', value: region.cyber, rate: '8.1', icon: TrendingUp, color: 'text-moderate' },
                { label: 'Women Safety', value: region.women_safety, rate: '92.0', icon: Shield, color: 'text-safe' },
                { label: 'Economic Offenses', value: region.economic, rate: '15.5', icon: Info, color: 'text-gray-400' }
              ].map((item) => (
                <div key={item.label} className="bg-surface border border-border p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="font-bold text-white">{item.label}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-500">RATE: {item.rate}</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-4">{item.value.toLocaleString()}</div>
                  <div className="h-1.5 bg-card rounded-full overflow-hidden">
                    <div className={`h-full bg-white/20`} style={{ width: '65%' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trends */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">6-Year Safety Trend</h2>
            </div>
            
            <div className="bg-surface border border-border p-8 rounded-3xl">
              <TrendChart 
                data={region.year_data.map(d => ({ year: d.year, value: d.ipc_total }))}
                color="#22c55e"
                height={300}
              />
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                {[
                  { label: 'IPC Total', color: 'bg-safe' },
                  { label: 'Violent', color: 'bg-high-risk' },
                  { label: 'Property', color: 'bg-elevated' }
                ].map((l) => (
                  <div key={l.label} className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${l.color}`} />
                    <span className="text-[10px] font-mono text-gray-500 uppercase">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-surface border border-border p-8 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-safe" />
              Safety Recommendations
            </h3>
            <ul className="space-y-4">
              {safetyTips[region.safety_level].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 bg-safe rounded-full shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-4">Compare Safety</h3>
            <p className="text-sm text-gray-500 mb-6">See how {region.name} stacks up against other regions in India.</p>
            <a 
              href={`#/compare?stateA=${encodeURIComponent(region.state)}`}
              className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Compare with Another
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

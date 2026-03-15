import React from 'react';
import { ArrowRight, Shield, Search, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import GradientText from '../components/GradientText';
import SpotlightCard from '../components/SpotlightCard';

export const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      
      {/* Animated Particles (CSS only for simplicity) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white/10 rounded-full blur-xl animate-pulse"
            style={{
              width: Math.random() * 100 + 50 + 'px',
              height: Math.random() * 100 + 50 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 5 + 's'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
            <Shield className="w-4 h-4 text-safe" />
            <span className="text-xs font-mono uppercase tracking-widest text-gray-400">Trusted Safety Intelligence</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-8 leading-[0.9] tracking-tight">
            Know Your Area.<br />
            <GradientText
              colors={['#5227FF', '#FF9FFC', '#B19EEF', '#00ffff']}
              animationSpeed={5}
              showBorder={false}
              className="inline-block"
            >
              Stay Informed.
            </GradientText>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Access real-time crime statistics, safety trends, and regional intelligence powered by the National Crime Records Bureau.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href="#/dashboard"
              className="group relative px-8 py-4 bg-white text-bg font-bold rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Safety Data
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
            <a 
              href="#/about"
              className="px-8 py-4 bg-surface border border-border text-white font-bold rounded-xl hover:bg-card transition-all"
            >
              Learn Methodology
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: Search, title: 'Search Regions', desc: 'Find safety scores for any major Indian city or district.' },
            { icon: Activity, title: 'Compare Areas', desc: 'Side-by-side analysis of crime rates and safety metrics.' },
            { icon: TrendingUp, title: 'View Trends', desc: 'Visualize 6-year crime data trends with interactive charts.' }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="group"
            >
              <SpotlightCard
                className="h-full rounded-2xl border border-border bg-surface p-8 text-left transition-colors hover:border-gray-700"
                spotlightColor="rgba(0, 229, 255, 0.18)"
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-bg transition-all">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

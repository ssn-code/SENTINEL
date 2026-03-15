import React from 'react';
import { useHashRoute } from './hooks/useHashRoute';
import { Navbar, Footer } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { MapIntel } from './pages/MapIntel';
import { RegionDetail } from './pages/RegionDetail';
import { Compare } from './pages/Compare';
import { About } from './pages/About';
import { DataSources } from './pages/DataSources';
import { ApiAccess } from './pages/ApiAccess';
import { CrimeChatbot } from './components/CrimeChatbot';

export default function App() {
  const { hash } = useHashRoute();

  const renderPage = () => {
    const [path] = hash.split('?');
    
    if (path === '#/') return <Home />;
    if (path === '#/dashboard') return <Dashboard />;
    if (path === '#/map') return <MapIntel />;
    if (path === '#/data-sources') return <DataSources />;
    if (path === '#/api-access') return <ApiAccess />;
    if (path.startsWith('#/region/')) {
      const id = path.replace('#/region/', '');
      return <RegionDetail regionId={id} />;
    }
    if (path === '#/compare') return <Compare />;
    if (path === '#/about') return <About />;
    
    return <Home />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
      <CrimeChatbot />
    </div>
  );
}

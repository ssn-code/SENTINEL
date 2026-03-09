import React from 'react';
import Hyperspeed from './components/Hyperspeed';
import GradientText from './components/GradientText';
import { hyperspeedPresets } from './components/hyperspeedPresets';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* The background animation */}
      <div className="hyperspeed-container">
        <Hyperspeed effectOptions={hyperspeedPresets.one} />
      </div>

      {/* Content Overlay */}
      <div className="content-overlay">
        {/* SECURE SPHERE AT THE TOP */}
        <div className="top-header">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={3}
            showBorder={false}
            className="big-logo-text"
          >
            Secure Sphere
          </GradientText>
        </div>
        </div>
    </div>
  );
}

export default App;
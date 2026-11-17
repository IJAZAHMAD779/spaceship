import { useState } from 'react';
import { motion } from 'framer-motion';
import { soundscape } from '../utils/soundscape';

export default function HeroAct({ onNavigate, onApplyPreset }) {
  const [targetOrbit, setTargetOrbit] = useState('corona');
  const [windowDate, setWindowDate] = useState('2026-11-14');
  const [crewCount, setCrewCount] = useState(1);

  const handleLaunchSearch = (e) => {
    e.preventDefault();
    soundscape.tick(960);
    onApplyPreset({ destination: targetOrbit, launchWindow: windowDate, guests: crewCount });
    onNavigate('clearance');
  };

  return (
    <section id="hero" className="act hero-act">
      <svg
        className="orbital-rings-bg"
        viewBox="0 0 1200 900"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="600" cy="540" r="240" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <circle cx="600" cy="540" r="360" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 5" />
        <circle cx="600" cy="540" r="490" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
        <circle cx="600" cy="540" r="630" stroke="rgba(56,189,248,0.06)" strokeWidth="1" />
      </svg>

      {/* LAYER 1: Solid giant monumental display behind 3D Astronaut */}
      <div className="hero-wordmark-back" aria-hidden="true">
        <span>ASTRAL-5</span>
      </div>

      {/* LAYER 3: Hollow stroke echo in front of 3D Astronaut */}
      <div className="hero-wordmark-front" aria-hidden="true">
        <span>ASTRAL-5</span>
      </div>

      <div className="hero-foreground">
        <motion.div
          className="hero-subline"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <p className="hero-tagline">
            LEO to <em className="serif-italic">0.046 AU</em> perihelion.
          </p>
          <span className="hero-coord-tag">NASA 3D // 692,000 KM/H SOLAR FLYBY</span>
        </motion.div>

        <motion.button
          type="button"
          className="horizon-cta-pill"
          onClick={() => {
            soundscape.tick(880);
            onNavigate('orbiter');
          }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>Inspect Probe</span>
          <span aria-hidden="true">↗</span>
        </motion.button>

        <motion.form
          className="launch-bar"
          onSubmit={handleLaunchSearch}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42 }}
        >
          <div className="launch-bar-cell">
            <label htmlFor="hb-origin">ORIGIN</label>
            <input id="hb-origin" type="text" value="LEO 408 KM" readOnly />
          </div>

          <div className="launch-bar-cell">
            <label htmlFor="hb-dest">TARGET</label>
            <select
              id="hb-dest"
              value={targetOrbit}
              onChange={(e) => setTargetOrbit(e.target.value)}
            >
              <option value="corona">Corona · 0.046 AU</option>
              <option value="alfven">EUV Belt · 0.054 AU</option>
              <option value="mercury">Cis-Lunar · 384,400 km</option>
            </select>
          </div>

          <div className="launch-bar-cell">
            <label htmlFor="hb-window">WINDOW</label>
            <select
              id="hb-window"
              value={windowDate}
              onChange={(e) => setWindowDate(e.target.value)}
            >
              <option value="2026-11-14">2026-11-14</option>
              <option value="2027-03-22">2027-03-22</option>
              <option value="2027-08-10">2027-08-10</option>
            </select>
          </div>

          <div className="launch-bar-cell">
            <label htmlFor="hb-crew">BERTHS</label>
            <select
              id="hb-crew"
              value={crewCount}
              onChange={(e) => setCrewCount(Number(e.target.value))}
            >
              <option value={1}>01 Berth</option>
              <option value={2}>02 Berths</option>
              <option value={4}>04 Berths</option>
            </select>
          </div>

          <button type="submit" className="launch-bar-submit">
            Manifest →
          </button>
        </motion.form>
      </div>
    </section>
  );
}

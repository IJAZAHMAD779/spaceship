import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioEngine } from '../utils/audioEngine';

const NAV_ITEMS = [
  { id: 'overview', label: '01 Overview' },
  { id: 'engineering', label: '02 Systems' },
  { id: 'missions', label: '03 Missions' },
  { id: 'archives', label: '04 Archives' },
  { id: 'clearance', label: '05 Clearance' },
];

export default function HudChrome({ activeSection, onNavigate, telemetryRefs }) {
  const [audioOn, setAudioOn] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAudioToggle = () => {
    const next = audioEngine.toggle();
    setAudioOn(next);
  };

  const handleJump = (id) => {
    audioEngine.playClick(760);
    setDrawerOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header className="hud-header">
        <div className="hud-header-inner">
          <a
            href="#overview"
            className="brand-mark"
            onClick={(e) => {
              e.preventDefault();
              handleJump('overview');
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polygon
                points="12,2 21,19 12,15 3,19"
                stroke="#F59E0B"
                strokeWidth="1.6"
                fill="rgba(245,158,11,0.12)"
              />
              <circle cx="12" cy="11" r="1.8" fill="#38BDF8" />
            </svg>
            <span className="brand-code">AC-5000</span>
            <span className="brand-name">ASTRAL CRUISER</span>
          </a>

          <nav className="hud-nav" aria-label="Mission Chapters">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleJump(item.id)}
                  className={`hud-nav-btn ${isActive ? 'is-active' : ''}`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-underline"
                      className="hud-nav-indicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hud-controls">
            <button
              type="button"
              onClick={handleAudioToggle}
              aria-pressed={audioOn}
              className={`audio-btn ${audioOn ? 'is-live' : ''}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {audioOn ? (
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                ) : (
                  <line x1="22" y1="9" x2="16" y2="15" />
                )}
              </svg>
              <span>{audioOn ? 'AUDIO: LIVE' : 'AUDIO: OFF'}</span>
            </button>

            <button
              type="button"
              className="drawer-toggle"
              aria-label="Toggle chapter menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                {drawerOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Live Scroll-Coupled Physics Telemetry Strip */}
        <div className="telemetry-strip" aria-label="Live Orbital Telemetry">
          <div className="telemetry-strip-inner">
            <div className="tel-cell">
              <span className="tel-lbl">HELIOCENTRIC DIST</span>
              <span className="tel-val" ref={telemetryRefs.distRef}>1.000 AU</span>
            </div>
            <div className="tel-cell">
              <span className="tel-lbl">SOLAR FLUX</span>
              <span className="tel-val is-amber" ref={telemetryRefs.fluxRef}>1.36 kW/m²</span>
            </div>
            <div className="tel-cell">
              <span className="tel-lbl">SHIELD TEMP</span>
              <span className="tel-val" ref={telemetryRefs.tempRef}>118 °C</span>
            </div>
            <div className="tel-cell">
              <span className="tel-lbl">ORBITAL VEL</span>
              <span className="tel-val is-cyan" ref={telemetryRefs.velRef}>7.7 km/s</span>
            </div>
            <div className="tel-progress-track" aria-hidden="true">
              <div className="tel-progress-fill" ref={telemetryRefs.progressBarRef} />
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mobile-drawer-links">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleJump(item.id)}
                  className={`mobile-nav-btn ${activeSection === item.id ? 'is-active' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

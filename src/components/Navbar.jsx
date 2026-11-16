import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundscape } from '../utils/soundscape';

const LINKS = [
  { id: 'hero', label: 'Overview' },
  { id: 'orbiter', label: 'Orbiter' },
  { id: 'journeys', label: 'Journeys' },
  { id: 'archives', label: 'Archives' },
  { id: 'clearance', label: 'Clearance' },
];

export default function Navbar({ activeAct, onNavigate, telemetryRefs }) {
  const [soundOn, setSoundOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleSound = () => {
    const next = soundscape.toggle();
    setSoundOn(next);
  };

  const jump = (id) => {
    soundscape.tick(780);
    setMenuOpen(false);
    onNavigate(id);
  };

  return (
    <>
      <header className="top-nav">
        <div className="top-nav-inner">
          <a
            href="#hero"
            className="nav-brand"
            onClick={(e) => {
              e.preventDefault();
              jump('hero');
            }}
          >
            astral<span className="brand-dot">.</span>
          </a>

          <nav className="nav-center" aria-label="Primary Navigation">
            {LINKS.map((link) => {
              const active = activeAct === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => jump(link.id)}
                  className={`nav-link-item ${active ? 'is-active' : ''}`}
                >
                  <span>{link.label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-pill-dot"
                      className="nav-active-dot"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="nav-right">
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              className={`sound-pill ${soundOn ? 'is-on' : ''}`}
            >
              <span className="sound-bars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>{soundOn ? 'Audio On' : 'Audio'}</span>
            </button>

            <button
              type="button"
              className="reserve-pill"
              onClick={() => jump('clearance')}
            >
              <span>Reserve</span>
              <span aria-hidden="true">↗</span>
            </button>

            <button
              type="button"
              className="mobile-menu-btn"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      {/* Discreet live orbital telemetry readout floating bottom-right */}
      <aside className="floating-telemetry" aria-label="Live Orbital Telemetry">
        <div className="ft-row">
          <span className="ft-lbl">DIST</span>
          <span className="ft-val" ref={telemetryRefs.distRef}>1.000 AU</span>
        </div>
        <div className="ft-row">
          <span className="ft-lbl">FLUX</span>
          <span className="ft-val is-solar" ref={telemetryRefs.fluxRef}>1.36 kW/m²</span>
        </div>
        <div className="ft-row">
          <span className="ft-lbl">VEL</span>
          <span className="ft-val is-cyan" ref={telemetryRefs.velRef}>7.7 km/s</span>
        </div>
        <div className="ft-bar">
          <div className="ft-bar-fill" ref={telemetryRefs.progressRef} />
        </div>
      </aside>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-nav-sheet"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => jump(link.id)}
                className={`mobile-sheet-link ${activeAct === link.id ? 'is-active' : ''}`}
              >
                {link.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

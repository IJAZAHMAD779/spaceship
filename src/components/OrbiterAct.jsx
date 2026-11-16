import { motion, AnimatePresence } from 'framer-motion';
import { VESSEL_MODULES } from '../data/programData';
import { soundscape } from '../utils/soundscape';

export default function OrbiterAct({ pinRef, activeModule, onSelectModule, explodeAmount }) {
  const current = VESSEL_MODULES.find((m) => m.id === activeModule) || VESSEL_MODULES[0];

  return (
    <section id="orbiter" className="act orbiter-act">
      <div ref={pinRef} className="orbiter-pin-stage">
        {/* Concentric orbital radar circles & dots behind the 3D craft (Image 4 ORBITA-1) */}
        <svg className="orbiter-reticle-svg" viewBox="0 0 1200 800" fill="none" aria-hidden="true">
          <circle cx="600" cy="400" r="190" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
          <circle cx="600" cy="400" r="285" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 6" />
          <circle cx="600" cy="400" r="380" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <circle cx="600" cy="115" r="5" fill="#F8FAFC" />
          <circle cx="755" cy="155" r="4" fill="#38BDF8" />
          <circle cx="430" cy="210" r="3.5" fill="#F59E0B" />
        </svg>

        {/* LAYER 1: Giant AC-5000 typography behind the 3D vessel */}
        <div className="orbiter-bg-word" aria-hidden="true">
          <span>AC-5000</span>
        </div>

        {/* LAYER 4: Floating top-left title & top-right micro-specs (zero boxes) */}
        <div className="orbiter-hud-frame">
          <div className="orbiter-top-row">
            <div className="orbiter-title-block">
              <span className="eyebrow-micro">SOLAR EXPLORATION FLAGSHIP // SEPARATION {Math.round(explodeAmount * 100)}%</span>
              <h2>AC-5000 ORBITER</h2>
            </div>

            <dl className="orbiter-spec-column">
              {current.telemetry.map((row) => (
                <div key={row.label} className="orbiter-spec-line">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="orbiter-bottom-row">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="orbiter-module-caption"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <span className="eyebrow-micro cyan">{current.tag}</span>
                <h3>
                  {current.code} — {current.name}
                </h3>
                <p>{current.description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="module-switcher" role="tablist" aria-label="Orbiter Subsystems">
              {VESSEL_MODULES.map((mod) => {
                const selected = mod.id === activeModule;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      soundscape.tick(920);
                      onSelectModule(mod.id);
                    }}
                    className={`module-chip ${selected ? 'is-selected' : ''}`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="module-chip-bg"
                        className="module-chip-bg"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    )}
                    <span className="module-chip-text">
                      <em>{mod.code}</em> {mod.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

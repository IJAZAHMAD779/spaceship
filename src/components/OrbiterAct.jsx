import { motion } from 'framer-motion';
import { VESSEL_MODULES } from '../data/programData';
import { soundscape } from '../utils/soundscape';

export default function OrbiterAct({ activeModule, onSelectModule }) {
  const current = VESSEL_MODULES.find((m) => m.id === activeModule) || VESSEL_MODULES[0];

  return (
    <section id="orbiter" className="act orbiter-act">
      <div className="orbiter-pin-stage">
        <svg className="orbiter-reticle-svg" viewBox="0 0 1200 760" fill="none" aria-hidden="true">
          <circle cx="600" cy="380" r="150" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle
            cx="600"
            cy="380"
            r="260"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <circle cx="600" cy="380" r="370" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <line x1="210" y1="380" x2="990" y2="380" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1="600" y1="20" x2="600" y2="740" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </svg>

        <div className="orbiter-bg-word" aria-hidden="true">
          <span>PARKER</span>
        </div>

        <div className="orbiter-hud-frame">
          <div className="orbiter-top-row">
            <div className="orbiter-title-block">
              <span className="eyebrow-micro cyan">02 // ARCHITECTURE</span>
              <h2>
                Parker <em className="serif-italic">Probe.</em>
              </h2>
            </div>

            <dl className="orbiter-spec-column" aria-live="polite">
              {current.specs.map((spec) => (
                <div key={spec.key} className="orbiter-spec-line">
                  <dt>{spec.key}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="orbiter-bottom-row">
            <div className="orbiter-module-caption">
              <span className="eyebrow-micro solar">{current.tag}</span>
              <h3>{current.title}</h3>
              <p>{current.summary}</p>
            </div>

            <div className="module-switcher" role="tablist" aria-label="Spacecraft subsystems">
              {VESSEL_MODULES.map((m) => {
                const selected = m.id === activeModule;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      soundscape.tick(860);
                      onSelectModule(m.id);
                    }}
                    className={`module-chip ${selected ? 'is-selected' : ''}`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="orbiter-chip-bg"
                        className="module-chip-bg"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    )}
                    <span className="module-chip-text">
                      <em>{m.code}</em> {m.label}
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

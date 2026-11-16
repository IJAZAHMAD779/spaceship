import { motion, AnimatePresence } from 'framer-motion';
import { SUBSYSTEMS, FLEET_COMPARISON } from '../data/missionData';
import { audioEngine } from '../utils/audioEngine';

export default function EngineeringChapter({
  pinRef,
  activeSubsystem,
  onSelectSubsystem,
  explodeAmount,
}) {
  const current = SUBSYSTEMS.find((s) => s.id === activeSubsystem) || SUBSYSTEMS[0];

  return (
    <section id="engineering" className="chapter engineering-chapter">
      {/* Pinned 3D Inspection Stage */}
      <div ref={pinRef} className="engineering-pin-stage">
        <div className="container engineering-grid">
          <div className="engineering-left">
            <div className="section-kicker">
              <span className="mono-tag">CHAPTER 02 // VESSEL ARCHITECTURE</span>
              <span className="mono-tag muted">
                ASSEMBLY SEPARATION: {Math.round(explodeAmount * 100)}%
              </span>
            </div>

            <h2 className="section-heading">Exploded Subsystem Inspector</h2>
            <p className="section-lead">
              Scroll to separate the live 3D AC-5000 airframe along its longitudinal axis, or select
              any assembly below to lock the camera telemetry frame.
            </p>

            {/* Accessible Subsystem Buttons */}
            <div className="subsystem-tabs" role="tablist" aria-label="Vessel Subsystems">
              {SUBSYSTEMS.map((sys) => {
                const selected = sys.id === activeSubsystem;
                return (
                  <button
                    key={sys.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      audioEngine.playClick(980);
                      onSelectSubsystem(sys.id);
                    }}
                    className={`subsystem-tab ${selected ? 'is-selected' : ''}`}
                  >
                    <span className="tab-code">{sys.code}</span>
                    <span className="tab-title">{sys.shortName}</span>
                    {selected && (
                      <motion.span
                        layoutId="subsystem-active-bar"
                        className="tab-active-bar"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Subsystem Readout Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="subsystem-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <div className="subsystem-status-row">
                  <span className="mono-tag amber">{current.code}</span>
                  <span className="mono-tag cyan">{current.status}</span>
                </div>
                <h3>{current.name}</h3>
                <p>{current.summary}</p>
                <dl className="subsystem-specs">
                  {current.specs.map((sp) => (
                    <div key={sp.label} className="subsystem-spec-item">
                      <dt>{sp.label}</dt>
                      <dd>{sp.value}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right column stays open so the 3D Three.js spacecraft occupies the viewport */}
          <div className="engineering-viewport-window" aria-hidden="true">
            <div className="viewport-reticle">
              <span className="reticle-corner tl" />
              <span className="reticle-corner tr" />
              <span className="reticle-corner bl" />
              <span className="reticle-corner br" />
              <div className="reticle-label">
                <span>LOCK // {current.code}</span>
                <span>{current.shortName.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Evolution Matrix */}
      <div className="container fleet-matrix-wrap">
        <div className="matrix-header">
          <span className="mono-tag">AIRFRAME LINEAGE // 2020–2026</span>
          <h3>Solar-Class Fleet Progression</h3>
        </div>
        <div className="table-scroll">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Model Class</th>
                <th>Commissioned</th>
                <th>Perihelion</th>
                <th>Shield Rating</th>
                <th>Complement</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {FLEET_COMPARISON.map((row) => (
                <tr key={row.model} className={row.active ? 'is-flagship' : ''}>
                  <td className="model-cell">{row.model}</td>
                  <td className="mono">{row.year}</td>
                  <td className="mono">{row.perihelion}</td>
                  <td className="mono">{row.thermalLimit}</td>
                  <td className="mono">{row.complement}</td>
                  <td>
                    <span className={`table-pill ${row.active ? 'is-amber' : ''}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

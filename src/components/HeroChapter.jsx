import { motion } from 'framer-motion';
import { audioEngine } from '../utils/audioEngine';

export default function HeroChapter({ onNavigate }) {
  return (
    <section id="overview" className="chapter hero-chapter">
      <div className="container hero-layout">
        <motion.div
          className="hero-editorial"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="eyebrow-row">
            <span className="status-dot" aria-hidden="true" />
            <span className="mono-tag">HELIOS-6 // ORBITAL TELEMETRY ACTIVE</span>
          </div>

          <h1 className="hero-heading">
            Into the Solar
            <br />
            Alfvén Boundary.
          </h1>

          <p className="hero-copy">
            Astral Cruiser 5000 (AC-5000) is a crewed solar-corona research vessel engineered to
            descend to <strong>0.038 AU</strong>—withstanding 942.5 kW/m² of irradiance behind an
            11.4 cm carbon-iridium thermal shield.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn-solid"
              onClick={() => {
                audioEngine.playClick(920);
                onNavigate('engineering');
              }}
            >
              <span>Inspect 3D Vessel</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                audioEngine.playClick(780);
                onNavigate('clearance');
              }}
            >
              Request Flight Clearance
            </button>
          </div>

          <dl className="hero-spec-strip">
            <div className="spec-datum">
              <dt>PERIHELION</dt>
              <dd>0.038 AU</dd>
            </div>
            <div className="spec-datum">
              <dt>PEAK FLUX</dt>
              <dd>942.5 kW/m²</dd>
            </div>
            <div className="spec-datum">
              <dt>DELTA-V</dt>
              <dd>142.4 km/s</dd>
            </div>
            <div className="spec-datum">
              <dt>EXPEDITIONS</dt>
              <dd>06 FLIGHTS</dd>
            </div>
          </dl>
        </motion.div>

        <div className="hero-spacer" aria-hidden="true">
          <div className="scroll-cue">
            <span className="mono-tag">SCROLL TO DESCEND</span>
            <span className="scroll-line" />
          </div>
        </div>
      </div>
    </section>
  );
}

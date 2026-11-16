import { motion } from 'framer-motion';
import { DESTINATIONS, CHRONICLES } from '../data/programData';
import { soundscape } from '../utils/soundscape';

export default function JourneysAct({
  chronicleSectionRef,
  chronicleTrackRef,
  onSelectDestination,
}) {
  return (
    <section id="journeys" className="act journeys-act">
      {/* 3 Destination Spheres (Image 3 ORION "Journeys Beyond" inspiration) */}
      <div className="container destinations-block">
        <div className="centered-heading">
          <span className="eyebrow-micro solar">CORONA APPROACH PROFILES</span>
          <h2>Journeys Beyond</h2>
          <p>
            Select an orbital insertion profile to configure mission clearance and explore our
            six sequential Helios solar dives.
          </p>
        </div>

        <div className="destination-cards">
          {DESTINATIONS.map((dest, idx) => (
            <motion.button
              key={dest.id}
              type="button"
              onClick={() => {
                soundscape.tick(900);
                onSelectDestination(dest);
              }}
              className={`dest-card dest-${dest.accent}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
            >
              <div className="dest-orb-stage" aria-hidden="true">
                <div className={`dest-orb orb-${dest.accent}`} />
              </div>
              <div className="dest-horizon-glow" aria-hidden="true" />
              <div className="dest-card-body">
                <span className="eyebrow-micro">{dest.code} // {dest.duration}</span>
                <h3>{dest.name}</h3>
                <p>{dest.summary}</p>
                <div className="dest-card-foot">
                  <span>{dest.temp}</span>
                  <span>Select Profile ↗</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Horizontal Pinned Helios-1 -> Helios-6 Chronicle */}
      <div ref={chronicleSectionRef} className="chronicle-pin-wrap">
        <div className="container chronicle-head">
          <span className="eyebrow-micro cyan">FLIGHT LOG // HELIOS-1 TO HELIOS-6</span>
          <h2>The Solar Descent Chronicle</h2>
        </div>

        <div className="chronicle-viewport">
          <div ref={chronicleTrackRef} className="chronicle-track">
            {CHRONICLES.map((item) => (
              <article key={item.code} className="chronicle-slide">
                <div className="chronicle-num">{item.num}</div>
                <div className="chronicle-meta">
                  <span className="eyebrow-micro solar">{item.code}</span>
                  <span className="eyebrow-micro muted">{item.date}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <dl className="chronicle-stats">
                  <div>
                    <dt>PERIHELION</dt>
                    <dd>{item.perihelion}</dd>
                  </div>
                  <div>
                    <dt>PEAK VEL</dt>
                    <dd>{item.velocity}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

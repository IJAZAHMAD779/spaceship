import { motion } from 'framer-motion';
import { DESTINATIONS, CHRONICLES } from '../data/programData';
import { soundscape } from '../utils/soundscape';

export default function JourneysAct({ onJumpToClearance }) {
  return (
    <section id="journeys" className="act journeys-act">
      <div className="container destinations-block">
        <div className="centered-heading">
          <span className="eyebrow-micro solar">03 // CORRIDORS</span>
          <h2>
            Beyond <em className="serif-italic">Orbit.</em>
          </h2>
        </div>

        <div className="destination-cards">
          {DESTINATIONS.map((dest) => (
            <motion.button
              key={dest.id}
              type="button"
              className={`dest-card ${dest.toneClass}`}
              onClick={() => {
                soundscape.tick(920);
                onJumpToClearance(dest.id);
              }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <div className="dest-orb-stage">
                <div className="dest-orb-real">
                  <img
                    src={dest.image}
                    alt={`${dest.name} NASA optical view`}
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="dest-card-body">
                <span className="eyebrow-micro">{dest.eyebrow}</span>
                <h3>{dest.name}</h3>
                <p>{dest.summary}</p>
                <div className="dest-card-foot">
                  <span>{dest.distance}</span>
                  <span>{dest.duration}</span>
                </div>
              </div>

              <div className="dest-horizon-glow" aria-hidden="true" />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="chronicle-pin-wrap">
        <div className="container chronicle-head">
          <span className="eyebrow-micro cyan">FLIGHT LOG // 2018 — 2026</span>
          <h2>
            Mission <em className="serif-italic">Chronicles.</em>
          </h2>
        </div>

        <div className="chronicle-viewport">
          <div className="chronicle-track">
            {CHRONICLES.map((item) => (
              <article key={item.num} className="chronicle-slide">
                <div className="chronicle-num">{item.num}</div>
                <div className="chronicle-meta">
                  <span className="eyebrow-micro solar">{item.mission}</span>
                  <span className="eyebrow-micro muted">{item.year}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <dl className="chronicle-stats">
                  {item.stats.map((st) => (
                    <div key={st.label}>
                      <dt>{st.label}</dt>
                      <dd>{st.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

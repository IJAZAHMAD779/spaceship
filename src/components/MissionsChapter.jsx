import { MISSIONS } from '../data/missionData';

export default function MissionsChapter({ sectionRef, trackRef }) {
  return (
    <section id="missions" ref={sectionRef} className="chapter missions-chapter">
      <div className="container missions-header">
        <span className="mono-tag">CHAPTER 03 // CORONA PASSAGE LOG</span>
        <h2 className="section-heading">Helios-1 through Helios-6</h2>
        <p className="section-lead">
          Six sequential orbital campaigns descending from Mercury’s aphelion into the Sun’s
          magnetically dominated corona—coupled live to the 3D perihelion dive.
        </p>
      </div>

      <div className="missions-track-viewport">
        <div ref={trackRef} className="missions-track">
          {MISSIONS.map((mission, idx) => (
            <article key={mission.id} className="mission-card">
              <div className="mission-card-top">
                <span className="mono-tag muted">0{idx + 1} // {mission.code}</span>
                <span
                  className={`mission-outcome ${
                    mission.outcome === 'IN FLIGHT' ? 'is-live' : ''
                  }`}
                >
                  {mission.outcome}
                </span>
              </div>

              <div className="mission-date">{mission.date}</div>
              <h3>{mission.name}</h3>
              <p>{mission.summary}</p>

              <dl className="mission-telemetry">
                <div>
                  <dt>PERIHELION</dt>
                  <dd>{mission.perihelion}</dd>
                </div>
                <div>
                  <dt>PEAK VELOCITY</dt>
                  <dd>{mission.velocity}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CABIN_TIERS, DESTINATIONS } from '../data/programData';
import { soundscape } from '../utils/soundscape';

const PASS_PREFIX = 'AST5';

export default function FinaleAct({ preset, onNavigate }) {
  const [destination, setDestination] = useState(preset.destination || 'corona');
  const [tier, setTier] = useState('specialist');
  const [launchWindow, setLaunchWindow] = useState(preset.launchWindow || '2026-11-14');
  const [guests, setGuests] = useState(preset.guests || 1);
  const [name, setName] = useState('Commander Aria Vance');
  const [email, setEmail] = useState('aria.vance@astral-program.io');
  const [manifestId, setManifestId] = useState('AST5-9042-C');
  const [confirmed, setConfirmed] = useState(false);
  const [newsletter, setNewsletter] = useState('');
  const [newsletterSent, setNewsletterSent] = useState(false);

  useEffect(() => {
    if (preset.destination) setDestination(preset.destination);
    if (preset.launchWindow) setLaunchWindow(preset.launchWindow);
    if (preset.guests) setGuests(preset.guests);
  }, [preset]);

  const activeDest = DESTINATIONS.find((d) => d.id === destination) || DESTINATIONS[0];
  const activeTier = CABIN_TIERS.find((t) => t.id === tier) || CABIN_TIERS[1];
  const totalRate = activeTier.rate * guests;

  const handleSubmit = (e) => {
    e.preventDefault();
    soundscape.tick(1040);
    setManifestId(`${PASS_PREFIX}-${Math.floor(1000 + Math.random() * 8999)}-C`);
    setConfirmed(true);
  };

  return (
    <section id="clearance" className="act finale-act">
      <div className="container finale-inner">
        <div className="finale-banner">
          <div className="finale-headline-col">
            <span className="eyebrow-micro solar">FINAL HORIZON // FLIGHT CLEARANCE</span>
            <h2>
              We make deep space
              <br />
              reachable.
            </h2>
            <p>
              Reserve an Astral telemetry berth for the next perihelion window and generate your
              flight-deck manifest directly below.
            </p>
          </div>

          <div className="finale-cta-col">
            <button
              type="button"
              className="finale-btn-white"
              onClick={() => {
                soundscape.tick(900);
                document.getElementById('clearance-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Generate Pass</span>
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="finale-btn-ghost"
              onClick={() => {
                soundscape.tick(760);
                onNavigate('hero');
              }}
            >
              <span>Return To Orbit</span>
              <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>

        <div className="clearance-split">
          <form id="clearance-form" className="clearance-form" onSubmit={handleSubmit}>
            <div className="cf-row">
              <div className="cf-field">
                <label htmlFor="cf-name">Passenger / Crew Lead</label>
                <input
                  id="cf-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setConfirmed(false);
                  }}
                />
              </div>

              <div className="cf-field">
                <label htmlFor="cf-email">Telemetry Dispatch</label>
                <input
                  id="cf-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setConfirmed(false);
                  }}
                />
              </div>
            </div>

            <div className="cf-row three">
              <div className="cf-field">
                <label htmlFor="cf-dest">Target Corridor</label>
                <select
                  id="cf-dest"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setConfirmed(false);
                  }}
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.distance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="cf-field">
                <label htmlFor="cf-window">Launch Window</label>
                <select
                  id="cf-window"
                  value={launchWindow}
                  onChange={(e) => {
                    setLaunchWindow(e.target.value);
                    setConfirmed(false);
                  }}
                >
                  <option value="2026-11-14">2026-11-14 · KSC-39A</option>
                  <option value="2027-03-22">2027-03-22 · KSC-39A</option>
                  <option value="2027-08-10">2027-08-10 · VAFB-4E</option>
                </select>
              </div>

              <div className="cf-field">
                <label htmlFor="cf-guests">Berths</label>
                <select
                  id="cf-guests"
                  value={guests}
                  onChange={(e) => {
                    setGuests(Number(e.target.value));
                    setConfirmed(false);
                  }}
                >
                  <option value={1}>1 Berth</option>
                  <option value={2}>2 Berths</option>
                  <option value={4}>4 Berths</option>
                </select>
              </div>
            </div>

            <div className="cf-field">
              <span className="cf-label">Cabin Tier</span>
              <div className="cf-tiers">
                {CABIN_TIERS.map((t) => {
                  const active = t.id === tier;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        soundscape.tick(820);
                        setTier(t.id);
                        setConfirmed(false);
                      }}
                      className={`cf-tier-btn ${active ? 'is-active' : ''}`}
                    >
                      {active && (
                        <motion.span
                          layoutId="cf-tier-ring"
                          className="cf-tier-ring"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}
                      <div className="cf-tier-content">
                        <strong>{t.name}</strong>
                        <span>${(t.rate / 1000).toFixed(0)}k / berth</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="cf-submit-row">
              <div>
                <span className="eyebrow-micro muted">ESTIMATED ALLOCATION</span>
                <div className="cf-total">${totalRate.toLocaleString()}</div>
              </div>
              <button type="submit" className="finale-btn-white">
                Issue Flight Clearance
              </button>
            </div>
          </form>

          <aside className="pass-sheet" aria-live="polite">
            <div className="pass-top">
              <div>
                <span className="eyebrow-micro solar">
                  {confirmed ? 'CLEARED FOR PERIHELION' : 'AWAITING MANIFEST'}
                </span>
                <h3>ASTRAL-5 BOARDING PASS</h3>
              </div>
              <span className="pass-flight">{manifestId}</span>
            </div>

            <dl className="pass-grid">
              <div>
                <dt>PASSENGER</dt>
                <dd>{name || 'Unassigned'}</dd>
              </div>
              <div>
                <dt>CORRIDOR</dt>
                <dd className="is-gold">{activeDest.name}</dd>
              </div>
              <div>
                <dt>LAUNCH WINDOW</dt>
                <dd>{launchWindow}</dd>
              </div>
              <div>
                <dt>BERTHS</dt>
                <dd>
                  {guests} × {activeTier.name}
                </dd>
              </div>
              <div>
                <dt>DISTANCE</dt>
                <dd>{activeDest.distance}</dd>
              </div>
              <div>
                <dt>STATUS</dt>
                <dd className="is-cyan">{confirmed ? 'LOCKED & CLEARED' : 'DRAFT'}</dd>
              </div>
            </dl>

            <div className="pass-bottom">
              <div className="pass-barcode" aria-hidden="true">
                <div className="bars" />
                <span>{manifestId} // KSC-LC39A</span>
              </div>
              {confirmed && (
                <button
                  type="button"
                  className="finale-btn-ghost compact"
                  onClick={() => window.print()}
                >
                  Print Boarding Pass
                </button>
              )}
            </div>
          </aside>
        </div>

        {/* Clean 3-column dark footer */}
        <footer className="horizon-footer">
          <div>
            <div className="hf-brand">
              astral<span className="brand-dot">.</span>
            </div>
            <p className="hf-copy">
              Built with real NASA 3D resources, SDO extreme ultraviolet imagery, and planetary
              textures.
            </p>
          </div>

          <div>
            <span className="eyebrow-micro muted">NAVIGATION</span>
            <div className="hf-links">
              <button type="button" onClick={() => onNavigate('hero')}>
                Overview
              </button>
              <button type="button" onClick={() => onNavigate('orbiter')}>
                Parker Solar Probe
              </button>
              <button type="button" onClick={() => onNavigate('journeys')}>
                Journeys Beyond
              </button>
              <button type="button" onClick={() => onNavigate('archives')}>
                Optical Archives
              </button>
            </div>
          </div>

          <div>
            <span className="eyebrow-micro muted">TELEMETRY DISPATCH</span>
            <form
              className="hf-dispatch"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newsletter.trim()) return;
                soundscape.tick(960);
                setNewsletterSent(true);
                setNewsletter('');
              }}
            >
              <input
                type="email"
                placeholder="you@domain.com"
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                aria-label="Mission dispatch email"
              />
              <button type="submit">Join</button>
            </form>
            {newsletterSent && (
              <span className="hf-sent">Subscribed to perihelion launch notices.</span>
            )}
          </div>
        </footer>
      </div>

      {/* Dark-theme consistent real NASA Earth-limb orbital horizon */}
      <div className="horizon-nasa-backdrop" aria-hidden="true">
        <img src="./images/nasa_iss_earth.webp" alt="" loading="lazy" />
        <div className="horizon-nasa-mask" />
      </div>
    </section>
  );
}

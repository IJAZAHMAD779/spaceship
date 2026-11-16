import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CABIN_TIERS } from '../data/programData';
import { soundscape } from '../utils/soundscape';

function makePod() {
  const n = Math.floor(10 + Math.random() * 88);
  const deck = String.fromCharCode(65 + Math.floor(Math.random() * 4));
  return `AC5-${n}-${deck}`;
}

function makeManifestCode() {
  return `779-0500-${Math.floor(10000000 + Math.random() * 89999999)}`;
}

export default function FinaleAct({ preset, onNavigate }) {
  const [name, setName] = useState('Dr. Alex Vance');
  const [email, setEmail] = useState('vance@heliophysics.org');
  const [tierId, setTierId] = useState('observation');
  const [launchWindow, setLaunchWindow] = useState('2026-11-14');
  const [duration, setDuration] = useState(60);
  const [guests, setGuests] = useState(1);

  const [manifest, setManifest] = useState({
    name: 'Dr. Alex Vance',
    tierId: 'observation',
    launchWindow: '2026-11-14',
    duration: 60,
    guests: 1,
    pod: 'AC5-42-A',
    code: '779-0500-98412033',
  });

  const [dispatchEmail, setDispatchEmail] = useState('');
  const [dispatchSent, setDispatchSent] = useState(false);

  useEffect(() => {
    if (!preset) return;
    if (preset.tierId) setTierId(preset.tierId);
    if (preset.launchWindow) setLaunchWindow(preset.launchWindow);
    if (preset.guests) setGuests(preset.guests);
  }, [preset]);

  const activeTier = CABIN_TIERS.find((t) => t.id === tierId) || CABIN_TIERS[0];
  const issuedTier = CABIN_TIERS.find((t) => t.id === manifest.tierId) || CABIN_TIERS[0];

  const totalCredits = useMemo(() => {
    const count = Math.max(1, Math.min(6, Number(guests) || 1));
    const mult = 1 + ((Number(duration) - 30) / 60) * 0.4;
    return Math.round(activeTier.price * count * mult);
  }, [activeTier, guests, duration]);

  const submitManifest = (e) => {
    e.preventDefault();
    soundscape.tick(1020);
    setManifest({
      name: name.trim() || 'Mission Specialist',
      tierId,
      launchWindow,
      duration,
      guests,
      pod: makePod(),
      code: makeManifestCode(),
    });
  };

  const submitDispatch = (e) => {
    e.preventDefault();
    if (!dispatchEmail.trim()) return;
    soundscape.tick(880);
    setDispatchSent(true);
    setDispatchEmail('');
  };

  return (
    <section id="clearance" className="act finale-act">
      <div className="container finale-inner">
        {/* Top editorial banner directly inspired by Image 2 ("Join The Next Era Of Human Exploration") */}
        <div className="finale-banner">
          <div className="finale-headline-col">
            <span className="eyebrow-micro solar">HELIOS-7 // EMBARKATION OPEN</span>
            <h2>
              Join The Next Era Of
              <br />
              Solar Exploration
            </h2>
            <p>
              Reserve your berth aboard Astral Cruiser 5000 departing LEO Orbital Gateway 13 for
              our next 0.038 AU perihelion campaign.
            </p>
          </div>

          <div className="finale-cta-col">
            <a
              href="#manifest-configurator"
              className="finale-btn-white"
              onClick={() => soundscape.tick(920)}
            >
              <span>Become A Voyager</span>
              <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className="finale-btn-ghost"
              onClick={() => {
                soundscape.tick(800);
                onNavigate('orbiter');
              }}
            >
              <span>Inspect Vessel Specs</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        {/* Interactive Flight Clearance & Boarding Manifest */}
        <div id="manifest-configurator" className="clearance-split">
          <form className="clearance-form" onSubmit={submitManifest}>
            <div className="cf-row">
              <div className="cf-field">
                <label htmlFor="cf-name">Officer / Voyager Name</label>
                <input
                  id="cf-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="cf-field">
                <label htmlFor="cf-email">Comms Address</label>
                <input
                  id="cf-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="cf-field">
              <span className="cf-label">Cabin Berth Class</span>
              <div className="cf-tiers" role="radiogroup" aria-label="Cabin Berth Class">
                {CABIN_TIERS.map((tier) => {
                  const selected = tier.id === tierId;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        soundscape.tick(840);
                        setTierId(tier.id);
                      }}
                      className={`cf-tier-btn ${selected ? 'is-selected' : ''}`}
                    >
                      {selected && (
                        <motion.span
                          layoutId="cf-tier-active"
                          className="cf-tier-ring"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className="cf-tier-content">
                        <strong>{tier.short}</strong>
                        <span>{(tier.price / 1000).toLocaleString()}k CR</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="cf-row three">
              <div className="cf-field">
                <label htmlFor="cf-win">Launch Window</label>
                <select
                  id="cf-win"
                  value={launchWindow}
                  onChange={(e) => setLaunchWindow(e.target.value)}
                >
                  <option value="2026-11-14">2026-11-14 (Helios-7)</option>
                  <option value="2027-03-22">2027-03-22 (Helios-8)</option>
                  <option value="2027-08-10">2027-08-10 (Helios-9)</option>
                </select>
              </div>
              <div className="cf-field">
                <label htmlFor="cf-dur">Duration</label>
                <select
                  id="cf-dur"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>
              <div className="cf-field">
                <label htmlFor="cf-guests">Crew</label>
                <input
                  id="cf-guests"
                  type="number"
                  min={1}
                  max={6}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="cf-submit-row">
              <div>
                <span className="eyebrow-micro muted">ESTIMATED ALLOCATION</span>
                <div className="cf-total">₡ {totalCredits.toLocaleString()} CR</div>
              </div>
              <button type="submit" className="finale-btn-white">
                <span>Issue Manifest</span>
                <span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>

          {/* Printable Boarding Pass */}
          <motion.div
            key={manifest.code}
            initial={{ opacity: 0.7, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="pass-sheet"
          >
            <div className="pass-top">
              <div>
                <span className="eyebrow-micro solar">BOARDING CLEARANCE // AC-5000</span>
                <h3>ASTRAL CRUISER 5000</h3>
              </div>
              <span className="pass-flight">FLIGHT AC-5000</span>
            </div>

            <dl className="pass-grid">
              <div>
                <dt>VOYAGER</dt>
                <dd className="is-gold">{manifest.name}</dd>
              </div>
              <div>
                <dt>CABIN TIER</dt>
                <dd>{issuedTier.name}</dd>
              </div>
              <div>
                <dt>DEPARTURE</dt>
                <dd>{manifest.launchWindow} • 06:00 UTC</dd>
              </div>
              <div>
                <dt>POD / BERTH</dt>
                <dd className="is-cyan">{manifest.pod}</dd>
              </div>
              <div>
                <dt>GATEWAY</dt>
                <dd>LEO Dock 07 (420 km)</dd>
              </div>
              <div>
                <dt>CENTRIFUGE</dt>
                <dd>1.00 G Nominal</dd>
              </div>
            </dl>

            <div className="pass-bottom">
              <div className="pass-barcode">
                <div className="bars" aria-hidden="true" />
                <span>{manifest.code}</span>
              </div>
              <button
                type="button"
                className="finale-btn-ghost compact"
                onClick={() => window.print()}
              >
                Print Pass
              </button>
            </div>
          </motion.div>
        </div>

        {/* Clean Multi-column Footer inspired by Image 2 */}
        <footer className="horizon-footer">
          <div className="hf-col">
            <div className="hf-brand">astral.</div>
            <p className="hf-copy">
              © 2026 Astral Cruiser 5000 Program.
              <br />
              LEO Orbital Gateway 13 • 51.6° Inclination.
            </p>
          </div>

          <div className="hf-col">
            <span className="eyebrow-micro muted">NAVIGATION</span>
            <div className="hf-links">
              <button type="button" onClick={() => onNavigate('hero')}>Overview</button>
              <button type="button" onClick={() => onNavigate('orbiter')}>Orbiter AC-5000</button>
              <button type="button" onClick={() => onNavigate('journeys')}>Journeys</button>
              <button type="button" onClick={() => onNavigate('archives')}>Optical Archives</button>
            </div>
          </div>

          <div className="hf-col">
            <span className="eyebrow-micro muted">TELEMETRY DISPATCH</span>
            <form className="hf-dispatch" onSubmit={submitDispatch}>
              <input
                type="email"
                required
                aria-label="Comms email for telemetry dispatch"
                placeholder="Comms e-mail"
                value={dispatchEmail}
                onChange={(e) => {
                  setDispatchEmail(e.target.value);
                  if (dispatchSent) setDispatchSent(false);
                }}
              />
              <button type="submit">Join</button>
            </form>
            {dispatchSent && (
              <span className="hf-sent">Subscribed to CME launch alerts.</span>
            )}
          </div>
        </footer>
      </div>

      {/* Warm Planetary Horizon & Lander Silhouette Base (Image 2 signature visual!) */}
      <div className="horizon-terrain" aria-hidden="true">
        <svg viewBox="0 0 1440 280" preserveAspectRatio="none" className="terrain-svg">
          <defs>
            <linearGradient id="skyWarm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(180, 95, 42, 0)" />
              <stop offset="55%" stopColor="rgba(176, 102, 54, 0.34)" />
              <stop offset="100%" stopColor="#9c613c" />
            </linearGradient>
            <linearGradient id="ridgeFar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8e5b3f" />
              <stop offset="100%" stopColor="#43281b" />
            </linearGradient>
            <linearGradient id="ridgeNear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a3423" />
              <stop offset="100%" stopColor="#1b100b" />
            </linearGradient>
          </defs>
          <rect width="1440" height="280" fill="url(#skyWarm)" />
          <path
            d="M0 210 L140 168 L290 194 L460 154 L650 198 L820 160 L1020 182 L1230 148 L1440 186 L1440 280 L0 280 Z"
            fill="url(#ridgeFar)"
          />
          <path
            d="M0 235 L210 218 L430 242 L740 215 L1080 230 L1320 208 L1440 222 L1440 280 L0 280 Z"
            fill="url(#ridgeNear)"
          />
          {/* Minimalist Outpost + Vertical Lander Silhouette on Right */}
          <g transform="translate(1060, 74)">
            <ellipse cx="70" cy="158" rx="115" ry="12" fill="#2c1911" />
            <path d="M52 22 C52 6 88 6 88 22 L102 128 L38 128 Z" fill="#e2e8f0" />
            <path d="M70 8 C84 8 88 22 88 22 L102 128 L70 128 Z" fill="#94a3b8" />
            <path d="M44 128 L24 156 M96 128 L116 156 M70 128 L70 156" stroke="#cbd5e1" strokeWidth="3.5" />
            <rect x="60" y="28" width="20" height="5" rx="2" fill="#0f172a" />
          </g>
          {/* Habitat Domes Left */}
          <g transform="translate(280, 198)" fill="#cbd5e1" opacity="0.88">
            <rect x="0" y="14" width="68" height="20" rx="10" />
            <rect x="82" y="10" width="94" height="24" rx="12" />
          </g>
        </svg>
      </div>
    </section>
  );
}

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CABIN_TIERS } from '../data/missionData';
import { audioEngine } from '../utils/audioEngine';

function generateSeatCode() {
  const num = Math.floor(10 + Math.random() * 88);
  const deck = String.fromCharCode(65 + Math.floor(Math.random() * 4));
  return `AC5-${num}-${deck}`;
}

function generateManifestId() {
  return `779-0500-${Math.floor(10000000 + Math.random() * 89999999)}`;
}

export default function BookingChapter() {
  const [name, setName] = useState('Dr. Alex Vance');
  const [email, setEmail] = useState('vance@heliophysics.org');
  const [tierId, setTierId] = useState('observation');
  const [launchWindow, setLaunchWindow] = useState('2026-11-14');
  const [duration, setDuration] = useState(30);
  const [guests, setGuests] = useState(1);

  const [issuedPass, setIssuedPass] = useState(() => ({
    name: 'Dr. Alex Vance',
    tierId: 'observation',
    launchWindow: '2026-11-14',
    duration: 30,
    guests: 1,
    seat: 'AC5-42-A',
    manifestId: '779-0500-98412033',
  }));

  const [commsEmail, setCommsEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const selectedTier = CABIN_TIERS.find((t) => t.id === tierId) || CABIN_TIERS[0];
  const passTier = CABIN_TIERS.find((t) => t.id === issuedPass.tierId) || CABIN_TIERS[0];

  const estimatedCredits = useMemo(() => {
    const base = selectedTier.price * Math.max(1, Math.min(6, Number(guests) || 1));
    const mult = 1 + ((Number(duration) - 30) / 60) * 0.4;
    return Math.round(base * mult);
  }, [selectedTier, guests, duration]);

  const handleIssueManifest = (e) => {
    e.preventDefault();
    audioEngine.playClick(1040);
    setIssuedPass({
      name: name.trim() || 'Mission Specialist',
      tierId,
      launchWindow,
      duration,
      guests,
      seat: generateSeatCode(),
      manifestId: generateManifestId(),
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!commsEmail.trim()) return;
    audioEngine.playClick(880);
    setSubscribed(true);
    setCommsEmail('');
  };

  return (
    <section id="clearance" className="chapter booking-chapter">
      <div className="container">
        <div className="booking-header">
          <span className="mono-tag">CHAPTER 05 // FLIGHT CLEARANCE & MANIFEST</span>
          <h2 className="section-heading">Reserve Helios-7 Embarkation</h2>
          <p className="section-lead">
            Configure cabin tier and mission window to issue a printable Astral Cruiser 5000 flight
            clearance manifest for LEO Orbital Gateway 13.
          </p>
        </div>

        <div className="booking-grid">
          <form className="booking-form" onSubmit={handleIssueManifest}>
            <div className="form-field">
              <label htmlFor="passenger-name">Passenger / Officer Name</label>
              <input
                id="passenger-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="passenger-email">Encrypted Comms Address</label>
              <input
                id="passenger-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <span className="field-label">Cabin Tier Allocation</span>
              <div className="tier-selector" role="radiogroup" aria-label="Cabin Tier">
                {CABIN_TIERS.map((tier) => {
                  const active = tier.id === tierId;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        audioEngine.playClick(840);
                        setTierId(tier.id);
                      }}
                      className={`tier-btn ${active ? 'is-active' : ''}`}
                    >
                      {active && (
                        <motion.span
                          layoutId="tier-active-outline"
                          className="tier-active-bg"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className="tier-btn-inner">
                        <strong>{tier.short}</strong>
                        <span>{(tier.price / 1000).toLocaleString()}k CR</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="tier-perks">{selectedTier.deck} — {selectedTier.perks}</p>
            </div>

            <div className="form-split-row">
              <div className="form-field">
                <label htmlFor="launch-window">Launch Window</label>
                <select
                  id="launch-window"
                  value={launchWindow}
                  onChange={(e) => setLaunchWindow(e.target.value)}
                >
                  <option value="2026-11-14">2026-11-14 (Helios-7)</option>
                  <option value="2027-03-22">2027-03-22 (Helios-8)</option>
                  <option value="2027-08-10">2027-08-10 (Helios-9)</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="mission-duration">Mission Profile</label>
                <select
                  id="mission-duration"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  <option value={30}>30 Days (Fast Skim)</option>
                  <option value={60}>60 Days (Full Corona)</option>
                  <option value={90}>90 Days (Deep Pass)</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="guest-count">Personnel</label>
                <input
                  id="guest-count"
                  type="number"
                  min={1}
                  max={6}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="fare-bar">
              <span className="mono-tag muted">ESTIMATED ALLOCATION</span>
              <span className="fare-amount">₡ {estimatedCredits.toLocaleString()} CR</span>
            </div>

            <button type="submit" className="btn-solid full-width">
              Issue Boarding Manifest
            </button>
          </form>

          {/* Printable Aerospace Boarding Manifest */}
          <div className="manifest-wrap">
            <motion.div
              key={issuedPass.manifestId}
              initial={{ opacity: 0.65, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="boarding-manifest"
            >
              <div className="manifest-head">
                <div>
                  <span className="mono-tag amber">BOARDING CLEARANCE // AC-5000</span>
                  <h3>ASTRAL CRUISER 5000</h3>
                </div>
                <span className="manifest-badge">FLIGHT AC-5000</span>
              </div>

              <dl className="manifest-fields">
                <div>
                  <dt>PASSENGER / SPECIALIST</dt>
                  <dd className="is-highlight">{issuedPass.name}</dd>
                </div>
                <div>
                  <dt>BERTH ALLOCATION</dt>
                  <dd>{passTier.name}</dd>
                </div>
                <div>
                  <dt>LAUNCH WINDOW</dt>
                  <dd>{issuedPass.launchWindow} • 06:00 UTC</dd>
                </div>
                <div>
                  <dt>POD / SEAT</dt>
                  <dd className="is-cyan">{issuedPass.seat}</dd>
                </div>
                <div>
                  <dt>EMBARKATION DOCK</dt>
                  <dd>LEO Gateway 13 • Dock 07 (420 km)</dd>
                </div>
                <div>
                  <dt>CENTRIFUGE RATING</dt>
                  <dd>1.00 G Nominal / 2.8 G Max Burn</dd>
                </div>
              </dl>

              <div className="manifest-foot">
                <div className="barcode-block">
                  <div className="barcode-lines" aria-hidden="true" />
                  <span>{issuedPass.manifestId}</span>
                </div>
                <button
                  type="button"
                  className="btn-outline btn-compact"
                  onClick={() => window.print()}
                >
                  Print Manifest
                </button>
              </div>
            </motion.div>

            {/* Gateway 13 Info Card */}
            <div className="gateway-card">
              <img src="images/orbital_spaceport.webp" alt="LEO Gateway Spaceport 13" loading="lazy" />
              <div>
                <span className="mono-tag cyan">EMBARKATION // 420 KM LEO</span>
                <h4>Gateway Spaceport 13</h4>
                <p>
                  All crew and guests transfer via orbital shuttle (28 min ascent) for 5-day
                  vestibular orientation and suit pressure certification prior to trans-solar burn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="site-footer">
          <div className="footer-cols">
            <div>
              <div className="brand-mark static">
                <span className="brand-code">AC-5000</span>
                <span className="brand-name">ASTRAL CRUISER</span>
              </div>
              <p className="footer-note">
                Solar corona astrophysics and crewed perihelion operations. LEO Orbital Gateway 13,
                51.6° inclination • Comms: ac5-solar@astral.space
              </p>
            </div>

            <form className="footer-subscribe" onSubmit={handleSubscribe}>
              <label htmlFor="telemetry-email" className="mono-tag">
                SOLAR TELEMETRY DISPATCH
              </label>
              <div className="subscribe-row">
                <input
                  id="telemetry-email"
                  type="email"
                  required
                  placeholder="Enter comms email"
                  value={commsEmail}
                  onChange={(e) => {
                    setCommsEmail(e.target.value);
                    if (subscribed) setSubscribed(false);
                  }}
                />
                <button type="submit" className="btn-outline btn-compact">
                  Subscribe
                </button>
              </div>
              {subscribed && (
                <span className="subscribe-confirm">
                  Telemetry feed registered for next CME window.
                </span>
              )}
            </form>
          </div>

          <div className="footer-legal">
            <span>© 2026 Astral Cruiser 5000 Program</span>
            <span className="mono-tag muted">CLEARANCE LEVEL: PUBLIC BRIEFING</span>
          </div>
        </footer>
      </div>
    </section>
  );
}

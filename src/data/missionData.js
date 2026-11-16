export const SUBSYSTEMS = [
  {
    id: 'shield',
    code: 'SYS-01',
    name: 'Carbon-Composite Heat Shield',
    shortName: 'Thermal Shield',
    status: 'NOMINAL // 1,840 °C PEAK LOAD',
    summary:
      '11.4 cm reinforced carbon-carbon lattice bonded to a gold-iridium reflective outer lamina. Maintains crew bay ambient temperature at 21.5 °C even at 0.038 AU perihelion.',
    specs: [
      { label: 'Peak Thermal Rating', value: '2,400 °C continuous' },
      { label: 'Reflective Albedo', value: '99.4% IR / UV' },
      { label: 'Umbra Shield Margin', value: '±4.2° attitude cone' },
    ],
  },
  {
    id: 'hab',
    code: 'SYS-02',
    name: 'Centrifugal 1-G Habitation Ring',
    shortName: 'Gravity Ring',
    status: 'ROTATING // 4.2 RPM (1.00 G)',
    summary:
      'Counter-balanced structural torus spinning behind the shield umbra. Houses crew quarters, hydroponic air-water loops, and storm-shelter radiation vaults.',
    specs: [
      { label: 'Ring Radius', value: '45.0 m mean deck' },
      { label: 'Cabin Atmosphere', value: '101.3 kPa • 21% O₂' },
      { label: 'Magnetic Shielding', value: '14.2 T active dipole' },
    ],
  },
  {
    id: 'engine',
    code: 'SYS-03',
    name: 'Dual-Phase Ion Fusion Drive',
    shortName: 'Ion Fusion Drive',
    status: 'BURNING // 142.4 KM/S DELTA-V',
    summary:
      'Quad magnetic-nozzle D-He³ fusion thrusters delivering high specific impulse for perihelion braking, Venus/Mercury gravity assists, and rapid Earth return.',
    specs: [
      { label: 'Specific Impulse', value: '28,400 s' },
      { label: 'Continuous Thrust', value: '4.8 MN vectorable' },
      { label: 'Propellant Reserve', value: '86.4% D-He³ slush' },
    ],
  },
  {
    id: 'collector',
    code: 'SYS-04',
    name: 'Coronal Plasma & Field Array',
    shortName: 'Plasma Array',
    status: 'SAMPLING // 18.4 GW INDUCTION',
    summary:
      'Deployable tungsten-niobium Faraday cups and vector magnetometers mounted along the shadow edge to sample solar wind switchbacks and coronal reconnection.',
    specs: [
      { label: 'Flux Bandwidth', value: '0.1 Hz – 40 MHz' },
      { label: 'Power Induction', value: '18.4 GW peak bus' },
      { label: 'Telemetry Link', value: 'Ka-band + Optical laser' },
    ],
  },
];

export const FLEET_COMPARISON = [
  {
    model: 'AC-1000 Pathfinder',
    year: '2020',
    perihelion: '0.280 AU',
    thermalLimit: '980 °C',
    complement: '12 Specialists',
    status: 'RETIRED',
    active: false,
  },
  {
    model: 'AC-3000 Meridian',
    year: '2023',
    perihelion: '0.120 AU',
    thermalLimit: '1,650 °C',
    complement: '44 Crew',
    status: 'TRAINING FLEET',
    active: false,
  },
  {
    model: 'Astral Cruiser 5000',
    year: '2026',
    perihelion: '0.038 AU',
    thermalLimit: '2,400 °C',
    complement: '110 Crew & Guests',
    status: 'ACTIVE FLAGSHIP',
    active: true,
  },
];

export const MISSIONS = [
  {
    id: 'helios-1',
    code: 'AC-5001',
    name: 'Helios-1: Shield Qualification',
    date: 'MAR 2024',
    perihelion: '0.150 AU',
    velocity: '84.2 km/s',
    outcome: 'NOMINAL',
    summary:
      'Uncrewed maiden thermal soak verifying carbon-iridium delamination tolerances and umbra attitude thrusters inside Mercury aphelion.',
  },
  {
    id: 'helios-2',
    code: 'AC-5002',
    name: 'Helios-2: Mercury Slingshot',
    date: 'OCT 2024',
    perihelion: '0.082 AU',
    velocity: '118.0 km/s',
    outcome: 'NOMINAL',
    summary:
      'First crewed gravity-assist maneuver around Mercury, validating the 1-G habitation centrifuge under 2.1 G perihelion burn profiles.',
  },
  {
    id: 'helios-3',
    code: 'AC-5003',
    name: 'Helios-3: Alfvén Surface Entry',
    date: 'JUN 2025',
    perihelion: '0.054 AU',
    velocity: '129.6 km/s',
    outcome: 'MILESTONE',
    summary:
      'Crossed the Alfvén critical surface into the magnetically dominated corona, capturing in-situ measurements of plasma switchback reversals.',
  },
  {
    id: 'helios-4',
    code: 'AC-5004',
    name: 'Helios-4: X-Class Flare Traverse',
    date: 'JAN 2026',
    perihelion: '0.044 AU',
    velocity: '136.5 km/s',
    outcome: 'MILESTONE',
    summary:
      'Skirted an X-9 coronal mass ejection filament while the 14.2 T dipole deflector attenuated proton flux by 99.96% inside the crew ring.',
  },
  {
    id: 'helios-5',
    code: 'AC-5005',
    name: 'Helios-5: Polar Inclination Pass',
    date: 'MAY 2026',
    perihelion: '0.041 AU',
    velocity: '139.8 km/s',
    outcome: 'NOMINAL',
    summary:
      'Executed a 34° out-of-ecliptic inclination crank via Venus assist, imaging polar coronal holes unseen from Earth-plane observatories.',
  },
  {
    id: 'helios-6',
    code: 'AC-5006',
    name: 'Helios-6: Deep Perihelion Dive',
    date: 'ACTIVE // NOV 2026',
    perihelion: '0.038 AU',
    velocity: '142.4 km/s',
    outcome: 'IN FLIGHT',
    summary:
      'Current operational pass at 5.68 million km from solar center with 34 flight officers and 76 researchers and mission specialists aboard.',
  },
];

export const GALLERY_ITEMS = [
  {
    id: 'flare-loop',
    category: 'solar',
    src: 'images/solar_flare_burst.webp',
    title: 'Active Region Magnetic Loop',
    caption: 'Extreme-UV filtered capture of a 280,000 km coronal flux rope at 0.038 AU.',
    au: '0.038 AU',
    instrument: 'WISPR-5000 Optical Coronagraph',
    exposure: '1/8000s • ND-6 Gold Filter',
  },
  {
    id: 'flagship-corona',
    category: 'vessel',
    src: 'images/hero_spaceship.webp',
    title: 'AC-5000 Perihelion Profile',
    caption: 'External drone telemetry view of Astral Cruiser 5000 holding attitude along the solar limb.',
    au: '0.040 AU',
    instrument: 'Free-Flyer Recon Pod B',
    exposure: '1/4000s • Polarized',
  },
  {
    id: 'cme-arc',
    category: 'solar',
    src: 'images/solar_prominence.webp',
    title: 'Eruptive Prominence Filament',
    caption: 'High-cadence plasma ejection separating from the chromosphere prior to Earthward drift.',
    au: '0.042 AU',
    instrument: 'H-Alpha Spectrograph',
    exposure: '1/6400s • 656.3 nm',
  },
  {
    id: 'bridge-lounge',
    category: 'vessel',
    src: 'images/cockpit_lounge.webp',
    title: 'Forward Umbra Observation Deck',
    caption: 'Triple-laminated sapphire viewports positioned behind the primary thermal shadow cone.',
    au: '0.045 AU',
    instrument: 'Deck 02 Optical Array',
    exposure: '1/250s • 1.0 G Ring',
  },
  {
    id: 'eva-shield',
    category: 'crew',
    src: 'images/spacewalk_solar.webp',
    title: 'Thermal Tile Inspection EVA',
    caption: 'Flight engineer verifying gold-iridium micro-meteoroid integrity during outbound cruise.',
    au: '0.180 AU',
    instrument: 'Helmet Cam 04',
    exposure: '1/2000s • Visor Filtered',
  },
  {
    id: 'fusion-drive',
    category: 'vessel',
    src: 'images/fusion_engine.webp',
    title: 'D-He³ Magnetic Nozzle Array',
    caption: 'Aft thruster cluster during retrograde orbital insertion burn.',
    au: '0.050 AU',
    instrument: 'Boom Camera Aft-1',
    exposure: '1/1000s • High Dynamic',
  },
  {
    id: 'gateway-13',
    category: 'vessel',
    src: 'images/orbital_spaceport.webp',
    title: 'LEO Orbital Gateway 13',
    caption: 'Astral Cruiser 5000 berthed at 420 km equatorial inclination prior to trans-solar injection.',
    au: '1.000 AU',
    instrument: 'Dock 07 Telemetry Cam',
    exposure: '1/500s • Earth Orbit',
  },
  {
    id: 'solar-lab',
    category: 'crew',
    src: 'images/solar_lab_research.webp',
    title: 'Heliophysics Telemetry Lab',
    caption: 'Science cadre analyzing live magnetogram reconstructions inside Deck 04.',
    au: '0.040 AU',
    instrument: 'Internal Lab Archive',
    exposure: '1/120s • Low Light',
  },
  {
    id: 'anna-schwartz',
    category: 'crew',
    src: 'images/dr_anna_schwartz.webp',
    title: 'Dr. Anna Schwartz — Chief Scientist',
    caption: 'Principal Investigator for solar wind acceleration and magnetic reconnection studies.',
    au: '0.038 AU',
    instrument: 'Mission Roster Portrait',
    exposure: '4K Archival Still',
  },
  {
    id: 'marcus-thorne',
    category: 'crew',
    src: 'images/commander_thorne.webp',
    title: 'Cmdr. Marcus Thorne — Flight Director',
    caption: 'Veteran of 2,400 interplanetary flight hours across six solar perihelion passes.',
    au: '0.038 AU',
    instrument: 'Mission Roster Portrait',
    exposure: '4K Archival Still',
  },
];

export const CREW_LEADERS = [
  {
    name: 'Dr. Anna Schwartz',
    role: 'Chief Heliophysicist // Science Lead',
    image: 'images/dr_anna_schwartz.webp',
    quote:
      'Crossing the Alfvén surface inside a crewed hull turned solar physics from remote inference into direct sampling. Every meter closer resolves questions open since 1958.',
    credentials: '42 peer-reviewed papers • Former ESA/NASA Solar Probe Co-I',
  },
  {
    name: 'Cmdr. Marcus Thorne',
    role: 'Mission Flight Director // AC-5000',
    image: 'images/commander_thorne.webp',
    quote:
      'At 0.038 AU your entire survival margin is a four-degree attitude cone behind the shield. The AC-5000 control laws hold that line to a hundredth of a degree.',
    credentials: '2,400+ interplanetary hours • 6 Perihelion Commands',
  },
];

export const FAQS = [
  {
    q: 'How close does the Astral Cruiser 5000 approach the Sun?',
    a: 'At perihelion (Helios-6 profile), AC-5000 passes within 0.038 AU—roughly 5.68 million kilometers from the Sun’s center, well inside Mercury’s 0.387 AU orbit and inside the solar corona.',
  },
  {
    q: 'Why does the ship not melt at 0.038 AU?',
    a: 'Solar flux at 0.038 AU reaches ~942.5 kW/m²—nearly 700× Earth orbit. The forward 11.4 cm carbon-carbon heat shield reflects and radiates over 99% of incident energy back into space, keeping the aft habitation ring inside a cool shadow cone at 21.5 °C.',
  },
  {
    q: 'How are crew and passengers protected from solar radiation?',
    a: 'An active 14.2-Tesla toroidal magnetic dipole deflects charged solar-wind protons around the hull, backed by water-jacketed storm vaults inside the habitation ring.',
  },
  {
    q: 'Is there artificial gravity onboard?',
    a: 'Yes. The main habitation torus rotates at 4.2 RPM to maintain a steady 1.00 G radial acceleration across staterooms, laboratories, and dining decks, while the central spine provides 0-G docking and microgravity bays.',
  },
];

export const CABIN_TIERS = [
  {
    id: 'observation',
    name: 'Observer Suite',
    short: 'Observer',
    price: 450000,
    deck: 'Ring Deck B • 1.0 G',
    perks: 'Sapphire viewport, radiation vault berth, live telemetry console',
  },
  {
    id: 'research',
    name: 'Research Specialist Pod',
    short: 'Research',
    price: 850000,
    deck: 'Science Deck A • 1.0 G / 0 G',
    perks: 'Dedicated lab rack, EVA observation slot, raw WISPR data feed',
  },
  {
    id: 'vip-quantum',
    name: 'Command Quantum Quarters',
    short: 'Command VIP',
    price: 1600000,
    deck: 'Forward Umbra Suite • 1.0 G',
    perks: 'Private star-deck lounge, bridge briefings, priority shuttle transfer',
  },
];

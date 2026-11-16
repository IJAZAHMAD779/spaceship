export const VESSEL_MODULES = [
  {
    id: 'capsule',
    code: '01',
    name: 'Forward Umbra Capsule & Shield',
    tag: 'CREW COMMAND // THERMAL BARRIER',
    description:
      'Pressurized flight deck seated behind an 11.4 cm carbon-iridium heat shield. Reflects 99.4% of solar irradiance at 0.038 AU while maintaining 21.5 °C cabin equilibrium.',
    telemetry: [
      { label: 'Crew Capacity', value: '110' },
      { label: 'Perihelion', value: '0.038 AU' },
      { label: 'Shield Limit', value: '2,400 °C' },
      { label: 'Flux Load', value: '942.5 kW/m²' },
      { label: 'Umbra Margin', value: '±4.2°' },
      { label: 'Atmosphere', value: '101.3 kPa' },
    ],
  },
  {
    id: 'hab',
    code: '02',
    name: 'Centrifugal Habitation Core',
    tag: '1.00 G RING // RADIATION VAULT',
    description:
      'Rotating habitation cylinder and docking spine generating continuous 1.00 Earth-G along outer decks, shielded by an active 14.2-Tesla toroidal magnetic dipole.',
    telemetry: [
      { label: 'Ring Spin', value: '4.2 RPM' },
      { label: 'Artificial G', value: '1.00 G' },
      { label: 'Hab Volume', value: '320 m³' },
      { label: 'Magnetic Field', value: '14.2 T' },
      { label: 'Attenuation', value: '99.96%' },
      { label: 'Life Support', value: '180 Days' },
    ],
  },
  {
    id: 'arrays',
    code: '03',
    name: 'Copper-Gold Radiator & Collector Wings',
    tag: 'THERMAL REJECTION // PLASMA HARVEST',
    description:
      'Articulated four-wing array pairing high-emissivity copper-gold thermal radiators with tungsten-niobium coronal plasma probes along the shadow edge.',
    telemetry: [
      { label: 'Wing Span', value: '38.4 m' },
      { label: 'Bus Output', value: '18.4 GW' },
      { label: 'Peak Rejection', value: '1,420 MW' },
      { label: 'Bandwith', value: '40 MHz' },
      { label: 'Orbit Class', value: 'Heliocentric' },
      { label: 'Downlink', value: 'Optical Ka' },
    ],
  },
  {
    id: 'drive',
    code: '04',
    name: 'Quad D-He³ Ion Fusion Cluster',
    tag: 'PROPULSION // PERIHELION BRAKING',
    description:
      'Four magnetic-nozzle fusion thrusters delivering 4.8 MN of vectorable thrust at 28,400 s specific impulse for Mercury gravity assists and solar escape.',
    telemetry: [
      { label: 'Max Delta-V', value: '142.4 km/s' },
      { label: 'Specific Impulse', value: '28,400 s' },
      { label: 'Total Thrust', value: '4.8 MN' },
      { label: 'Propellant', value: 'D-He³ Slush' },
      { label: 'Dry Mass', value: '4,200 t' },
      { label: 'Launch Vehicle', value: 'Gateway Heavy' },
    ],
  },
];

export const DESTINATIONS = [
  {
    id: 'corona',
    code: '0.038 AU',
    name: 'Corona Perihelion',
    subtitle: '5.68M km from Solar Center',
    duration: '60 Days',
    temp: '1,840 °C Shield',
    accent: 'solar',
    summary:
      'Plunge inside the Alfvén critical surface directly through live coronal magnetic loops and solar wind switchbacks.',
    tierDefault: 'vip-quantum',
  },
  {
    id: 'alfven',
    code: '0.054 AU',
    name: 'Alfvén Boundary',
    subtitle: 'Outer Magnetic Rim',
    duration: '45 Days',
    temp: '1,290 °C Shield',
    accent: 'cyan',
    summary:
      'Orbit along the transition boundary where solar plasma escapes the Sun’s magnetic dominance into interplanetary space.',
    tierDefault: 'research',
  },
  {
    id: 'mercury',
    code: '0.387 AU',
    name: 'Mercury Slingshot',
    subtitle: 'Perihelion Gravity Assist',
    duration: '30 Days',
    temp: '410 °C Shield',
    accent: 'violet',
    summary:
      'High-speed flyby around Mercury’s sunlit terminator for cadence calibration and first-time orbital guests.',
    tierDefault: 'observation',
  },
];

export const CHRONICLES = [
  {
    num: '01',
    code: 'HELIOS-1',
    date: 'MAR 2024',
    perihelion: '0.150 AU',
    velocity: '84.2 km/s',
    title: 'Thermal Shield Qualification',
    summary:
      'Uncrewed maiden soak validating carbon-iridium delamination tolerances inside Mercury’s aphelion.',
  },
  {
    num: '02',
    code: 'HELIOS-2',
    date: 'OCT 2024',
    perihelion: '0.082 AU',
    velocity: '118.0 km/s',
    title: 'Mercury Gravity Slingshot',
    summary:
      'First crewed gravity-assist maneuver validating the 1-G centrifuge under 2.1 G perihelion burns.',
  },
  {
    num: '03',
    code: 'HELIOS-3',
    date: 'JUN 2025',
    perihelion: '0.054 AU',
    velocity: '129.6 km/s',
    title: 'Alfvén Surface Entry',
    summary:
      'Crossed the Alfvén boundary into the magnetically dominated corona for direct switchback sampling.',
  },
  {
    num: '04',
    code: 'HELIOS-4',
    date: 'JAN 2026',
    perihelion: '0.044 AU',
    velocity: '136.5 km/s',
    title: 'X-Class Flare Traverse',
    summary:
      'Skirted an X-9 coronal mass ejection while the 14.2 T dipole attenuated proton flux by 99.96%.',
  },
  {
    num: '05',
    code: 'HELIOS-5',
    date: 'MAY 2026',
    perihelion: '0.041 AU',
    velocity: '139.8 km/s',
    title: 'Polar Inclination Pass',
    summary:
      '34° out-of-ecliptic crank via Venus assist, imaging polar coronal holes invisible from Earth.',
  },
  {
    num: '06',
    code: 'HELIOS-6',
    date: 'NOV 2026 // ACTIVE',
    perihelion: '0.038 AU',
    velocity: '142.4 km/s',
    title: 'Deep Perihelion Dive',
    summary:
      'Active flagship campaign at 5.68M km with 34 flight officers and 76 researchers onboard.',
  },
];

export const ARCHIVES = [
  {
    id: 'flare',
    category: 'solar',
    src: 'images/solar_flare_burst.webp',
    au: '0.038 AU',
    title: 'Active Region Magnetic Loop',
    caption: 'Extreme-UV filtered capture of a 280,000 km coronal flux rope at perihelion.',
    instrument: 'WISPR-5000 Coronagraph',
  },
  {
    id: 'vessel',
    category: 'vessel',
    src: 'images/hero_spaceship.webp',
    au: '0.040 AU',
    title: 'AC-5000 Solar Limb Flyby',
    caption: 'External recon drone frame holding attitude along the solar prominence rim.',
    instrument: 'Free-Flyer Pod B',
  },
  {
    id: 'prominence',
    category: 'solar',
    src: 'images/solar_prominence.webp',
    au: '0.042 AU',
    title: 'Eruptive Chromosphere Arc',
    caption: 'High-cadence plasma filament separating from the solar surface.',
    instrument: 'H-Alpha Spectrograph',
  },
  {
    id: 'bridge',
    category: 'vessel',
    src: 'images/cockpit_lounge.webp',
    au: '0.045 AU',
    title: 'Forward Umbra Observation Deck',
    caption: 'Sapphire viewports shielded inside the primary thermal shadow cone.',
    instrument: 'Deck 02 Optical Array',
  },
  {
    id: 'eva',
    category: 'crew',
    src: 'images/spacewalk_solar.webp',
    au: '0.180 AU',
    title: 'Thermal Tile Inspection EVA',
    caption: 'Flight engineer verifying gold-iridium lamina integrity during outbound cruise.',
    instrument: 'EVA Helmet Cam 04',
  },
  {
    id: 'engine',
    category: 'vessel',
    src: 'images/fusion_engine.webp',
    au: '0.050 AU',
    title: 'D-He³ Magnetic Nozzle Cluster',
    caption: 'Aft propulsion array during retrograde perihelion insertion burn.',
    instrument: 'Aft Boom Telemetry',
  },
  {
    id: 'lab',
    category: 'crew',
    src: 'images/solar_lab_research.webp',
    au: '0.040 AU',
    title: 'Heliophysics Telemetry Lab',
    caption: 'Science cadre analyzing live magnetogram reconstructions on Deck 04.',
    instrument: 'Internal Lab Archive',
  },
  {
    id: 'gateway',
    category: 'vessel',
    src: 'images/orbital_spaceport.webp',
    au: '1.000 AU',
    title: 'LEO Orbital Gateway 13',
    caption: 'AC-5000 berthed at 420 km equatorial orbit prior to trans-solar injection.',
    instrument: 'Dock 07 Camera',
  },
];

export const LEADERS = [
  {
    name: 'Dr. Anna Schwartz',
    role: 'Chief Heliophysicist // Science Lead',
    image: 'images/dr_anna_schwartz.webp',
    quote:
      'Crossing the Alfvén surface inside a crewed hull turned solar physics from remote inference into direct sampling.',
    meta: '42 peer-reviewed papers • Former Solar Probe Co-I',
  },
  {
    name: 'Cmdr. Marcus Thorne',
    role: 'Flight Director // AC-5000',
    image: 'images/commander_thorne.webp',
    quote:
      'At 0.038 AU your survival margin is a four-degree cone behind the shield. AC-5000 holds that line to a hundredth of a degree.',
    meta: '2,400+ interplanetary hours • 6 Perihelion Commands',
  },
];

export const CABIN_TIERS = [
  {
    id: 'observation',
    name: 'Observer Suite',
    short: 'Observer',
    price: 450000,
    deck: 'Ring Deck B • 1.00 G',
  },
  {
    id: 'research',
    name: 'Research Specialist Pod',
    short: 'Research',
    price: 850000,
    deck: 'Science Deck A • 1.00 G / 0 G',
  },
  {
    id: 'vip-quantum',
    name: 'Command Quantum Quarters',
    short: 'Command VIP',
    price: 1600000,
    deck: 'Forward Umbra Suite • 1.00 G',
  },
];

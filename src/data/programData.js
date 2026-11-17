export const VESSEL_MODULES = [
  {
    id: 'capsule',
    code: '01',
    label: 'Heat Shield',
    tag: 'heatShield_Mounting // Carbon-Carbon TPS',
    title: 'Thermal Protection Shield',
    summary:
      '11.43 cm carbon-composite foam core coated in white alumina ceramic, shielding instrumentation at 1,377 °C while keeping the spacecraft bus near 29 °C.',
    specs: [
      { key: 'Shield Width', value: '2.43 m' },
      { key: 'Front Temp', value: '1,377 °C' },
      { key: 'Bus Umbra', value: '29 °C' },
      { key: 'Composite', value: 'C-C + Al₂O₃' },
    ],
  },
  {
    id: 'hab',
    code: '02',
    label: 'Cooling & Bus',
    tag: 'CoolingSystem + BUS // Hexagonal Frame',
    title: 'Active Cooling & Avionics Bus',
    summary:
      'Pressurized deionized-water closed-loop radiator network circulating thermal energy away from the primary solar wings and flight avionics.',
    specs: [
      { key: 'Coolant', value: 'Deionized H₂O' },
      { key: 'Radiators', value: '5.1 m² Ti' },
      { key: 'Structure', value: 'Hex Carbon' },
      { key: 'Guidance', value: '7 Limb Sensors' },
    ],
  },
  {
    id: 'arrays',
    code: '03',
    label: 'Solar Wings',
    tag: 'solarWing_Left / Right // Articulated',
    title: 'Retractable Solar Arrays',
    summary:
      'Actuated dual photovoltaic wings that pivot inside the heat shield shadow cone as solar flux climbs past 475× terrestrial irradiance.',
    specs: [
      { key: 'Peak Flux', value: '650 kW/m²' },
      { key: 'Wingspan', value: '4.1 m' },
      { key: 'Cell Type', value: 'GaAs Triple' },
      { key: 'Output', value: '343 W Nom.' },
    ],
  },
  {
    id: 'prop',
    code: '04',
    label: 'Boom & HGA',
    tag: 'boom + magnetometers + HGA // Ka-Band',
    title: 'Magnetometer Boom & HGA',
    summary:
      'Aft 3.5-meter boom carrying fluxgate magnetometers and a Ka-band high-gain dish streaming coronal telemetry across 150 million km.',
    specs: [
      { key: 'Downlink', value: '32 GHz Ka' },
      { key: 'Boom Span', value: '3.50 m Aft' },
      { key: 'Top Speed', value: '692,000 km/h' },
      { key: 'Dish Size', value: '0.6 m Array' },
    ],
  },
];

export const DESTINATIONS = [
  {
    id: 'corona',
    name: 'Solar Corona',
    eyebrow: '0.046 AU // ALFVÉN SURFACE',
    toneClass: 'dest-solar',
    image: './images/nasa_sun_flare.webp',
    distance: '9.86 R☉',
    duration: '1,377 °C PEAK',
    summary:
      'Cross the magnetically dominated corona inside 10 solar radii where solar wind accelerates past Alfvén wave speed.',
  },
  {
    id: 'alfven',
    name: 'EUV Active Belt',
    eyebrow: 'AIA 131 Å // FLARE PLASMA',
    toneClass: 'dest-cyan',
    image: './images/nasa_sun_cyan.webp',
    distance: '0.054 AU',
    duration: '10 MK PLASMA',
    summary:
      'Navigate superheated magnetic reconnection ribbons resolved in extreme ultraviolet by NASA Solar Dynamics Observatory.',
  },
  {
    id: 'mercury',
    name: 'Cis-Lunar & Earth',
    eyebrow: 'LEO 420 KM // ARTEMIS DRO',
    toneClass: 'dest-violet',
    image: './images/nasa_blue_marble.webp',
    distance: '384,400 KM',
    duration: '7.66 KM/S',
    summary:
      'Orbital departure staging above Earth’s thermosphere linking ISS extravehicular assembly to deep-space Artemis orbits.',
  },
];

export const CHRONICLES = [
  {
    num: '01',
    year: '2018',
    mission: 'Parker-01',
    title: 'Delta IV Heavy Launch',
    body: 'Liftoff from Cape Canaveral LC-37B on the highest-energy Earth departure trajectory ever flown.',
    stats: [
      { label: 'PERIHELION', value: '24.8 M km' },
      { label: 'GRAVITY ASSIST', value: 'Venus-1' },
    ],
  },
  {
    num: '02',
    year: '2020',
    mission: 'Parker-04',
    title: 'Dust-Free Boundary',
    body: 'Confirmed the theoretical solar dust vaporization zone within 19 solar radii of the photosphere.',
    stats: [
      { label: 'PERIHELION', value: '18.7 M km' },
      { label: 'VELOCITY', value: '393,000 km/h' },
    ],
  },
  {
    num: '03',
    year: '2021',
    mission: 'Parker-08',
    title: 'Touching the Sun',
    body: 'First spacecraft to cross the Alfvén critical surface and sample magnetized coronal plasma in situ.',
    stats: [
      { label: 'PERIHELION', value: '10.4 M km' },
      { label: 'FLUX', value: '188 kW/m²' },
    ],
  },
  {
    num: '04',
    year: '2022',
    mission: 'Parker-14',
    title: 'CME Shock Transit',
    body: 'Flew directly through an erupting coronal mass ejection, mapping magnetic switchback acceleration.',
    stats: [
      { label: 'PERIHELION', value: '8.5 M km' },
      { label: 'VELOCITY', value: '586,800 km/h' },
    ],
  },
  {
    num: '05',
    year: '2024',
    mission: 'Parker-22',
    title: 'Closest Solar Flyby',
    body: 'Achieved 692,000 km/h at 9.86 solar radii — the fastest human-engineered vehicle in recorded history.',
    stats: [
      { label: 'PERIHELION', value: '6.1 M km' },
      { label: 'VELOCITY', value: '692,000 km/h' },
    ],
  },
  {
    num: '06',
    year: '2026',
    mission: 'Artemis-II',
    title: 'Lunar Free-Return',
    body: 'Crewed Orion flyby verifying deep-space life support, optical navigation, and high-altitude reentry.',
    stats: [
      { label: 'APOGEE', value: '384,400 km' },
      { label: 'CREW', value: '4 Astronauts' },
    ],
  },
];

export const ARCHIVES = [
  {
    id: 'eva-earth',
    category: 'crew',
    src: './images/nasa_eva_earth.webp',
    title: 'Orbital EVA Over Earth Limb',
    au: 'LEO · 418 KM',
    instrument: 'ISS Extravehicular Cam',
    caption:
      'NASA astronaut performing exterior truss maintenance above Earth’s sunlit curvature.',
  },
  {
    id: 'sdo-flare',
    category: 'solar',
    src: './images/nasa_sun_flare.webp',
    title: 'Active Region Solar Eruption',
    au: '1.00 AU · SDO',
    instrument: 'AIA 171-304 Å Composite',
    caption:
      'Extreme ultraviolet composite capturing 10-million-kelvin coronal loops and flare filaments.',
  },
  {
    id: 'iss-horizon',
    category: 'vessel',
    src: './images/nasa_iss_earth.webp',
    title: 'Docked Orbital Complex',
    au: 'LEO · 408 KM',
    instrument: 'Crew Flyaround Survey',
    caption:
      'Radiator panels and pressurized docking modules suspended over Earth’s Rayleigh-blue horizon.',
  },
  {
    id: 'orion-moon',
    category: 'vessel',
    src: './images/nasa_orion_moon.webp',
    title: 'Orion Lunar Orbit Inspection',
    au: '384,400 KM · DRO',
    instrument: 'Solar Wing Optical Cam',
    caption:
      'European Service Module and Orion crew capsule photographed against far-side lunar highlands.',
  },
  {
    id: 'sdo-cyan',
    category: 'solar',
    src: './images/nasa_sun_cyan.webp',
    title: '131 Å Flare Plasma Arc',
    au: '1.00 AU · AIA 131',
    instrument: 'Extreme UV Telescope',
    caption:
      'Teal-mapped iron-XXI emission tracing superheated plasma ribbons above an active sunspot group.',
  },
  {
    id: 'iss-black',
    category: 'vessel',
    src: './images/nasa_iss_black.webp',
    title: 'Solar Array Truss Geometry',
    au: 'LEO · SPACE',
    instrument: 'Orbital Survey Camera',
    caption:
      'Kapton-gold photovoltaic blankets spanning 73 meters across against unfiltered deep-space black.',
  },
  {
    id: 'jpl-control',
    category: 'crew',
    src: './images/nasa_jpl_control.webp',
    title: 'Deep Space Network Floor',
    au: '32 GHz · JPL SFOF',
    instrument: 'Goldstone / Madrid / Canberra',
    caption:
      'Dark-room flight operations floor tracking interplanetary spacecraft downlinks across the solar system.',
  },
  {
    id: 'blue-marble',
    category: 'solar',
    src: './images/nasa_blue_marble.webp',
    title: 'Apollo 17 Blue Marble',
    au: '29,000 KM · TLC',
    instrument: 'Hasselblad 500EL · 80mm',
    caption:
      'Uncropped full-illuminated planetary disk photographed during trans-lunar coast.',
  },
];

export const LEADERS = [
  {
    name: 'Jasmin Moghbeli',
    role: 'EXPEDITION COMMANDER // NASA ASTRONAUT',
    quote:
      'Standing in the cupola while solar arrays catch orbital sunrise reminds you how thin the boundary is between Earth and deep space.',
    meta: 'ISS Expedition 70 · USMC Test Pilot · Official NASA Portrait',
    image: './images/nasa_crew_moghbeli.webp',
  },
  {
    name: 'Nick Hague',
    role: 'FLIGHT OPERATIONS // NASA ASTRONAUT',
    quote:
      'Every telemetry check, thermal shield tolerance, and EVA procedure exists so crews can push farther with absolute precision.',
    meta: 'Expedition 59/60 · SpaceX Crew-9 · Official NASA Portrait',
    image: './images/nasa_crew_hague.webp',
  },
];

export const CABIN_TIERS = [
  {
    id: 'observer',
    name: 'Telemetry Deck',
    rate: 280000,
    summary: 'Ka-band DSN live telemetry · Orbital observation bay',
  },
  {
    id: 'specialist',
    name: 'Payload Specialist',
    rate: 440000,
    summary: 'Coronal instrument slot · EVA airlock deck',
  },
  {
    id: 'command',
    name: 'Command Suite',
    rate: 690000,
    summary: 'Primary flight deck berth · Full Artemis clearance',
  },
];

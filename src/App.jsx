import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import CosmicStage from './components/CosmicStage';
import Navbar from './components/Navbar';
import HeroAct from './components/HeroAct';
import OrbiterAct from './components/OrbiterAct';
import JourneysAct from './components/JourneysAct';
import ArchivesAct from './components/ArchivesAct';
import FinaleAct from './components/FinaleAct';
import { VESSEL_MODULES } from './data/programData';
import { soundscape } from './utils/soundscape';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [activeAct, setActiveAct] = useState('hero');
  const [activeModule, setActiveModule] = useState('capsule');
  const [explodeAmount, setExplodeAmount] = useState(0);
  const [bookingPreset, setBookingPreset] = useState(null);

  const manualModuleLockRef = useRef(false);
  const lenisRef = useRef(null);
  const orbiterPinRef = useRef(null);
  const chronicleSectionRef = useRef(null);
  const chronicleTrackRef = useRef(null);
  const ambientRef = useRef(null);

  const scrollStateRef = useRef({
    progress: 0,
    velocity: 0,
    explodeAmount: 0,
  });

  const telemetryRefs = {
    distRef: useRef(null),
    fluxRef: useRef(null),
    velRef: useRef(null),
    progressRef: useRef(null),
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: reducedMotion ? 0 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reducedMotion,
    });
    lenisRef.current = lenis;

    const syncTelemetry = (progress, velocity) => {
      scrollStateRef.current.progress = progress;
      scrollStateRef.current.velocity = velocity;

      const curve = Math.pow(progress, 1.25);
      const distAu = 1.0 - curve * (1.0 - 0.038);
      const fluxKw = 1.361 / (distAu * distAu);
      const velocityKms = 7.7 + curve * (142.4 - 7.7);

      if (telemetryRefs.distRef.current) {
        telemetryRefs.distRef.current.textContent = `${distAu.toFixed(3)} AU`;
      }
      if (telemetryRefs.fluxRef.current) {
        telemetryRefs.fluxRef.current.textContent =
          fluxKw >= 100 ? `${fluxKw.toFixed(1)} kW/m²` : `${fluxKw.toFixed(2)} kW/m²`;
      }
      if (telemetryRefs.velRef.current) {
        telemetryRefs.velRef.current.textContent = `${velocityKms.toFixed(1)} km/s`;
      }
      if (telemetryRefs.progressRef.current) {
        telemetryRefs.progressRef.current.style.transform = `scaleX(${Math.max(0.03, progress)})`;
      }

      // Dynamic cosmic color-grade crossfade (Blue LEO -> Solar Corona -> Warm Horizon)
      if (ambientRef.current) {
        const solarAlpha = progress > 0.38 && progress < 0.85
          ? Math.sin(((progress - 0.38) / 0.47) * Math.PI) * 0.55
          : 0;
        const blueAlpha = progress < 0.48 ? 1 - progress / 0.48 : 0;
        ambientRef.current.style.setProperty('--blue-grade', blueAlpha.toFixed(3));
        ambientRef.current.style.setProperty('--solar-grade', solarAlpha.toFixed(3));
      }

      soundscape.modulate(velocity, progress);
    };

    lenis.on('scroll', ({ progress, velocity }) => {
      ScrollTrigger.update();
      syncTelemetry(progress || 0, velocity || 0);
    });

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      ['hero', 'orbiter', 'journeys', 'archives', 'clearance'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 45%',
          end: 'bottom 45%',
          onEnter: () => setActiveAct(id),
          onEnterBack: () => setActiveAct(id),
        });
      });

      if (!reducedMotion) {
        // Act II: Pinned ORBITA-style 3D showcase + module separation
        if (orbiterPinRef.current) {
          ScrollTrigger.create({
            trigger: orbiterPinRef.current,
            start: 'top top',
            end: '+=1800',
            pin: true,
            scrub: 0.65,
            onUpdate: (self) => {
              const p = self.progress;
              const explode = p < 0.2 ? p / 0.2 : p > 0.88 ? (1 - p) / 0.12 : 1;
              scrollStateRef.current.explodeAmount = explode;
              setExplodeAmount(explode);

              if (!manualModuleLockRef.current) {
                const idx = Math.min(
                  VESSEL_MODULES.length - 1,
                  Math.floor(p * VESSEL_MODULES.length)
                );
                setActiveModule(VESSEL_MODULES[idx].id);
              }
            },
            onLeave: () => {
              manualModuleLockRef.current = false;
              scrollStateRef.current.explodeAmount = 0;
              setExplodeAmount(0);
            },
            onLeaveBack: () => {
              manualModuleLockRef.current = false;
              scrollStateRef.current.explodeAmount = 0;
              setExplodeAmount(0);
            },
          });
        }

        // Act III: Desktop horizontal pinned chronicle
        const mm = gsap.matchMedia();
        mm.add('(min-width: 960px)', () => {
          const section = chronicleSectionRef.current;
          const track = chronicleTrackRef.current;
          if (!section || !track) return;

          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 140);
          gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${Math.max(900, distance())}`,
              pin: true,
              scrub: 0.85,
              invalidateOnRefresh: true,
            },
          });
        });
      }
    });

    syncTelemetry(0, 0);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      soundscape.dispose();
    };
  }, []);

  const handleNavigate = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: 0 });
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectModule = (id) => {
    manualModuleLockRef.current = true;
    setActiveModule(id);
    if (scrollStateRef.current.explodeAmount < 0.7) {
      scrollStateRef.current.explodeAmount = 1;
      setExplodeAmount(1);
    }
  };

  const handleSelectDestination = (dest) => {
    setBookingPreset({ tierId: dest.tierDefault });
    handleNavigate('clearance');
  };

  const handleHeroPreset = ({ destination, launchWindow, guests }) => {
    const tierMap = {
      corona: 'vip-quantum',
      alfven: 'research',
      mercury: 'observation',
    };
    setBookingPreset({
      tierId: tierMap[destination] || 'observation',
      launchWindow,
      guests,
    });
  };

  return (
    <div ref={ambientRef} className="cosmos-shell">
      {/* Dynamic deep-space radial atmosphere layer (z-index: 0) */}
      <div className="ambient-backdrop" aria-hidden="true" />

      {/* Persistent transparent Three.js WebGL stage (z-index: 2) */}
      <CosmicStage scrollStateRef={scrollStateRef} activeModule={activeModule} />

      {/* Minimal Floating Top Navigation & Live Telemetry */}
      <Navbar
        activeAct={activeAct}
        onNavigate={handleNavigate}
        telemetryRefs={telemetryRefs}
      />

      <main className="acts-flow">
        <HeroAct onNavigate={handleNavigate} onApplyPreset={handleHeroPreset} />

        <OrbiterAct
          pinRef={orbiterPinRef}
          activeModule={activeModule}
          onSelectModule={handleSelectModule}
          explodeAmount={explodeAmount}
        />

        <JourneysAct
          chronicleSectionRef={chronicleSectionRef}
          chronicleTrackRef={chronicleTrackRef}
          onSelectDestination={handleSelectDestination}
        />

        <ArchivesAct />

        <FinaleAct preset={bookingPreset} onNavigate={handleNavigate} />
      </main>
    </div>
  );
}

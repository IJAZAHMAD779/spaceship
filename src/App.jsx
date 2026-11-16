import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SpaceCanvas from './components/SpaceCanvas';
import HudChrome from './components/HudChrome';
import HeroChapter from './components/HeroChapter';
import EngineeringChapter from './components/EngineeringChapter';
import MissionsChapter from './components/MissionsChapter';
import ArchivesChapter from './components/ArchivesChapter';
import BookingChapter from './components/BookingChapter';
import { SUBSYSTEMS } from './data/missionData';
import { audioEngine } from './utils/audioEngine';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubsystem, setActiveSubsystem] = useState('shield');
  const [explodeAmount, setExplodeAmount] = useState(0);

  const manualSubsystemLockRef = useRef(false);
  const lenisRef = useRef(null);
  const engineeringPinRef = useRef(null);
  const missionsSectionRef = useRef(null);
  const missionsTrackRef = useRef(null);

  // Shared mutable state read at 60fps inside Three.js RAF loop
  const scrollStateRef = useRef({
    progress: 0,
    velocity: 0,
    explodeAmount: 0,
  });

  // Direct DOM refs for 60fps tabular telemetry without React re-renders
  const telemetryRefs = {
    distRef: useRef(null),
    fluxRef: useRef(null),
    tempRef: useRef(null),
    velRef: useRef(null),
    progressBarRef: useRef(null),
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: reducedMotion ? 0 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reducedMotion,
    });
    lenisRef.current = lenis;

    const updateTelemetry = (progress, velocity) => {
      scrollStateRef.current.progress = progress;
      scrollStateRef.current.velocity = velocity;

      // Physically coupled inverse-square solar descent from 1.000 AU -> 0.038 AU
      // Non-linear approach curve so AU drops fast during perihelion plunge
      const curve = Math.pow(progress, 1.25);
      const distAu = 1.0 - curve * (1.0 - 0.038);
      const fluxKw = 1.361 / (distAu * distAu); // kW/m^2 (1.361 at 1 AU -> 942.5 at 0.038 AU)
      const shieldTemp = 118 + Math.pow(fluxKw / 942.5, 0.42) * 1722;
      const velocityKms = 7.7 + curve * (142.4 - 7.7);

      if (telemetryRefs.distRef.current) {
        telemetryRefs.distRef.current.textContent = `${distAu.toFixed(3)} AU`;
      }
      if (telemetryRefs.fluxRef.current) {
        telemetryRefs.fluxRef.current.textContent =
          fluxKw >= 100 ? `${fluxKw.toFixed(1)} kW/m²` : `${fluxKw.toFixed(2)} kW/m²`;
      }
      if (telemetryRefs.tempRef.current) {
        telemetryRefs.tempRef.current.textContent = `${Math.round(shieldTemp).toLocaleString()} °C`;
      }
      if (telemetryRefs.velRef.current) {
        telemetryRefs.velRef.current.textContent = `${velocityKms.toFixed(1)} km/s`;
      }
      if (telemetryRefs.progressBarRef.current) {
        telemetryRefs.progressBarRef.current.style.transform = `scaleX(${Math.max(0.02, progress)})`;
      }

      audioEngine.updateFromScroll(velocity, progress);
    };

    lenis.on('scroll', ({ progress, velocity }) => {
      ScrollTrigger.update();
      updateTelemetry(progress || 0, velocity || 0);
    });

    const onTick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Chapter active state tracking
      ['overview', 'engineering', 'missions', 'archives', 'clearance'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 45%',
          end: 'bottom 45%',
          onEnter: () => setActiveSection(id),
          onEnterBack: () => setActiveSection(id),
        });
      });

      if (!reducedMotion) {
        // Chapter 2: Pinned 3D Engineering Explosion & Subsystem Scrubbing
        if (engineeringPinRef.current) {
          ScrollTrigger.create({
            trigger: engineeringPinRef.current,
            start: 'top top',
            end: '+=1600',
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => {
              const p = self.progress;
              // Ramp explode up cleanly in first 25%, hold through inspection, settle slightly at end
              const explode = p < 0.25 ? p / 0.25 : p > 0.88 ? (1 - p) / 0.12 : 1;
              scrollStateRef.current.explodeAmount = explode;
              setExplodeAmount(explode);

              if (!manualSubsystemLockRef.current) {
                const idx = Math.min(
                  SUBSYSTEMS.length - 1,
                  Math.floor(p * SUBSYSTEMS.length)
                );
                setActiveSubsystem(SUBSYSTEMS[idx].id);
              }
            },
            onLeave: () => {
              manualSubsystemLockRef.current = false;
              scrollStateRef.current.explodeAmount = 0;
              setExplodeAmount(0);
            },
            onLeaveBack: () => {
              manualSubsystemLockRef.current = false;
              scrollStateRef.current.explodeAmount = 0;
              setExplodeAmount(0);
            },
          });
        }

        // Chapter 3: Desktop Horizontal Pinned Mission Track
        const mm = gsap.matchMedia();
        mm.add('(min-width: 960px)', () => {
          const section = missionsSectionRef.current;
          const track = missionsTrackRef.current;
          if (!section || !track) return;

          const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 120);

          gsap.to(track, {
            x: () => -getDistance(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${Math.max(900, getDistance())}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });
        });
      }
    });

    updateTelemetry(0, 0);

    return () => {
      ctx.revert();
      gsap.ticker.remove(onTick);
      lenis.destroy();
      audioEngine.dispose();
    };
  }, []);

  const handleNavigate = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -72 });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectSubsystem = (id) => {
    manualSubsystemLockRef.current = true;
    setActiveSubsystem(id);
    if (scrollStateRef.current.explodeAmount < 0.75) {
      scrollStateRef.current.explodeAmount = 1;
      setExplodeAmount(1);
    }
  };

  return (
    <div className="app-shell">
      <SpaceCanvas scrollStateRef={scrollStateRef} activeSubsystem={activeSubsystem} />

      <HudChrome
        activeSection={activeSection}
        onNavigate={handleNavigate}
        telemetryRefs={telemetryRefs}
      />

      <main className="scroll-stage">
        <HeroChapter onNavigate={handleNavigate} />

        <EngineeringChapter
          pinRef={engineeringPinRef}
          activeSubsystem={activeSubsystem}
          onSelectSubsystem={handleSelectSubsystem}
          explodeAmount={explodeAmount}
        />

        <MissionsChapter
          sectionRef={missionsSectionRef}
          trackRef={missionsTrackRef}
        />

        <ArchivesChapter />

        <BookingChapter />
      </main>
    </div>
  );
}

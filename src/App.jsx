import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import CosmicStage from './components/CosmicStage';
import Navbar from './components/Navbar';
import HeroAct from './components/HeroAct';
import OrbiterAct from './components/OrbiterAct';
import JourneysAct from './components/JourneysAct';
import ArchivesAct from './components/ArchivesAct';
import FinaleAct from './components/FinaleAct';
import { soundscape } from './utils/soundscape';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [activeAct, setActiveAct] = useState('hero');
  const [activeModule, setActiveModule] = useState('capsule');
  const [preset, setPreset] = useState({
    destination: 'corona',
    launchWindow: '2026-11-14',
    guests: 1,
  });

  const shellRef = useRef(null);
  const lenisRef = useRef(null);
  const distRef = useRef(null);
  const fluxRef = useRef(null);
  const velRef = useRef(null);
  const progressRef = useRef(null);

  const scrollStateRef = useRef({
    progress: 0,
    velocity: 0,
    explodeAmount: 0,
  });

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: reducedMotion ? 0 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reducedMotion,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      scrollStateRef.current.velocity = e.velocity || 0;
    });

    const onTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '.cosmos-shell',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          scrollStateRef.current.progress = p;
          soundscape.modulate(scrollStateRef.current.velocity, p);

          const au = Math.max(0.046, 1.0 - Math.pow(p, 0.9) * 0.954);
          const flux = 1.36 / (au * au);
          const vel = 7.7 + Math.pow(p, 1.25) * 184.3;

          if (distRef.current) distRef.current.textContent = `${au.toFixed(3)} AU`;
          if (fluxRef.current) {
            fluxRef.current.textContent =
              flux >= 100 ? `${Math.round(flux)} kW/m²` : `${flux.toFixed(2)} kW/m²`;
          }
          if (velRef.current) velRef.current.textContent = `${vel.toFixed(1)} km/s`;
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
          }

          // Subtle dark-mode grade shift only (never brightens out of dark space theme)
          if (shellRef.current) {
            const solarMix = Math.max(0, Math.min(1, (p - 0.35) * 1.4));
            const blueMix = Math.max(0.2, 1 - solarMix * 0.65);
            shellRef.current.style.setProperty('--blue-grade', blueMix.toFixed(3));
            shellRef.current.style.setProperty('--solar-grade', (solarMix * 0.42).toFixed(3));
          }
        },
      });

      // Act I -> Act II subtle hero depth parallax
      gsap.to('.hero-wordmark-back, .hero-wordmark-front', {
        yPercent: -24,
        opacity: 0.14,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Act II: Pin Parker Solar Probe Blueprint + sub-mesh explosion
      ScrollTrigger.create({
        trigger: '.orbiter-act',
        start: 'top top',
        end: '+=160%',
        pin: '.orbiter-pin-stage',
        scrub: 0.6,
        onUpdate: (self) => {
          const ep = self.progress;
          scrollStateRef.current.explodeAmount = Math.sin(ep * Math.PI);
          if (ep < 0.25) setActiveModule('capsule');
          else if (ep < 0.5) setActiveModule('hab');
          else if (ep < 0.75) setActiveModule('arrays');
          else setActiveModule('prop');
        },
      });

      // Act III: Desktop horizontal-scrubbed chronicle strip
      const mm = gsap.matchMedia();
      mm.add('(min-width: 960px)', () => {
        const track = document.querySelector('.chronicle-track');
        if (!track) return;
        const getScrollWidth = () => Math.max(0, track.scrollWidth - window.innerWidth + 120);

        gsap.to(track, {
          x: () => -getScrollWidth(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.chronicle-pin-wrap',
            start: 'top top',
            end: () => `+=${Math.max(1000, getScrollWidth())}`,
            pin: true,
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        });
      });

      ['hero', 'orbiter', 'journeys', 'archives', 'clearance'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 52%',
          end: 'bottom 52%',
          onEnter: () => setActiveAct(id),
          onEnterBack: () => setActiveAct(id),
        });
      });
    }, shellRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(onTick);
      lenis.destroy();
      soundscape.dispose();
    };
  }, []);

  const navigateTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 1.25 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={shellRef} className="cosmos-shell">
      <div className="ambient-backdrop" aria-hidden="true" />
      <CosmicStage scrollStateRef={scrollStateRef} activeModule={activeModule} />

      <Navbar
        activeAct={activeAct}
        onNavigate={navigateTo}
        telemetryRefs={{ distRef, fluxRef, velRef, progressRef }}
      />

      <main className="acts-flow">
        <HeroAct
          onNavigate={navigateTo}
          onApplyPreset={(next) => setPreset((prev) => ({ ...prev, ...next }))}
        />

        <OrbiterAct activeModule={activeModule} onSelectModule={setActiveModule} />

        <JourneysAct
          onJumpToClearance={(destId) => {
            setPreset((prev) => ({ ...prev, destination: destId }));
            navigateTo('clearance');
          }}
        />

        <ArchivesAct />

        <FinaleAct preset={preset} onNavigate={navigateTo} />
      </main>
    </div>
  );
}

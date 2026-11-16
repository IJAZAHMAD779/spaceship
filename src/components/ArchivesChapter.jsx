import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GALLERY_ITEMS, CREW_LEADERS, FAQS } from '../data/missionData';
import { audioEngine } from '../utils/audioEngine';

const FILTERS = [
  { id: 'all', label: 'All Frames' },
  { id: 'solar', label: 'Solar Corona' },
  { id: 'vessel', label: 'Vessel & Hardware' },
  { id: 'crew', label: 'Crew & Operations' },
];

export default function ArchivesChapter() {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  const visibleItems =
    filter === 'all' ? GALLERY_ITEMS : GALLERY_ITEMS.filter((item) => item.category === filter);

  const selectedIndex = visibleItems.findIndex((item) => item.id === selectedId);
  const selectedItem = selectedIndex >= 0 ? visibleItems[selectedIndex] : null;

  useEffect(() => {
    if (!selectedItem) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedId(null);
      if (e.key === 'ArrowRight') {
        const next = visibleItems[(selectedIndex + 1) % visibleItems.length];
        if (next) setSelectedId(next.id);
      }
      if (e.key === 'ArrowLeft') {
        const prev = visibleItems[(selectedIndex - 1 + visibleItems.length) % visibleItems.length];
        if (prev) setSelectedId(prev.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedItem, selectedIndex, visibleItems]);

  return (
    <section id="archives" className="chapter archives-chapter">
      <div className="container">
        <div className="archives-top">
          <div>
            <span className="mono-tag">CHAPTER 04 // OPTICAL ARCHIVES & PERSONNEL</span>
            <h2 className="section-heading">4K Telemetry Captures</h2>
          </div>

          <div className="filter-bar" role="group" aria-label="Filter archive frames">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    audioEngine.playClick(820);
                    setFilter(f.id);
                  }}
                  className={`filter-pill ${active ? 'is-active' : ''}`}
                >
                  {active && (
                    <motion.span
                      layoutId="archive-filter-pill"
                      className="filter-pill-bg"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="filter-pill-label">{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div layout className="archive-grid">
          <AnimatePresence>
            {visibleItems.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                layout
                layoutId={`archive-card-${item.id}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  audioEngine.playClick(960);
                  setSelectedId(item.id);
                }}
                className="archive-card"
              >
                <div className="archive-thumb">
                  <img src={item.src} alt={item.title} loading="lazy" />
                </div>
                <div className="archive-meta">
                  <div className="archive-meta-row">
                    <span className="mono-tag amber">{item.au}</span>
                    <span className="mono-tag muted">{item.instrument}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.caption}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Command & Science Leadership */}
        <div className="crew-block">
          <div className="section-subhead">
            <span className="mono-tag">FLIGHT CADRE // COMMAND & HELIOPHYSICS</span>
            <h3>Expedition Leadership</h3>
          </div>

          <div className="crew-grid">
            {CREW_LEADERS.map((leader) => (
              <article key={leader.name} className="leader-card">
                <img src={leader.image} alt={leader.name} className="leader-portrait" loading="lazy" />
                <div className="leader-body">
                  <span className="mono-tag cyan">{leader.role}</span>
                  <h4>{leader.name}</h4>
                  <blockquote>“{leader.quote}”</blockquote>
                  <div className="leader-creds">{leader.credentials}</div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Accessible Framer Motion FAQ */}
        <div className="faq-block">
          <div className="section-subhead">
            <span className="mono-tag">MISSION BRIEFING // TECHNICAL FAQ</span>
            <h3>Operational Parameters</h3>
          </div>

          <div className="faq-stack">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={item.q} className={`faq-row ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    onClick={() => {
                      audioEngine.playClick(740);
                      setOpenFaq(isOpen ? -1 : idx);
                    }}
                  >
                    <span>{item.q}</span>
                    <span className="faq-plus" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="faq-content-wrap"
                      >
                        <p className="faq-content">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Shared-Element Framer Motion Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.title}
          >
            <motion.div
              layoutId={`archive-card-${selectedItem.id}`}
              className="lightbox-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lightbox-topbar">
                <span className="mono-tag amber">
                  {selectedItem.au} // {selectedItem.instrument}
                </span>
                <div className="lightbox-nav-btns">
                  <button
                    type="button"
                    aria-label="Previous frame"
                    onClick={() =>
                      setSelectedId(
                        visibleItems[(selectedIndex - 1 + visibleItems.length) % visibleItems.length].id
                      )
                    }
                  >
                    PREV
                  </button>
                  <button
                    type="button"
                    aria-label="Next frame"
                    onClick={() =>
                      setSelectedId(visibleItems[(selectedIndex + 1) % visibleItems.length].id)
                    }
                  >
                    NEXT
                  </button>
                  <button
                    type="button"
                    aria-label="Close frame inspector"
                    onClick={() => setSelectedId(null)}
                  >
                    CLOSE [ESC]
                  </button>
                </div>
              </div>

              <div className="lightbox-frame">
                <img src={selectedItem.src} alt={selectedItem.title} />
              </div>

              <div className="lightbox-caption">
                <div>
                  <h3>{selectedItem.title}</h3>
                  <p>{selectedItem.caption}</p>
                </div>
                <span className="mono-tag muted">{selectedItem.exposure}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

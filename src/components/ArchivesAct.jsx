import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ARCHIVES, LEADERS } from '../data/programData';
import { soundscape } from '../utils/soundscape';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'solar', label: 'Corona' },
  { id: 'vessel', label: 'Vessel' },
  { id: 'crew', label: 'Operations' },
];

export default function ArchivesAct() {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const items = filter === 'all' ? ARCHIVES : ARCHIVES.filter((a) => a.category === filter);
  const selectedIndex = items.findIndex((i) => i.id === selectedId);
  const selected = selectedIndex >= 0 ? items[selectedIndex] : null;

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedId(null);
      if (e.key === 'ArrowRight') {
        const next = items[(selectedIndex + 1) % items.length];
        if (next) setSelectedId(next.id);
      }
      if (e.key === 'ArrowLeft') {
        const prev = items[(selectedIndex - 1 + items.length) % items.length];
        if (prev) setSelectedId(prev.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, selectedIndex, items]);

  return (
    <section id="archives" className="act archives-act">
      <div className="container">
        <div className="archives-header-row">
          <div>
            <span className="eyebrow-micro cyan">04 // NASA OPTICAL ARCHIVE</span>
            <h2>
              Solar <em className="serif-italic">Frames.</em>
            </h2>
          </div>

          <div className="archive-tabs" role="group" aria-label="Filter archive captures">
            {TABS.map((t) => {
              const active = filter === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    soundscape.tick(820);
                    setFilter(t.id);
                  }}
                  className={`archive-tab ${active ? 'is-active' : ''}`}
                >
                  {active && (
                    <motion.span
                      layoutId="archive-tab-bg"
                      className="archive-tab-bg"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="archive-tab-lbl">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.div layout className="archives-masonry">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.button
                key={item.id}
                type="button"
                layout
                layoutId={`frame-${item.id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  soundscape.tick(960);
                  setSelectedId(item.id);
                }}
                className={`archive-tile ${idx === 0 || idx === 3 ? 'is-wide' : ''}`}
              >
                <img src={item.src} alt={item.title} loading="lazy" />
                <div className="tile-caption">
                  <div className="tile-caption-top">
                    <span className="eyebrow-micro solar">{item.au}</span>
                    <span className="eyebrow-micro muted">{item.instrument}</span>
                  </div>
                  <h3>{item.title}</h3>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        <div className="leaders-section">
          <div className="leaders-intro">
            <span className="eyebrow-micro solar">FLIGHT CREW</span>
            <h3>
              Command <em className="serif-italic">Roster.</em>
            </h3>
          </div>

          <div className="leaders-grid">
            {LEADERS.map((leader) => (
              <article key={leader.name} className="leader-row">
                <img src={leader.image} alt={leader.name} loading="lazy" />
                <div>
                  <span className="eyebrow-micro cyan">{leader.role}</span>
                  <h4>{leader.name}</h4>
                  <p className="leader-quote">{leader.fact}</p>
                  <span className="leader-meta">{leader.meta}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
          >
            <motion.div
              layoutId={`frame-${selected.id}`}
              className="modal-frame-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-bar">
                <span className="eyebrow-micro solar">
                  {selected.au} // {selected.instrument}
                </span>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedId(items[(selectedIndex - 1 + items.length) % items.length].id)
                    }
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedId(items[(selectedIndex + 1) % items.length].id)}
                  >
                    Next
                  </button>
                  <button type="button" onClick={() => setSelectedId(null)}>
                    ESC
                  </button>
                </div>
              </div>

              <div className="modal-media">
                <img src={selected.src} alt={selected.title} />
              </div>

              <div className="modal-foot">
                <h3>{selected.title}</h3>
                <p>{selected.caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

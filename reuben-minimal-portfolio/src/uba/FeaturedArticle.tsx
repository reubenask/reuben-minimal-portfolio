import { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Clock3, Image as ImageIcon, X } from 'lucide-react';

import articleMarkdown from '../../assets/articles/the-tyranny-of-the-default.md?raw';

const figureOne = new URL('../../assets/articles/figure1-positioning.svg', import.meta.url).href;
const figureTwo = new URL('../../assets/articles/figure2-novelty.svg', import.meta.url).href;

const featuredArticle = {
  title: 'The Tyranny of the Default',
  subtitle: 'Toward a User Behavior Architecture',
  date: 'June 2026',
  readingTime: '8 min read',
  abstract:
    'A position essay arguing that adaptive systems should change around people, rather than demanding that people continually adapt to fixed systems.',
};

type ArticleBlock =
  | { type: 'heading'; level: number; text: string }
  | { type: 'figure'; src: string; alt: string }
  | { type: 'paragraph'; text: string };

function parseArticle(markdown: string): ArticleBlock[] {
  return markdown
    .trim()
    .split(/\n\s*\n/)
    .flatMap((block): ArticleBlock[] => {
      const value = block.trim();
      const heading = value.match(/^(#{1,3})\s+(.+)$/);
      if (heading) return [{ type: 'heading', level: heading[1].length, text: heading[2] }];

      const image = value.match(/^!\[([^\]]+)]\(([^)]+)\)$/);
      if (image) {
        return [{
          type: 'figure',
          alt: image[1],
          src: image[2].includes('figure1') ? figureOne : figureTwo,
        }];
      }

      return [{ type: 'paragraph', text: value.replace(/\n/g, ' ') }];
    });
}

function InlineText({ text }: { text: string }) {
  const normalized = text.replace(/\*/g, '');
  const parts = normalized.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith('http') ? (
          <a key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer">
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  );
}

export function FeaturedArticlePreview({ onRead }: { onRead: () => void }) {
  return (
    <>
      <div style={{
        padding: '13px',
        borderRadius: 18,
        color: '#F9F1E4',
        background: 'linear-gradient(145deg, #173E34 0%, #0D2521 58%, #13201C 100%)',
        boxShadow: '0 20px 55px rgba(22,62,52,0.18)',
      }}>
        <div style={{ color: '#83E5D6', fontSize: 8, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Featured Essay
        </div>
        <h3 style={{ margin: '8px 0 3px', fontSize: 16, lineHeight: 1.2, letterSpacing: 0 }}>
          {featuredArticle.title}
        </h3>
        <p style={{ margin: 0, color: '#D5C6AD', fontSize: 9.5, lineHeight: 1.45 }}>
          {featuredArticle.subtitle}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, color: '#9BBAB3', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span>{featuredArticle.date}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock3 size={10} /> {featuredArticle.readingTime}</span>
        </div>
      </div>

      <p style={{ margin: 0, color: '#43554D', fontSize: 10, lineHeight: 1.6 }}>
        {featuredArticle.abstract}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[figureOne, figureTwo].map((src, index) => (
          <div key={src} style={{
            minWidth: 0,
            padding: 7,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.56)',
            border: '1px solid rgba(79,65,42,0.12)',
          }}>
            <img src={src} alt={`Essay figure ${index + 1}`} style={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'contain' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, color: '#746850', fontSize: 7.5, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              <ImageIcon size={9} /> Figure {index + 1}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onRead}
        style={{
          width: '100%',
          border: '1px solid rgba(15,118,110,0.34)',
          borderRadius: 999,
          background: 'rgba(15,118,110,0.12)',
          color: '#173E34',
          padding: '10px 12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        <BookOpen size={12} /> Read Full Essay <ArrowUpRight size={12} />
      </button>
    </>
  );
}

export function ArticleReader({ open, onClose }: { open: boolean; onClose: () => void }) {
  const blocks = useMemo(() => parseArticle(articleMarkdown), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(4,10,8,0.76)',
            backdropFilter: 'blur(18px)',
            padding: 'clamp(10px, 3vw, 34px)',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          <motion.article
            initial={{ y: 24, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: 'min(100%, 920px)',
              height: '100%',
              margin: '0 auto',
              overflowY: 'auto',
              borderRadius: 22,
              background: '#FBF5E9',
              color: '#26362F',
              boxShadow: '0 36px 120px rgba(0,0,0,0.46)',
              border: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <header style={{
              position: 'relative',
              padding: 'clamp(30px, 7vw, 72px) clamp(22px, 8vw, 86px) clamp(26px, 5vw, 52px)',
              background: 'linear-gradient(145deg, #143C33, #0B211D)',
              color: '#F9F2E7',
            }}>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close article"
                style={{
                  position: 'absolute', top: 16, right: 16, width: 34, height: 34,
                  borderRadius: 999, border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.08)', color: '#F9F2E7', cursor: 'pointer',
                  display: 'grid', placeItems: 'center',
                }}
              >
                <X size={15} />
              </button>
              <div style={{ color: '#83E5D6', fontSize: 9, fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                User Behavior Architecture · Position Essay
              </div>
              <h1 style={{ margin: '18px 0 8px', maxWidth: 680, fontFamily: 'Georgia, serif', fontSize: 'clamp(30px, 5vw, 58px)', lineHeight: 1.02, letterSpacing: 0 }}>
                {featuredArticle.title}
              </h1>
              <p style={{ margin: 0, color: '#D8C9B2', fontSize: 'clamp(13px, 2vw, 18px)', lineHeight: 1.5 }}>
                {featuredArticle.subtitle}
              </p>
              <div style={{ display: 'flex', gap: 18, marginTop: 24, color: '#9DBCB5', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <span>{featuredArticle.date}</span><span>{featuredArticle.readingTime}</span>
              </div>
            </header>

            <div className="uba-article-body" style={{ padding: 'clamp(26px, 7vw, 76px) clamp(22px, 8vw, 92px) 90px' }}>
              {blocks.map((block, index) => {
                if (block.type === 'heading') {
                  if (block.level === 1) return null;
                  return <h2 key={index}>{block.text}</h2>;
                }
                if (block.type === 'figure') {
                  return (
                    <figure key={index}>
                      <img src={block.src} alt={block.alt} />
                      <figcaption>{block.alt}</figcaption>
                    </figure>
                  );
                }
                return <p key={index}><InlineText text={block.text} /></p>;
              })}
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

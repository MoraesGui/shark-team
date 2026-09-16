// Adapted from the supplied Originkit Magnetic Carousel for the SHARK layout.
import { useRef, useState, type CSSProperties } from 'react';
import './MagneticCarousel.css';

const photos = [
  { src: '/images/mentalidade_shark01.jpg', alt: 'Shark — registro como atleta profissional, foto 1' },
  { src: '/images/mentalidade_shark03.jpg', alt: 'Shark no ringue segurando um balde e com o braço levantado' },
  { src: '/images/mentalidade_shark02.jpg', alt: 'Shark de costas, usando luvas e shorts da equipe' },
];

export default function MagneticCarousel() {
  const container = useRef<HTMLDivElement>(null);
  const [factors, setFactors] = useState([0, 0, 0]);
  const [open, setOpen] = useState<number | null>(null);
  const reset = () => setFactors([0, 0, 0]);

  return <div className="magnetic-carousel">
    <div
      className="magnetic-track"
      ref={container}
      role="group"
      aria-label="Conheça o Shark em imagens"
      onPointerMove={event => {
        if (event.pointerType !== 'mouse' || open !== null) return;
        const bounds = container.current?.getBoundingClientRect();
        if (!bounds) return;
        const position = (event.clientX - bounds.left) / bounds.width;
        setFactors(photos.map((_, index) => {
          const distance = Math.abs(position - (index + .5) / photos.length);
          const factor = Math.max(0, 1 - distance / .45);
          return factor * factor * (3 - 2 * factor);
        }));
      }}
      onPointerLeave={reset}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) reset(); }}
      onKeyDown={event => { if (event.key === 'Escape') { setOpen(null); reset(); } }}
    >
      {photos.map((photo, index) => {
        const factor = open === null ? factors[index] : open === index ? 1 : 0;
        const style = {
          '--magnetic-weight': open === null ? 1 + factor * 1.6 : open === index ? 5 : .65,
          '--magnetic-height': `${88 + factor * 12}%`,
        } as CSSProperties;
        return <button
          key={photo.src}
          className={`magnetic-photo${open !== null && open !== index ? ' is-muted' : ''}`}
          style={style}
          type="button"
          aria-label={`${open === index ? 'Recolher' : 'Expandir'} foto ${index + 1} do Shark`}
          aria-pressed={open === index}
          onFocus={() => setFactors(photos.map((_, i) => i === index ? 1 : 0))}
          onClick={() => { setOpen(open === index ? null : index); reset(); }}
        >
          <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
        </button>;
      })}
    </div>
    <div className="magnetic-caption"><span>SHARK / ATLETA PROFISSIONAL</span></div>
  </div>;
}

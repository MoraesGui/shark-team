import { useEffect, useRef, useState, type PointerEvent } from 'react';
import './EditorialGallery.css';

const photos = [
  { file: 'WhatsApp Image 2026-09-03 at 19.20.08.jpeg', caption: 'Um time. Um propósito.', alt: 'Shark e oito alunos reunidos no tatame, com a guarda levantada' },
  { file: 'WhatsApp Image 2026-09-03 at 19.20.08 (2).jpeg', caption: 'A atitude vem de dentro.', alt: 'Seis integrantes do Shark Team em frente à bandeira da equipe' },
  { file: 'WhatsApp Image 2026-09-03 at 19.20.09 (1).jpeg', caption: 'Presença. Constância. Evolução.', alt: 'Shark no centro de um grupo de cinco atletas com a guarda levantada' },
  { file: 'WhatsApp Image 2026-09-03 at 19.20.09 (2).jpeg', caption: 'Ninguém evolui sozinho.', alt: 'Sete integrantes do Shark Team reunidos na academia' },
  { file: 'WhatsApp Image 2026-09-03 at 19.20.10.jpeg', caption: 'Isso é Shark Team.', alt: 'Shark e sete alunos de braços cruzados no tatame da academia' },
];

const photoSource = (index: number) => `/carrosel/${photos[index].file}`;

export default function EditorialGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const isOpen = selected !== null;
  const marquee = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const cycleWidth = useRef(0);
  const hovering = useRef(false);
  const focused = useRef(false);
  const drag = useRef<{ id: number; startX: number; lastX: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const paintTrack = () => {
    const width = cycleWidth.current;
    if (!track.current || !width) return;
    offset.current = ((offset.current % width) + width) % width;
    track.current.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
  };

  useEffect(() => {
    const element = marquee.current;
    const group = track.current?.firstElementChild;
    if (!element || !group) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let frame = 0;
    let previousTime = 0;
    const resize = new ResizeObserver(() => {
      cycleWidth.current = group.getBoundingClientRect().width;
      paintTrack();
    });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    resize.observe(group);
    observer.observe(element);
    const animate = (time: number) => {
      const elapsed = previousTime ? Math.min(time - previousTime, 50) : 0;
      previousTime = time;
      if (visible && !document.hidden && !reduced.matches && !isOpen && !hovering.current && !focused.current && !drag.current) {
        offset.current += elapsed * .035;
        paintTrack();
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); };
  }, [isOpen]);

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    suppressClick.current = drag.current.moved;
    drag.current = null;
    event.currentTarget.classList.remove('is-dragging');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element) return;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
    }
    element.showModal();
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      opener.current?.focus({ preventScroll: true });
      swipe.current = null;
    };
  }, [isOpen]);

  const closePhoto = () => setSelected(null);
  const movePhoto = (direction: number) => setSelected(current => current === null ? null : (current + direction + photos.length) % photos.length);

  return (
    <div className={`editorial-gallery${isOpen ? ' is-open' : ''}`}>
      <div className="eg-index">
        <span>SHARK TEAM / INDAIATUBA</span>
        <span>REGISTROS DO TATAME</span>
      </div>
      <div className="eg-marquee" ref={marquee} role="region" aria-label="Carrossel de fotos dos alunos do Shark"
        onPointerEnter={event => { if (event.pointerType === 'mouse') hovering.current = true; }}
        onPointerLeave={() => { hovering.current = false; if (drag.current && !drag.current.moved) drag.current = null; }}
        onFocusCapture={() => { focused.current = true; }}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false; }}
        onDragStart={event => event.preventDefault()}
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0) return;
          if (event.pointerType === 'mouse') event.preventDefault();
          suppressClick.current = false;
          drag.current = { id: event.pointerId, startX: event.clientX, lastX: event.clientX, moved: false };
        }}
        onPointerMove={event => {
          const current = drag.current;
          if (!current || current.id !== event.pointerId) return;
          if (!current.moved && Math.abs(event.clientX - current.startX) < 6) return;
          if (!current.moved) {
            current.moved = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.classList.add('is-dragging');
          }
          offset.current -= event.clientX - current.lastX;
          current.lastX = event.clientX;
          paintTrack();
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
        onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
      >
       <div className="eg-track" ref={track}>
        {[0, 1].map(copy => <div className="eg-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
         {photos.map((photo, index) => (
          <figure className={`eg-photo eg-photo-${index + 1}`} key={photo.file}>
            <button
              type="button"
              className="eg-photo-button"
              tabIndex={copy === 1 ? -1 : 0}
              aria-label={`Ampliar: ${photo.alt}`}
              onClick={event => { opener.current = event.currentTarget; setSelected(index); }}
            >
              <img src={photoSource(index)} alt={photo.alt} width="1200" height="1600" loading="lazy" decoding="async" draggable={false} />
            </button>
          </figure>
         ))}
        </div>)}
       </div>
      </div>

      <dialog
        ref={dialog}
        className="eg-dialog"
        aria-label="Fotos do Shark Team ampliadas"
        onCancel={event => { event.preventDefault(); closePhoto(); }}
        onClose={closePhoto}
        onClick={event => { if (event.target === event.currentTarget) closePhoto(); }}
        onKeyDown={event => {
          if (event.key === 'ArrowRight') { event.preventDefault(); movePhoto(1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); movePhoto(-1); }
        }}
      >
        <button type="button" className="eg-close" onClick={closePhoto} autoFocus aria-label="Fechar foto ampliada">FECHAR <span aria-hidden="true">×</span></button>
        {selected !== null && (
          <div className="eg-dialog-content">
            <figure
              className="eg-expanded-photo"
              onTouchStart={event => {
                const touch = event.touches[0];
                swipe.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null;
              }}
              onTouchEnd={event => {
                const touch = event.changedTouches[0];
                if (swipe.current && touch) {
                  const dx = touch.clientX - swipe.current.x;
                  const dy = touch.clientY - swipe.current.y;
                  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) movePhoto(dx < 0 ? 1 : -1);
                }
                swipe.current = null;
              }}
              onTouchCancel={() => { swipe.current = null; }}
            >
              <img src={photoSource(selected)} alt={photos[selected].alt} width="1200" height="1600" draggable={false} />
            </figure>
            <div className="eg-dialog-controls">
              <button type="button" onClick={() => movePhoto(-1)} aria-label="Foto anterior"><span aria-hidden="true">←</span> ANTERIOR</button>
              <button type="button" onClick={() => movePhoto(1)} aria-label="Próxima foto">PRÓXIMA <span aria-hidden="true">→</span></button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

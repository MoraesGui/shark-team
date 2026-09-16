import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const photos = [
  '/carrosel/WhatsApp Image 2026-09-03 at 19.20.08 (1).jpeg',
  '/carrosel/WhatsApp Image 2026-09-03 at 19.20.08 (2).jpeg',
  '/carrosel/WhatsApp Image 2026-09-03 at 19.20.08.jpeg',
  '/carrosel/WhatsApp Image 2026-09-03 at 19.20.09 (1).jpeg',
  '/carrosel/WhatsApp Image 2026-09-03 at 19.20.09 (2).jpeg',
  '/carrosel/WhatsApp Image 2026-09-03 at 19.20.09.jpeg',
  '/carrosel/WhatsApp Image 2026-09-03 at 19.20.10.jpeg',
];

export default function InteractiveGallery() {
  const reducedMotion = useReducedMotion();
  const rail = useRef<HTMLDivElement>(null);
  const firstGroup = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);
  const interaction = useRef({ hovered: false, focused: false, visible: false, pauseUntil: 0, suppressClick: 0 });
  const drag = useRef<{ x: number; scroll: number; moved: boolean } | null>(null);
  const swipeStart = useRef<number | null>(null);
  const isOpen = selected !== null;

  useEffect(() => {
    const element = rail.current;
    if (!element || reducedMotion || isOpen) return;
    const observer = new IntersectionObserver(([entry]) => {
      interaction.current.visible = entry.isIntersecting;
    });
    observer.observe(element);
    let frame = 0;
    let last = 0;
    let fraction = 0;
    const animate = (now: number) => {
      const delta = last ? Math.min(now - last, 40) : 0;
      last = now;
      const state = interaction.current;
      const width = firstGroup.current?.offsetWidth || 0;
      if (width && state.visible && !document.hidden && !state.hovered && !state.focused && !drag.current && now > state.pauseUntil) {
        fraction += delta * .036;
        const distance = Math.floor(fraction);
        fraction -= distance;
        element.scrollLeft = (element.scrollLeft + distance) % width;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [reducedMotion, isOpen]);

  useEffect(() => {
    if (!isOpen || !dialog.current) return;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      const width = firstGroup.current?.offsetWidth || 0;
      if (rail.current && width && rail.current.scrollLeft >= width) rail.current.scrollLeft %= width;
      opener.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  function openPhoto(index: number, target: HTMLElement) {
    if (performance.now() < interaction.current.suppressClick) return;
    opener.current = target;
    setImageError(false);
    setSelected(index);
  }

  function movePhoto(direction: number) {
    setImageError(false);
    setSelected(current => current === null ? null : (current + direction + photos.length) % photos.length);
  }

  function releaseDrag() {
    if (drag.current?.moved) interaction.current.suppressClick = performance.now() + 300;
    drag.current = null;
    interaction.current.pauseUntil = performance.now() + 2000;
    rail.current?.classList.remove('is-dragging');
  }

  useEffect(() => {
    const releaseOutside = () => { if (drag.current) releaseDrag(); };
    window.addEventListener('pointerup', releaseOutside);
    window.addEventListener('pointercancel', releaseOutside);
    window.addEventListener('blur', releaseOutside);
    return () => {
      window.removeEventListener('pointerup', releaseOutside);
      window.removeEventListener('pointercancel', releaseOutside);
      window.removeEventListener('blur', releaseOutside);
    };
  }, []);

  return (
    <>
      <div className="gallery-wrap">
        <div
          ref={rail}
          className="gallery-rail"
          role="region"
          aria-label="Galeria dos alunos do Shark Team"
          onPointerEnter={event => { if (event.pointerType === 'mouse') interaction.current.hovered = true; }}
          onPointerLeave={() => { interaction.current.hovered = false; }}
          onFocusCapture={() => { interaction.current.focused = true; }}
          onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) interaction.current.focused = false; }}
          onWheel={() => { interaction.current.pauseUntil = performance.now() + 2500; }}
          onPointerDown={event => {
            interaction.current.pauseUntil = performance.now() + 2500;
            if (event.pointerType !== 'mouse' || event.button !== 0) return;
            drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
          }}
          onPointerMove={event => {
            if (!drag.current) return;
            if ((event.buttons & 1) === 0) { releaseDrag(); return; }
            const delta = event.clientX - drag.current.x;
            if (Math.abs(delta) > 6) drag.current.moved = true;
            if (!drag.current.moved) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.classList.add('is-dragging');
            event.currentTarget.scrollLeft = drag.current.scroll - delta;
          }}
          onPointerUp={releaseDrag}
          onPointerCancel={releaseDrag}
          onLostPointerCapture={releaseDrag}
        >
          {[0, 1].map(copy => (
            <div className="gallery-group" ref={copy === 0 ? firstGroup : undefined} key={copy} aria-hidden={copy === 1 ? true : undefined}>
              {photos.map((photo, index) => {
                const Card = copy === 0 ? 'button' : 'div';
                return <Card
                  className="gallery-photo"
                  key={photo}
                  type={copy === 0 ? 'button' : undefined}
                  aria-label={copy === 0 ? `Ampliar foto ${index + 1} de ${photos.length} do Shark Team` : undefined}
                  onClick={event => {
                    const original = firstGroup.current?.querySelectorAll<HTMLButtonElement>('button')[index];
                    openPhoto(index, original || event.currentTarget);
                  }}
                  onDragStart={event => event.preventDefault()}
                >
                  <img src={photo} alt="Aluno do Shark Team" width="350" height="450" loading="lazy" decoding="async" draggable={false} />
                  <span className="gallery-photo-overlay" aria-hidden="true"><Expand size={22} /><span>AMPLIAR FOTO</span></span>
                </Card>;
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="gallery-hint">Arraste para explorar. Toque em uma foto para ampliar.</p>
      <dialog
        ref={dialog}
        className="photo-dialog"
        aria-label="Fotos do Shark Team"
        onClose={() => setSelected(null)}
        onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}
        onKeyDown={event => {
          if (event.key === 'ArrowRight') { event.preventDefault(); movePhoto(1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); movePhoto(-1); }
        }}
      >
        {selected !== null && (
          <>
            <div className="photo-dialog-header">
              <p aria-live="polite">SHARK TEAM <span>{selected + 1} / {photos.length}</span></p>
              <button type="button" className="gallery-control" autoFocus aria-label="Fechar foto" onClick={() => setSelected(null)}><X /></button>
            </div>
            <div className="photo-dialog-content">
              <button type="button" className="gallery-control previous-photo" aria-label="Foto anterior" onClick={() => movePhoto(-1)}><ChevronLeft /></button>
              <motion.figure
                key={selected}
                initial={{ opacity: reducedMotion ? 1 : .5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: .18 }}
                onTouchStart={event => { swipeStart.current = event.touches[0].clientX; }}
                onTouchEnd={event => {
                  if (swipeStart.current === null) return;
                  const distance = event.changedTouches[0].clientX - swipeStart.current;
                  if (Math.abs(distance) > 60) movePhoto(distance < 0 ? 1 : -1);
                  swipeStart.current = null;
                }}
              >
                {imageError ? <p role="status">Não foi possível carregar esta foto. Você pode ver a próxima.</p> : <img src={photos[selected]} alt={`Foto ${selected + 1} dos alunos do Shark Team`} onError={() => setImageError(true)} />}
              </motion.figure>
              <button type="button" className="gallery-control next-photo" aria-label="Próxima foto" onClick={() => movePhoto(1)}><ChevronRight /></button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}

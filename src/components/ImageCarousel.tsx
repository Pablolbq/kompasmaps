import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  onOpenFullscreen?: (index: number) => void;
  disableDrag?: boolean;
  showControls?: boolean;
}

export default function ImageCarousel({ images, alt, className = '', onOpenFullscreen, disableDrag = false, showControls = true }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = images.length;
  const [dragOffset, setDragOffset] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(total - 1, index)));
  }, [total]);

  const prev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    goTo(current - 1);
  }, [current, goTo]);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    goTo(current + 1);
  }, [current, goTo]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (disableDrag) return;
    dragging.current = false;
    startX.current = e.clientX;
    setDragOffset(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [disableDrag]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (disableDrag || startX.current === 0) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 5) dragging.current = true;
    setDragOffset(delta);
  }, [disableDrag]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (disableDrag) return;
    const delta = e.clientX - startX.current;
    startX.current = 0;

    if (Math.abs(delta) > 40) {
      if (delta < 0) goTo(current + 1);
      else goTo(current - 1);
    }

    setDragOffset(0);
    setTimeout(() => { dragging.current = false; }, 60);
  }, [disableDrag, current, goTo]);

  if (total === 0) return null;

  const slidePercent = 100 / total;
  const translateX = -(current * slidePercent);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden group/carousel select-none ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ cursor: disableDrag ? 'pointer' : dragging.current ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
    >
      <div
        className="flex h-full"
        style={{
          width: `${total * 100}%`,
          transform: `translateX(calc(${translateX}% + ${dragOffset}px))`,
          transition: dragOffset !== 0 ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {images.map((src, i) => (
          <div key={i} className="h-full flex-shrink-0" style={{ width: `${slidePercent}%` }}>
            <img
              src={src}
              alt={`${alt} - foto ${i + 1}`}
              className="w-full h-full object-cover pointer-events-none"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {showControls && onOpenFullscreen && (
        <button
          onClick={(e) => { e.stopPropagation(); if (!dragging.current) onOpenFullscreen(current); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
        >
          <ZoomIn size={14} />
        </button>
      )}

      {showControls && total > 1 && (
        <>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={prev}
            className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-black/0 hover:bg-black/20 text-white opacity-0 group-hover/carousel:opacity-100 transition-all z-10"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={next}
            className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center bg-black/0 hover:bg-black/20 text-white opacity-0 group-hover/carousel:opacity-100 transition-all z-10"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Fullscreen lightbox overlay
export function ImageLightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);
  const total = images.length;
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef(0);

  const goTo = useCallback((i: number) => setCurrent(Math.max(0, Math.min(total - 1, i))), [total]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startX.current = e.clientX;
    setDragOffset(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (startX.current === 0) return;
    setDragOffset(e.clientX - startX.current);
  }, []);

  const onPointerUp = useCallback(() => {
    const delta = dragOffset;
    startX.current = 0;
    if (Math.abs(delta) > 60) {
      if (delta < 0) goTo(current + 1);
      else goTo(current - 1);
    }
    setDragOffset(0);
  }, [dragOffset, current, goTo]);

  // Keyboard
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft') goTo(current - 1);
  }, [onClose, current, goTo]);

  useState(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // Keep keyboard handler up to date
  const keyRef = useRef(onKeyDown);
  keyRef.current = onKeyDown;

  useState(() => {
    const handler = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10"
      >
        <X size={20} />
      </button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium z-10">
        {current + 1} / {total}
      </div>

      <div
        className="w-full h-full flex items-center justify-center select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'pan-y' }}
      >
        <img
          src={images[current]}
          alt={`Foto ${current + 1}`}
          className="max-w-[90vw] max-h-[85vh] object-contain"
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: dragOffset !== 0 ? 'none' : 'transform 0.3s ease-out',
          }}
          draggable={false}
        />
      </div>

      {total > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(current - 1); }}
            className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center bg-black/0 hover:bg-white/10 text-white z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(current + 1); }}
            className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center bg-black/0 hover:bg-white/10 text-white z-10"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}

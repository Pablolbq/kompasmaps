import { useState, useRef, useCallback, useEffect } from 'react';
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
  const isPointerDown = useRef(false);

  const goTo = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(total - 1, index)));
  }, [total]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (disableDrag) return;
    // Don't start drag if clicking a button
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = false;
    isPointerDown.current = true;
    startX.current = e.clientX;
    setDragOffset(0);
  }, [disableDrag]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 5) dragging.current = true;
    setDragOffset(delta);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    const delta = dragOffset;

    if (Math.abs(delta) > 40) {
      if (delta < 0) goTo(current + 1);
      else goTo(current - 1);
    }

    setDragOffset(0);
    setTimeout(() => { dragging.current = false; }, 60);
  }, [dragOffset, current, goTo]);

  if (total === 0) return null;

  const slidePercent = 100 / total;
  const translateX = -(current * slidePercent);

  return (
    <div
      className={`relative overflow-hidden group/carousel select-none ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ cursor: disableDrag ? 'pointer' : dragging.current ? 'grabbing' : 'grab', touchAction: disableDrag ? 'auto' : 'pan-y' }}
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
            onClick={(e) => { e.stopPropagation(); goTo(current - 1); }}
            className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-black/0 hover:bg-black/20 text-white opacity-0 group-hover/carousel:opacity-100 transition-all z-10"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goTo(current + 1); }}
            className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center bg-black/0 hover:bg-black/20 text-white opacity-0 group-hover/carousel:opacity-100 transition-all z-10"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
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
  const isPointerDown = useRef(false);
  const startX = useRef(0);

  const goTo = useCallback((i: number) => setCurrent(Math.max(0, Math.min(total - 1, i))), [total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [onClose, current, goTo]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      onClick={(e) => { e.stopPropagation(); }}
    >
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
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          isPointerDown.current = true;
          startX.current = e.clientX;
          setDragOffset(0);
        }}
        onPointerMove={(e) => {
          if (!isPointerDown.current) return;
          setDragOffset(e.clientX - startX.current);
        }}
        onPointerUp={() => {
          if (!isPointerDown.current) return;
          isPointerDown.current = false;
          if (Math.abs(dragOffset) > 60) {
            if (dragOffset < 0) goTo(current + 1);
            else goTo(current - 1);
          }
          setDragOffset(0);
        }}
        onPointerLeave={() => {
          if (!isPointerDown.current) return;
          isPointerDown.current = false;
          if (Math.abs(dragOffset) > 60) {
            if (dragOffset < 0) goTo(current + 1);
            else goTo(current - 1);
          }
          setDragOffset(0);
        }}
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

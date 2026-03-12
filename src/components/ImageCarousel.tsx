import { useState, useCallback, useRef } from 'react';
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

  // Touch/drag state
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent((c) => (c - 1 + total) % total);
  };

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent((c) => (c + 1) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    touchDeltaX.current = delta;
    isDragging.current = Math.abs(delta) > 5;
    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    const delta = touchDeltaX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0 && current < total - 1) setCurrent(c => c + 1);
      else if (delta > 0 && current > 0) setCurrent(c => c - 1);
    }
    setDragOffset(0);
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setTimeout(() => { isDragging.current = false; }, 50);
  };

  // Mouse drag
  const mouseStartX = useRef<number | null>(null);
  const mouseDelta = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    mouseDelta.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    const delta = e.clientX - mouseStartX.current;
    mouseDelta.current = delta;
    isDragging.current = Math.abs(delta) > 5;
    setDragOffset(delta);
  };

  const handleMouseUp = () => {
    if (mouseStartX.current === null) return;
    const delta = mouseDelta.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0 && current < total - 1) setCurrent(c => c + 1);
      else if (delta > 0 && current > 0) setCurrent(c => c - 1);
    }
    setDragOffset(0);
    mouseStartX.current = null;
    mouseDelta.current = 0;
    setTimeout(() => { isDragging.current = false; }, 50);
  };

  if (total === 0) return null;

  return (
    <div
      className={`relative overflow-hidden group/carousel select-none ${className}`}
      onTouchStart={disableDrag ? undefined : handleTouchStart}
      onTouchMove={disableDrag ? undefined : handleTouchMove}
      onTouchEnd={disableDrag ? undefined : handleTouchEnd}
      onMouseDown={disableDrag ? undefined : handleMouseDown}
      onMouseMove={disableDrag ? undefined : handleMouseMove}
      onMouseUp={disableDrag ? undefined : handleMouseUp}
      onMouseLeave={disableDrag ? undefined : () => { if (mouseStartX.current !== null) handleMouseUp(); }}
      style={{ cursor: disableDrag ? 'pointer' : isDragging.current ? 'grabbing' : 'grab' }}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))`,
          transition: dragOffset !== 0 ? 'none' : 'transform 0.3s ease-out',
          width: `${total * 100}%`,
        }}
      >
        {images.map((src, i) => (
          <div key={i} className="h-full flex-shrink-0" style={{ width: `${100 / total}%` }}>
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

      {/* Fullscreen button */}
      {showControls && onOpenFullscreen && (
        <button
          onClick={(e) => { e.stopPropagation(); if (!isDragging.current) onOpenFullscreen(current); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
        >
          <ZoomIn size={14} />
        </button>
      )}

      {showControls && total > 1 && (
        <>
          <button
            onClick={(e) => { if (!isDragging.current) prev(e); else e.stopPropagation(); }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={(e) => { if (!isDragging.current) next(e); else e.stopPropagation(); }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
          >
            <ChevronRight size={14} />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); if (!isDragging.current) setCurrent(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === current ? 'bg-white w-3' : 'bg-white/50'
                }`}
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

  const touchStartX = useRef<number | null>(null);
  const touchDelta = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; touchDelta.current = 0; }}
        onTouchMove={(e) => {
          if (touchStartX.current === null) return;
          const d = e.touches[0].clientX - touchStartX.current;
          touchDelta.current = d;
          setDragOffset(d);
        }}
        onTouchEnd={() => {
          if (Math.abs(touchDelta.current) > 60) {
            if (touchDelta.current < 0 && current < total - 1) setCurrent(c => c + 1);
            else if (touchDelta.current > 0 && current > 0) setCurrent(c => c - 1);
          }
          setDragOffset(0);
          touchStartX.current = null;
        }}
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
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + total) % total); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % total); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}

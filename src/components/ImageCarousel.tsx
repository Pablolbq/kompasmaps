import { useState, useRef, useCallback, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  onOpenFullscreen?: (index: number) => void;
  onClickCenter?: (index: number) => void;
  disableDrag?: boolean;
  showControls?: boolean;
  hideZoom?: boolean;
}

export default function ImageCarousel({ images, alt, className = '', onOpenFullscreen, onClickCenter, disableDrag = false, showControls = true, hideZoom = false }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = images.length;
  const [dragOffset, setDragOffset] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const isPointerDown = useRef(false);

  const goTo = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(total - 1, index)));
  }, [total]);

  useEffect(() => {
    setCurrent(0);
    setDragOffset(0);
    isPointerDown.current = false;
    dragging.current = false;
  }, [alt, total]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (disableDrag) return;
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
    } else if (!dragging.current && onClickCenter) {
      onClickCenter(current);
    }

    setDragOffset(0);
    setTimeout(() => {
      dragging.current = false;
    }, 60);
  }, [dragOffset, current, goTo, onClickCenter]);

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

      {showControls && !hideZoom && onOpenFullscreen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!dragging.current) onOpenFullscreen(current);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
          aria-label="Abrir foto em tela cheia"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {showControls && total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goTo(current - 1);
            }}
            className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-black/0 hover:bg-black/20 text-white opacity-0 group-hover/carousel:opacity-100 transition-all z-10"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goTo(current + 1);
            }}
            className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center bg-black/0 hover:bg-black/20 text-white opacity-0 group-hover/carousel:opacity-100 transition-all z-10"
            aria-label="Próxima foto"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/50'}`}
                aria-label={`Ir para foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface ImageLightboxProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export const ImageLightbox = forwardRef<HTMLDivElement, ImageLightboxProps>(function ImageLightbox(
  { images, startIndex, onClose },
  ref,
) {
  const total = images.length;
  const safeStartIndex = Math.max(0, Math.min(startIndex, Math.max(total - 1, 0)));
  const [current, setCurrent] = useState(safeStartIndex);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef(0);
  const isPointerDown = useRef(false);

  useEffect(() => {
    setCurrent(safeStartIndex);
    setDragOffset(0);
    isPointerDown.current = false;
  }, [safeStartIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(Math.max(0, Math.min(total - 1, index)));
  }, [total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [current, goTo, onClose]);

  if (total === 0) return null;

  const handlePointerUp = (clientX: number) => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;

    const delta = clientX - startX.current;
    if (Math.abs(delta) > 55) {
      if (delta < 0) goTo(current + 1);
      else goTo(current - 1);
    }

    setDragOffset(0);
  };

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => onClose()}
      onWheelCapture={(e) => e.preventDefault()}
      onTouchMoveCapture={(e) => e.preventDefault()}
    >
      <div className="relative w-full max-w-[45rem] h-[min(85vh,800px)] flex items-center justify-center">
        <img
          src={images[current]}
          alt={`Foto ${current + 1}`}
          className="w-full h-full object-contain rounded-xl"
          draggable={false}
          onClick={(e) => e.stopPropagation()}
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
          onPointerUp={(e) => {
            e.stopPropagation();
            handlePointerUp(e.clientX);
          }}
          onPointerLeave={(e) => {
            handlePointerUp(e.clientX);
          }}
          onPointerCancel={() => {
            isPointerDown.current = false;
            setDragOffset(0);
          }}
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: dragOffset !== 0 ? 'none' : 'transform 0.24s ease-out',
            touchAction: 'pan-y',
          }}
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center z-20"
          aria-label="Fechar foto"
        >
          <X size={20} />
        </button>

        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-white text-sm font-medium z-20 pointer-events-none">
          {current + 1} / {total}
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(current - 1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center z-20"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(current + 1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center z-20"
              aria-label="Próxima foto"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>
    </div>
  );
});

import { useState, useRef, useCallback, useEffect, forwardRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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

export default function ImageCarousel({
  images,
  alt,
  className = "",
  onOpenFullscreen,
  onClickCenter,
  disableDrag = false,
  showControls = true,
  hideZoom = false,
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = images.length;
  const [dragOffset, setDragOffset] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const isPointerDown = useRef(false);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(Math.max(0, Math.min(total - 1, index)));
    },
    [total],
  );

  useEffect(() => {
    setCurrent(0);
    setDragOffset(0);
    isPointerDown.current = false;
    dragging.current = false;
  }, [alt, total]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disableDrag) return;
      if ((e.target as HTMLElement).closest("button")) return;
      dragging.current = false;
      isPointerDown.current = true;
      startX.current = e.clientX;
      setDragOffset(0);
    },
    [disableDrag],
  );

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
      style={{
        cursor: disableDrag ? "pointer" : dragging.current ? "grabbing" : "grab",
        touchAction: disableDrag ? "auto" : "pan-y",
      }}
    >
      <div
        className="flex h-full"
        style={{
          width: `${total * 100}%`,
          transform: `translateX(calc(${translateX}% + ${dragOffset}px))`,
          transition: dragOffset !== 0 ? "none" : "transform 0.3s ease-out",
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
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-white w-3" : "bg-white/50"}`}
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
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const pointerId = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(Math.max(0, Math.min(total - 1, index)));
    },
    [total],
  );

  useEffect(() => {
    setCurrent(safeStartIndex);
    setDragOffset(0);
    pointerId.current = null;
  }, [safeStartIndex]);

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "ArrowLeft") goTo(current - 1);
    };

    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [current, goTo, onClose]);

  if (total === 0 || typeof document === "undefined") return null;

  const handleDragEnd = (clientX: number) => {
    if (pointerId.current === null) return;
    pointerId.current = null;

    const delta = clientX - startX.current;
    if (Math.abs(delta) > 60) {
      if (delta < 0) goTo(current + 1);
      else goTo(current - 1);
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  return createPortal(
    <div
      ref={ref}
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div
        className="relative w-full max-w-[45rem] h-[min(90vh,800px)] flex items-center justify-center"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className="w-full h-full flex items-center justify-center pointer-events-none"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            pointerId.current = e.pointerId;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            startX.current = e.clientX;
            setDragOffset(0);
            setIsDragging(true);
          }}
          onPointerMove={(e) => {
            if (pointerId.current !== e.pointerId) return;
            setDragOffset(e.clientX - startX.current);
          }}
          onPointerUp={(e) => {
            if (pointerId.current === e.pointerId) {
              (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
            }
            handleDragEnd(e.clientX);
          }}
          onPointerCancel={() => {
            pointerId.current = null;
            setDragOffset(0);
            setIsDragging(false);
          }}
          style={{
            transform: `translateX(${dragOffset}px)`,
            transition: isDragging ? "none" : "transform 0.24s ease-out",
            touchAction: "none",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <img
            src={images[current]}
            alt={`Foto ${current + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg select-none pointer-events-none"
            draggable={false}
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-foreground/55 hover:bg-foreground/70 text-background flex items-center justify-center z-50 pointer-events-auto"
          aria-label="Fechar foto"
        >
          <X size={20} />
        </button>

        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-background text-sm font-medium z-40 pointer-events-none">
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
              className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-foreground/55 hover:bg-foreground/70 text-background flex items-center justify-center z-50 pointer-events-auto"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-foreground/55 hover:bg-foreground/70 text-background flex items-center justify-center z-50 pointer-events-auto"
              aria-label="Próxima foto"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
});

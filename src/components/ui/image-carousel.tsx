import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useState } from "react";

export function ImageCarousel({ images, alt, className = "" }: { images?: string[]; alt: string; className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-secondary ${className}`}>
        <Package className="size-10 text-muted-foreground" />
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((curr) => (curr === 0 ? images.length - 1 : curr - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((curr) => (curr === images.length - 1 ? 0 : curr + 1));
  };

  return (
    <div className={`relative group/carousel overflow-hidden ${className}`}>
      <img
        src={images[currentIndex]}
        alt={`${alt} - ${currentIndex + 1}`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
      />
      
      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 transition-opacity group-hover/carousel:opacity-100">
        <button
          type="button"
          onClick={prev}
          className="rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={next}
          className="rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === currentIndex ? "w-3 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setMousePosition({ x, y });
  };

  return (
    <div className="space-y-4 select-none">
      {/* Main Image with Zoom */}
      <div 
        ref={containerRef}
        className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border cursor-crosshair group"
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <motion.img
          key={images[selectedIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          src={images[selectedIndex]}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-200"
          style={{
             transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
             transform: showZoom ? "scale(2)" : "scale(1)"
          }}
        />
        
        {/* Mobile/Touch hint (optional, or just rely on native behavior) */}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50",
                selectedIndex === idx 
                  ? "border-primary shadow-sm ring-1 ring-primary" 
                  : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-200"
              )}
            >
              <img src={img} alt={`${productName} view ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

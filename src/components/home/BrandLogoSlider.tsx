import { useRef, useEffect, useState } from "react";
import { BRANDS } from "@/data/brands";

export function BrandLogoSlider() {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // 4 copies to ensure generous buffer for infinite scrolling
    // One "Set" width will be calculated. 
    // We loop when we pass 2 sets.
    const displayBrands = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];

    useEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        let animationId: number;
        // Speed in px per frame. 0.5 is roughly 30px/sec at 60fps.
        const speed = 0.5;

        const animate = () => {
            if (!isPaused && !isDragging && scroller) {
                scroller.scrollLeft += speed;

                // Infinite Scroll Logic
                // We assume the content is uniform. 
                // Using scrollWidth is safe.
                // If we have scrolled past roughly half the content (2 sets out of 4), jump back.
                // Checking scrollWidth / 2.
                if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
                    scroller.scrollLeft -= scroller.scrollWidth / 2;
                }
            }
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [isPaused, isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollerRef.current) return;
        setIsDragging(true);
        setIsPaused(true);
        setStartX(e.pageX - scrollerRef.current.offsetLeft);
        setScrollLeft(scrollerRef.current.scrollLeft);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!scrollerRef.current) return;
        setIsDragging(true);
        setIsPaused(true);
        setStartX(e.touches[0].pageX - scrollerRef.current.offsetLeft);
        setScrollLeft(scrollerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !scrollerRef.current) return;
        const x = e.touches[0].pageX - scrollerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollerRef.current.scrollLeft = scrollLeft - walk;
    };

    const stopDragging = () => {
        setIsDragging(false);
        setIsPaused(false);
    };

    return (
        <section className="py-2 border-b overflow-hidden relative bg-white" aria-label="Premium Baby Brands">
            <div
                className="container-main relative w-full overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div
                    ref={scrollerRef}
                    className="flex gap-16 overflow-x-hidden whitespace-nowrap py-1 select-none cursor-grab active:cursor-grabbing text-start"
                    dir="ltr" // Force LTR for correct math
                    onMouseDown={handleMouseDown}
                    onMouseUp={stopDragging}
                    onMouseLeave={stopDragging}
                    onMouseMove={handleMouseMove}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={stopDragging}
                    onTouchMove={handleTouchMove}
                >
                    {displayBrands.map((brand, i) => (
                        <div
                            key={`${brand.name}-${i}`}
                            className="relative group shrink-0 inline-flex items-center justify-center transition-opacity duration-300"
                        >
                            <img
                                src={brand.src}
                                alt={brand.name}
                                className="h-8 lg:h-10 w-auto object-contain max-h-12 pointer-events-none select-none transition-all duration-300 transform hover:scale-125 drop-shadow-sm"
                            />
                        </div>
                    ))}
                </div>

                {/* Gradient Fade Masks */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
            </div>
        </section>
    );
}

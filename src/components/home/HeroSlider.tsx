"use client";


import { useState, useEffect, useCallback, useMemo } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export function HeroSlider() {
    const { t, i18n } = useTranslation();
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);
    const isRtl = i18n.dir() === 'rtl';

    const HERO_SLIDES = useMemo(() => [
        {
            id: 0,
            title1: "Babyisland",
            title2: "EG",
            desc: "We Sell Happiness",
            img: "/hero-happiness.png",
            bg: "bg-white", // Changed to white
            isTypewriter: false, // Turn off typewriter for the specific logo look
            layout: "image-left", // New layout property
            textColor: "text-[#0EA5E9]", // Primary Blue
            highlightColor: "text-[#F97316]", // Orange
            hideButtons: true, // Hide buttons for this slide
            hideBadge: true, // Hide "New Arrival" badge
        },
        {
            id: 1,
            title1: t('home.hero.slide1.title1'),
            title2: t('home.hero.slide1.title2'),
            desc: t('home.hero.slide1.desc'),
            img: "/hero-3d.png",
            bg: "bg-gradient-to-br from-[#0EA5E9] to-[#0EA5E9]",
            layout: "standard"
        },
        {
            id: 2,
            title1: t('home.hero.slide2.title1'),
            title2: t('home.hero.slide2.title2'),
            desc: t('home.hero.slide2.desc'),
            img: "/hero-slide-2.png",
            bg: "bg-gradient-to-br from-[#0EA5E9] to-[#0EA5E9]",
            layout: "standard"
        },
        {
            id: 3,
            title1: t('home.hero.slide3.title1'),
            title2: t('home.hero.slide3.title2'),
            desc: t('home.hero.slide3.desc'),
            img: "/hero-carseat.png",
            bg: "bg-gradient-to-br from-[#0EA5E9] to-[#0EA5E9]",
            layout: "standard"
        }
    ], [t]);

    const slideCount = HERO_SLIDES.length;

    // Navigation logic
    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slideCount);
    }, [slideCount]);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + slideCount) % slideCount);
    }, [slideCount]);

    // Auto-play
    useEffect(() => {
        const timer = setInterval(nextSlide, 30000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    // Swipe handlers
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            if (isRtl) prevSlide(); else nextSlide();
        }
        if (isRightSwipe) {
            if (isRtl) nextSlide(); else prevSlide();
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? (isRtl ? 100 : -100) : (isRtl ? -100 : 100),
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? (isRtl ? 100 : -100) : (isRtl ? -100 : 100),
            opacity: 0,
            scale: 1.05
        })
    };

    // Typewriter effect component
    const TypewriterText = ({ text }: { text: string }) => {
        const [displayedText, setDisplayedText] = useState("");
        
        useEffect(() => {
            let i = 0;
            setDisplayedText("");
            const timer = setInterval(() => {
                if (i < text.length) {
                    setDisplayedText((prev) => prev + text.charAt(i));
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, 150); // Typing speed
            return () => clearInterval(timer);
        }, [text]);

        return <span>{displayedText}</span>;
    };

    return (
        <section
            className="relative overflow-hidden group min-h-[600px] flex items-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Animated Background */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className={`absolute inset-0 ${HERO_SLIDES[current].bg.startsWith('bg-') ? HERO_SLIDES[current].bg : `bg-gradient-to-br ${HERO_SLIDES[current].bg}`}`}
                />
            </AnimatePresence>

            {/* Content Container */}
            <div className="container-main relative z-10 w-full">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.4 },
                            scale: { duration: 0.4 }
                        }}
                        className={`w-full items-center
                            ${HERO_SLIDES[current].layout === 'image-left' 
                                ? 'flex flex-row justify-center items-center gap-4' // Row for navbar style
                                : 'grid lg:grid-cols-2 gap-8 lg:gap-16'} // Grid for standard slides
                        `}
                    >
                        {/* Text Column */}
                        <div className={`
                            relative z-20 flex flex-col justify-center
                            ${HERO_SLIDES[current].layout === 'image-left' 
                                ? `text-center items-center ${isRtl ? 'order-1' : 'order-2'}`
                                : 'text-start lg:text-start order-2 lg:order-1'}
                        `}>
                            {!HERO_SLIDES[current].hideBadge && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                >
                                    <span className={`inline-block px-4 py-1.5 rounded-full backdrop-blur-sm border text-sm font-bold shadow-sm mb-4
                                        ${HERO_SLIDES[current].layout === 'image-left' 
                                            ? 'bg-[#0EA5E9]/10 border-[#0EA5E9]/20 text-[#0EA5E9]' 
                                            : 'bg-white/20 border-white/30 text-white'
                                        }`}>
                                        {t('home.newArrival')}
                                    </span>
                                </motion.div>
                            )}

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className={`font-black font-display leading-[0.9] drop-shadow-sm tracking-tighter
                                    ${HERO_SLIDES[current].layout === 'image-left' 
                                        ? 'text-[#0EA5E9] text-4xl md:text-5xl lg:text-7xl mb-0 flex flex-col items-center' 
                                        : 'text-white text-3xl md:text-4xl lg:text-6xl mb-4'}
                                `}
                            >
                                {HERO_SLIDES[current].id === 0 ? (
                                    // Special Layout for Slide 0
                                    <div className="flex items-baseline gap-1 font-baskervville-sc">
                                        <span>Babyisland</span>
                                        <span className="text-[#F97316]">EG</span>
                                    </div>
                                ) : (
                                    <>
                                        {HERO_SLIDES[current].title1}{" "}
                                        <br />
                                        <span className="text-[#F97316]">
                                            {HERO_SLIDES[current].title2}
                                        </span>
                                    </>
                                )}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className={`font-bold leading-relaxed
                                    ${HERO_SLIDES[current].id === 0 
                                        ? 'text-[#F97316] tracking-[0.2em] uppercase text-center text-xs md:text-sm lg:text-lg'
                                        : 'text-white/90 text-sm md:text-base lg:text-xl mb-6 lg:mb-10 max-w-lg'}
                                `}
                            >
                                {HERO_SLIDES[current].desc}
                            </motion.p>

                            {!HERO_SLIDES[current].hideButtons && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.6 }}
                                    className="flex flex-wrap gap-3 md:gap-4 mt-4 md:mt-6"
                                >
                                    <Button size="xl" className="bg-[#F97316] hover:bg-[#ea580c] text-white gap-2 font-bold rounded-full shadow-lg shadow-orange-900/20 transition-all hover:-translate-y-1 h-12 px-6 text-base md:h-14 md:px-8 md:text-lg border-0" asChild>
                                        <LocaleLink href="/shop">
                                            {t('home.shopNow')}
                                            {isRtl ? <ArrowLeft className="w-5 h-5 mr-1" /> : <ChevronRight className="w-5 h-5 ml-1" />}
                                        </LocaleLink>
                                    </Button>
                                    <Button size="xl" variant="outline" 
                                        className={`backdrop-blur-sm border-2 font-bold rounded-full h-12 px-6 text-base md:h-14 md:px-8 md:text-lg
                                            ${HERO_SLIDES[current].layout === 'image-left' 
                                                ? 'bg-transparent border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white' 
                                                : 'bg-transparent border-white text-white hover:bg-white hover:text-[#0EA5E9]'}
                                        `} 
                                        asChild>
                                        <LocaleLink href="/shop">{t('home.exploreCollection')}</LocaleLink>
                                    </Button>
                                </motion.div>
                            )}
                        </div>

                        {/* Image Column */}
                        <div className={`
                            relative flex items-center justify-center pointer-events-none
                            ${HERO_SLIDES[current].layout === 'image-left' 
                                ? `h-[80px] lg:h-[100px] w-auto mb-0 ${isRtl ? 'order-2' : 'order-1'}`
                                : 'order-1 lg:order-2 h-[400px] lg:h-[600px] w-full'}
                        `}>
                            {/* Decorative Background blob */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-[100px] transform scale-90 animate-pulse" />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                    delay: 0.2,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 20
                                }}
                                className="relative z-10 w-full h-full flex items-center justify-center"
                            >
                                <motion.img
                                    src={HERO_SLIDES[current].img}
                                    alt={HERO_SLIDES[current].title1}
                                    animate={{
                                        y: [0, -12, 0],
                                        scale: [1, 1.02, 1]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 8,
                                        ease: "easeInOut"
                                    }}
                                    className="max-w-full max-h-[90%] object-contain drop-shadow-xl will-change-transform"
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                {HERO_SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setDirection(idx > current ? 1 : -1);
                            setCurrent(idx);
                        }}
                        className={`transition-all duration-300 rounded-full h-2.5 ${current === idx ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}



import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
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
            id: 1,
            title1: t('home.hero.slide1.title1'),
            title2: t('home.hero.slide1.title2'),
            desc: t('home.hero.slide1.desc'),
            img: "/hero-3d.png",
            bg: "from-[#E0F2FE] to-[#F0F9FF]"
        },
        {
            id: 2,
            title1: t('home.hero.slide2.title1'),
            title2: t('home.hero.slide2.title2'),
            desc: t('home.hero.slide2.desc'),
            img: "/hero-slide-2.png",
            bg: "from-[#FDF2F8] to-[#FFF1F2]"
        },
        {
            id: 3,
            title1: t('home.hero.slide3.title1'),
            title2: t('home.hero.slide3.title2'),
            desc: t('home.hero.slide3.desc'),
            img: "/hero-carseat.png",
            bg: "from-[#ECFEFF] to-[#F0FDFA]"
        }
    ], [t]);

    const slideCount = HERO_SLIDES.length;

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
        const timer = setInterval(nextSlide, 8000);
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
                    className={`absolute inset-0 bg-gradient-to-br ${HERO_SLIDES[current].bg}`}
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
                        className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full"
                    >
                        {/* Text Column */}
                        <div className="text-start lg:text-start order-2 lg:order-1 relative z-20">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                <span className="inline-block px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 text-sm font-bold text-primary mb-4 shadow-sm">
                                    {t('home.newArrival')}
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-5xl lg:text-7xl font-bold font-display text-gray-900 leading-[1.15] mb-6 drop-shadow-sm"
                            >
                                {HERO_SLIDES[current].title1}{" "}
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-[#F97316]">
                                    {HERO_SLIDES[current].title2}
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="text-lg lg:text-xl text-gray-600 mb-10 max-w-lg leading-relaxed mix-blend-multiply"
                            >
                                {HERO_SLIDES[current].desc}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Button size="xl" className="bg-primary hover:bg-primary/90 text-white gap-2 font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1 h-14 px-8 text-lg" asChild>
                                    <Link to="/shop">
                                        {t('home.shopNow')}
                                        {isRtl ? <ArrowLeft className="w-5 h-5 mr-1" /> : <ChevronRight className="w-5 h-5 ml-1" />}
                                    </Link>
                                </Button>
                                <Button size="xl" variant="outline" className="bg-white/50 backdrop-blur-sm border-2 hover:bg-white text-gray-800 font-bold rounded-full h-14 px-8 text-lg" asChild>
                                    <Link to="/shop">{t('home.exploreCollection')}</Link>
                                </Button>
                            </motion.div>
                        </div>

                        {/* Image Column */}
                        <div className="relative order-1 lg:order-2 h-[400px] lg:h-[600px] flex items-center justify-center pointer-events-none">
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
                                        y: [0, -25, 0],
                                        rotateX: [0, 5, 0],
                                        rotateZ: [0, -2, 0],
                                        scale: [1.05, 1.08, 1.05]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 8,
                                        ease: "easeInOut"
                                    }}
                                    className="max-w-[110%] max-h-[110%] object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.25)] filter contrast-105 saturate-105"
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
                        className={`transition-all duration-300 rounded-full h-2.5 ${current === idx ? "w-8 bg-primary" : "w-2.5 bg-primary/20 hover:bg-primary/40"}`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}


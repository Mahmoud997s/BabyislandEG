"use client";

import { useState, useEffect } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { productsService } from "@/services/productsService";
import { categories } from "@/data/products";
import { ArrowRight } from "lucide-react";

import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const categoryKeyMap: Record<string, string> = {
    'baby-care': 'babyCare',
    'strollers-gear': 'strollersGear',
    'feeding': 'feeding',
    'toys': 'toys',
    'nursery': 'nursery',
    'bathing': 'bathing',
    'shoes': 'shoes',
    'clothing': 'clothes',
    'diapering': 'diapering',
    'health': 'health',
    'maternity': 'maternity',
    'gifts': 'gifts',
    'travel': 'travel',
    'junior': 'junior'
};

// Note: We use high-quality curated images for categories to maintain a professional brand feel.
// Dynamic product images are often too inconsistent for a premium circular layout.
const fallbackImages: Record<string, string> = {
    'baby-care': '/categories/baby-care.png',
    'junior': '/categories/junior.png',
    'strollers-gear': '/categories/strollers-gear.png',
    'feeding': '/categories/feeding.png',
    'toys': '/categories/toys.png', 
    'nursery': '/categories/nursery.png', 
    'bathing': '/categories/bathing.png',
    'shoes': 'https://images.unsplash.com/photo-1510280131138-048d613df184?w=600&q=80',
    'clothing': '/categories/clothing.png', 
    'diapering': 'https://images.unsplash.com/photo-1622323719171-881b37265842?w=600&q=80',
    'health': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    'maternity': '/categories/maternity.png',
    'gifts': 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&q=80',
    'travel': 'https://images.unsplash.com/photo-1544652478-6653e09f9039?w=600&q=80',
};

export const BrowseByCategory = () => {
    const { t, i18n } = useTranslation();
    const direction = i18n.dir();
    
    // Using curated images directly for a professional consistency
    const categoryImages = fallbackImages;

    // Original core categories + Clothing/Maternity as requested for consistency
    const originalCategoryIds = ['baby-care', 'strollers-gear', 'feeding', 'toys', 'nursery', 'bathing', 'clothing', 'maternity'];
    const displayCategories = categories.filter(cat => originalCategoryIds.includes(cat.id));

    return (
        <section className="py-8 lg:py-12 bg-transparent">
            <div className="container-main">
                {/* Modern Header - Standardized */}
                <h2 className="text-3xl lg:text-5xl font-extrabold text-center mb-8 uppercase tracking-tighter">
                    {t('home.browseByCategory', 'BROWSE BY CATEGORY')}
                </h2>

                {/* Slider Layout */}
                <Carousel
                    opts={{
                        align: 'start',
                        loop: true,
                        direction: direction as 'rtl' | 'ltr',
                    }}
                    plugins={[
                        Autoplay({ delay: 4000, stopOnInteraction: false })
                    ]}
                    className="w-full relative px-4 sm:px-10"
                    dir={direction}
                >
                    <CarouselContent className="-ml-2 md:-ml-6 py-4">
                        {displayCategories.map((cat, index) => (
                            <CarouselItem key={cat.id} className="pl-2 md:pl-6 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    viewport={{ once: true }}
                                    className="group flex flex-col items-center gap-3"
                                >
                                    <LocaleLink
                                        href={cat.id === 'junior' ? '/shop?search=Junior' : `/shop?category=${cat.id}`}
                                        className="relative block w-full aspect-square rounded-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-4 border-white shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1"
                                    >
                                        {/* Image */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <img
                                                src={categoryImages[cat.id] || fallbackImages[cat.id] || '/placeholder.png'}
                                                alt={cat.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>

                                        {/* Overlay on Hover */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                                    </LocaleLink>
                                    
                                    {/* Text Label */}
                                    <h3 className="text-sm md:text-base font-bold text-center text-gray-800 group-hover:text-[#F97316] transition-colors">
                                        {t(`categories.${categoryKeyMap[cat.id] || cat.id}`, cat.name)}
                                    </h3>
                                </motion.div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    
                    {/* Navigation Arrows */}
                    <CarouselPrevious className="hidden sm:flex -left-2 sm:-left-4 border-none shadow-md bg-white/90 hover:bg-[#F97316] hover:text-white" />
                    <CarouselNext className="hidden sm:flex -right-2 sm:-right-4 border-none shadow-md bg-white/90 hover:bg-[#F97316] hover:text-white" />
                </Carousel>
            </div>
        </section>
    );
};

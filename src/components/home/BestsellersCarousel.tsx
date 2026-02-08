import React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { MinimalProductCard } from '@/components/product/MinimalProductCard';
import { Product } from '@/data/products';
import { useTranslation } from 'react-i18next';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

interface BestsellersCarouselProps {
    products: Product[];
}

export const BestsellersCarousel = ({ products }: BestsellersCarouselProps) => {
    const { i18n } = useTranslation();
    const direction = i18n.dir(); // 'rtl' or 'ltr'

    return (
        <Carousel
            opts={{
                align: 'start',
                loop: true,
                direction: direction as 'rtl' | 'ltr',
            }}
            plugins={[
                Autoplay({ delay: 3000, stopOnInteraction: false })
            ]}
            className="w-full"
            dir={direction}
        >
            <CarouselContent className="-ml-2 md:-ml-4 py-6">
                {/* ml- adjustment needed because shadcn carousel adds pl- on items */}
                {products.map((product, index) => (
                    <CarouselItem
                        key={product.id}
                        className="pl-2 md:pl-4 basis-[85%] sm:basis-1/2 md:basis-1/4 lg:basis-1/6"
                    >
                        <div className="h-full relative">
                            <MinimalProductCard product={product} />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {/* Navigation Arrows */}
            <div className="hidden md:block">
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md border-0 text-foreground" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md border-0 text-foreground" />
            </div>
        </Carousel>
    );
};

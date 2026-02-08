"use client";


import { useEffect, useState } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { productsService } from "@/services/productsService";
import { Product } from "@/data/products";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/ui/price-display";

import { MinimalProductCard } from "@/components/product/MinimalProductCard";

export const NewArrivals = () => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Fetch products and show ONLY those marked as isNew
        productsService.getAllProducts().then((allProducts) => {
            // Restore logic: Show only products marked as isNew
            const newProducts = allProducts.filter(p => p.isNew);
            setProducts(newProducts);
        });
    }, []);

    // if (products.length === 0) return null; // Keeping section visible as per user request

    const displayedProducts = isExpanded ? products.slice(0, 24) : products.slice(0, 6);

    return (
        <section className="py-8 lg:py-12">
            <div className="container-main">
                <h2 className="text-3xl lg:text-5xl font-extrabold text-center mb-8 uppercase tracking-tighter">
                    {t('home.newArrivalsTitle', 'NEW ARRIVALS')}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
                    {displayedProducts.length > 0 ? (
                        displayedProducts.map((product) => (
                            <MinimalProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            {t('home.noNewArrivals', 'Coming Soon...')}
                        </div>
                    )}
                </div>

                {products.length > 6 && (
                    <div className="mt-12 text-center">
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full px-12 min-w-[200px]"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? t('common.showLess', 'Show Less') : t('common.showMore', 'More')}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};

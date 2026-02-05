
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Fetch products and take the first 4 (acting as new arrivals)
        productsService.getAllProducts().then((allProducts) => {
            // Sort by isNew or just arbitrary "newness" if no date field
            const newProducts = allProducts.filter(p => p.isNew).slice(0, 4);
            const displayProducts = newProducts.length > 0 ? newProducts : allProducts.slice(0, 4);
            setProducts(displayProducts);
        });
    }, []);

    return (
        <section className="py-12 lg:py-16">
            <div className="container-main">
                <h2 className="text-3xl lg:text-5xl font-extrabold text-center mb-12 uppercase tracking-tighter font-display">
                    {t('home.newArrivalsTitle', 'NEW ARRIVALS')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {products.map((product) => (
                        <MinimalProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button variant="outline" size="lg" className="rounded-full px-12 min-w-[200px]" asChild>
                        <Link to="/shop?sort=newest">{t('common.viewAll', 'View All')}</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

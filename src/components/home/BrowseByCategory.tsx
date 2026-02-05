import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { productsService } from "@/services/productsService";
import { categories } from "@/data/products";
import { ArrowRight } from "lucide-react";

const categoryKeyMap: Record<string, string> = {
    'strollers-gear': 'strollersGear',
    'feeding': 'feeding',
    'toys': 'toys',
    'nursery': 'nursery',
    'bathing': 'bathing'
};

// Fallback images styled to match the new design
const fallbackImages: Record<string, string> = {
    'strollers-gear': 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2070&auto=format&fit=crop',
    'feeding': 'https://images.unsplash.com/photo-1542993529-8a6c8e3cc59e?q=80&w=2070&auto=format&fit=crop',
    'toys': 'https://images.unsplash.com/photo-1515488046738-142d7732d84c?q=80&w=2073&auto=format&fit=crop',
    'nursery': 'https://images.unsplash.com/photo-1512918760530-7727521524be?q=80&w=2076&auto=format&fit=crop',
    'bathing': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop'
};

export const BrowseByCategory = () => {
    const { t, i18n } = useTranslation();
    const [categoryImages, setCategoryImages] = useState<Record<string, string>>(fallbackImages);
    const isRtl = i18n.dir() === 'rtl';

    useEffect(() => {
        productsService.getAllProducts().then((allProducts) => {
            const newImages: Record<string, string> = { ...fallbackImages };
            categories.slice(0, 4).forEach(cat => {
                const product = allProducts.find(p => p.category === cat.id && p.images && p.images.length > 0);
                if (product && product.images && product.images[0]) {
                    newImages[cat.id] = product.images[0];
                }
            });
            setCategoryImages(newImages);
        });
    }, []);

    const displayCategories = categories.slice(0, 4);

    return (
        <section className="py-12 lg:py-20 bg-transparent">
            <div className="container-main">
                {/* Modern Header */}
                <div className="flex flex-col items-center justify-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-black text-center uppercase font-display tracking-tight text-foreground">
                        {t('home.browseByCategory', 'BROWSE BY CATEGORY')}
                    </h2>
                    <div className="w-24 h-1 bg-primary rounded-full mt-4" />
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
                    {displayCategories.map((cat, index) => {
                        const isWide = index === 1 || index === 2;
                        const colSpan = isWide ? "md:col-span-2" : "md:col-span-1";

                        return (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className={cn(colSpan, "relative group overflow-hidden rounded-[32px]")}
                            >
                                <Link
                                    to={`/shop?category=${cat.id}`}
                                    className="block w-full h-full bg-white border border-gray-100/50 shadow-sm hover:shadow-xl transition-all duration-500"
                                >
                                    {/* Text Content */}
                                    <div className="absolute top-6 left-6 z-20">
                                        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                            {t(`categories.${categoryKeyMap[cat.id] || cat.id}`)}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            <span className="text-sm font-medium text-muted-foreground">Shop Now</span>
                                            <ArrowRight className={cn("w-4 h-4 text-primary", isRtl && "rotate-180")} />
                                        </div>
                                    </div>

                                    {/* Image */}
                                    <div className={cn(
                                        "absolute bottom-0 right-0 w-3/4 h-3/4 transition-all duration-700 ease-out group-hover:scale-110",
                                        isRtl ? "left-0 right-auto" : "right-0"
                                    )}>
                                        <img
                                            src={categoryImages[cat.id]}
                                            alt={cat.name}
                                            className="w-full h-full object-contain object-bottom mix-blend-multiply opacity-90 group-hover:opacity-100"
                                        />
                                    </div>

                                    {/* Decorative Background Gradient (Very Subtle) */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent pointer-events-none" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

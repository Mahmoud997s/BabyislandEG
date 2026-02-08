"use client";

import { useEffect, useState } from "react";
import { productsService } from "@/services/productsService";
import { Product } from "@/data/products";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { MinimalProductCard } from "@/components/product/MinimalProductCard";

interface RelatedProductsProps {
    currentProductId: string | number;
    category?: string;
    limit?: number;
}

export function RelatedProducts({ currentProductId, category, limit = 4 }: RelatedProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRelatedProducts();
    }, [currentProductId, category]);

    const loadRelatedProducts = async () => {
        setLoading(true);

        try {
            // Use optimized service method that fetches only what is needed
            // instead of fetching ALL products and filtering client-side.
            const relatedProducts = await productsService.getRelatedProducts(
                String(currentProductId),
                category,
                limit
            );
            setProducts(relatedProducts);
        } catch (error) {
            console.error("Failed to load related products", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (products.length === 0) return null;

    return (
        <div dir="rtl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <MinimalProductCard product={product} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

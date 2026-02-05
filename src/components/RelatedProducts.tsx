import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { productsService, Product } from "@/services/productsService";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface RelatedProductsProps {
    currentProductId: number;
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

        // Get products from the same category
        let relatedProducts: Product[] = [];

        if (category) {
            relatedProducts = await productsService.getProductsByCategory(category);
            // Filter out current product
            relatedProducts = relatedProducts.filter(p => p.id !== currentProductId);
        }

        // If not enough, get random products
        if (relatedProducts.length < limit) {
            const allProducts = await productsService.getAllProducts();
            const filtered = allProducts.filter(p => p.id !== currentProductId);
            relatedProducts = [...relatedProducts, ...filtered].slice(0, limit);
        }

        // Shuffle and limit
        relatedProducts = relatedProducts
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);

        setProducts(relatedProducts);
        setLoading(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(amount);
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
        <div className="mt-12" dir="rtl">
            <h2 className="text-2xl font-bold mb-6">منتجات ذات صلة</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link to={`/product/${product.id}`}>
                            <Card className="group hover:shadow-xl transition-shadow border-0 shadow-md overflow-hidden">
                                <div className="relative aspect-square overflow-hidden">
                                    <img
                                        src={product.images?.[0] || "/placeholder.png"}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <CardContent className="p-3">
                                    <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-lg font-bold text-primary">
                                        {formatCurrency(product.price)}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

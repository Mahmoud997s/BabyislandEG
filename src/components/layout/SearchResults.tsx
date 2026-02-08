"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { Product } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface SearchResultsProps {
    results: Product[];
    isLoading: boolean;
    onClose: () => void;
    query: string;
}

export function SearchResults({ results, isLoading, onClose, query }: SearchResultsProps) {
    if (!query) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-8 flex flex-col items-center justify-center text-muted-foreground"
                    >
                        <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
                        <span className="text-sm">جاري البحث...</span>
                    </motion.div>
                ) : results.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="p-3 bg-gray-50/50 border-b text-xs font-semibold text-muted-foreground">
                            نتائج البحث عن "{query}" ({results.length})
                        </div>
                        <ul className="divide-y divide-gray-50">
                            {results.map((product) => (
                                <li key={product.id}>
                                    <LocaleLink
                                        href={`/product/${product.id}`}
                                        className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors group"
                                        onClick={onClose}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-white border p-1 shrink-0 flex items-center justify-center">
                                            <img
                                                src={product.images?.[0] || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {product.brand}
                                            </p>
                                        </div>
                                        <div className="text-sm font-bold text-primary whitespace-nowrap">
                                            {formatCurrency(product.price)}
                                        </div>
                                    </LocaleLink>
                                </li>
                            ))}
                        </ul>
                        <div className="p-2 bg-gray-50/50 border-t text-center">
                            <LocaleLink
                                href={`/shop?search=${encodeURIComponent(query)}`}
                                className="text-xs text-primary hover:underline font-medium"
                                onClick={onClose}
                            >
                                عرض جميع النتائج
                            </LocaleLink>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-8 text-center text-muted-foreground"
                    >
                        <p className="text-sm">لا توجد نتائج مطابقة لـ "{query}"</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

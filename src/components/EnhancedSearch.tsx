import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SearchFilters {
    query: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    sortBy: 'price-asc' | 'price-desc' | 'name' | 'newest';
}

interface EnhancedSearchProps {
    onSearch: (filters: SearchFilters) => void;
    categories?: string[];
}

export function EnhancedSearch({ onSearch, categories = [] }: EnhancedSearchProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        query: '',
        category: 'all',
        minPrice: 0,
        maxPrice: 10000,
        sortBy: 'newest'
    });

    const handleSearch = () => {
        onSearch(filters);
    };

    const handleReset = () => {
        const resetFilters: SearchFilters = {
            query: '',
            category: 'all',
            minPrice: 0,
            maxPrice: 10000,
            sortBy: 'newest'
        };
        setFilters(resetFilters);
        onSearch(resetFilters);
    };

    return (
        <div className="space-y-4" dir="rtl">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Input
                        placeholder="ابحث عن المنتجات..."
                        value={filters.query}
                        onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="pr-10"
                    />
                    <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    فلاتر
                </Button>
                <Button onClick={handleSearch}>
                    بحث
                </Button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-slate-50 border rounded-lg p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">الفئة</label>
                                    <Select
                                        value={filters.category}
                                        onValueChange={(v) => setFilters({ ...filters, category: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">كل الفئات</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort By */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ترتيب حسب</label>
                                    <Select
                                        value={filters.sortBy}
                                        onValueChange={(v: any) => setFilters({ ...filters, sortBy: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="newest">الأحدث</SelectItem>
                                            <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
                                            <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
                                            <SelectItem value="name">الاسم</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">نطاق السعر</label>
                                <div className="px-2">
                                    <Slider
                                        min={0}
                                        max={10000}
                                        step={100}
                                        value={[filters.minPrice, filters.maxPrice]}
                                        onValueChange={([min, max]) => setFilters({ ...filters, minPrice: min, maxPrice: max })}
                                        className="mb-2"
                                    />
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>{filters.minPrice} جنيه</span>
                                        <span>{filters.maxPrice} جنيه</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleSearch} className="flex-1">
                                    تطبيق الفلاتر
                                </Button>
                                <Button onClick={handleReset} variant="outline" className="gap-2">
                                    <X className="w-4 h-4" />
                                    إعادة تعيين
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

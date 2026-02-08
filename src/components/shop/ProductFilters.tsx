import { useTranslation } from "react-i18next";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProductFiltersProps {
    categories: { id: string; name: string }[];
    selectedCategory: string;
    onCategoryChange: (id: string) => void;
    priceRange: number[];
    onPriceRangeChange: (range: number[]) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
    className?: string;
    onClose?: () => void;
}

export function ProductFilters({
    categories,
    selectedCategory,
    onCategoryChange,
    priceRange,
    onPriceRangeChange,
    sortBy,
    onSortChange,
    className,
    onClose
}: ProductFiltersProps) {
    const { t } = useTranslation();

    return (
        <div className={cn("space-y-8", className)}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="font-semibold">{t("common.filter")}</h2>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Categories */}
            <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">{t("nav.categories")}</h3>
                <div className="space-y-1">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all",
                                selectedCategory === cat.id
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <span>{cat.name}</span>
                            {selectedCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">{t("common.price", "Price")} (EGP)</h3>
                <div className="space-y-4 px-2">
                    <Slider
                        defaultValue={[0, 50000]}
                        max={50000}
                        step={100}
                        value={priceRange}
                        onValueChange={onPriceRangeChange}
                        className="py-4"
                    />
                    <div className="flex items-center justify-between text-sm">
                        <div className="border px-2 py-1 rounded bg-muted/50">{priceRange[0]}</div>
                        <span className="text-muted-foreground">-</span>
                        <div className="border px-2 py-1 rounded bg-muted/50">{priceRange[1]}</div>
                    </div>
                </div>
            </div>

            {/* Sort */}
            <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">{t("common.sort")}</h3>
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full p-2.5 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                    <option value="recommended">{t("sort.recommended", "Recommended")}</option>
                    <option value="best-sellers">{t("common.bestSeller")}</option>
                    <option value="price-low">{t("sort.priceLowHigh")}</option>
                    <option value="price-high">{t("sort.priceHighLow")}</option>
                    <option value="rating">{t("sort.rating")}</option>
                    <option value="newest">{t("sort.newest")}</option>
                </select>
            </div>
        </div>
    );
}

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductFilters } from "./ProductFilters";
import { useState } from "react";

interface MobileFiltersProps {
    categories: { id: string; name: string }[];
    selectedCategory: string;
    onCategoryChange: (id: string) => void;
    priceRange: number[];
    onPriceRangeChange: (range: number[]) => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
}

export function MobileFilters(props: MobileFiltersProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden shrink-0 gap-2">
                    <Filter className="w-4 h-4" />
                    {t("common.filter")}
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl sm:max-w-none sm:h-full sm:w-[400px] sm:side-right sm:rounded-none">
                <div className="h-full overflow-y-auto pb-8">
                    <ProductFilters
                        {...props}
                        className="mt-4"
                        onClose={() => setOpen(false)}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}

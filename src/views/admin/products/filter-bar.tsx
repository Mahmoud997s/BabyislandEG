"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Search, XCircle, Star, Sparkles, AlertCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function ProductsFilterBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for immediate feedback
    const [search, setSearch] = useState(searchParams.get("q") || "");
    const debouncedSearch = useDebounce(search, 400);

    const updateUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "" || value === "all" || value === "false") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        // Reset page on filter change
        if (!updates.page) {
            params.set("page", "1");
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, router]);

    // Sync search with URL
    useEffect(() => {
        if (debouncedSearch !== (searchParams.get("q") || "")) {
            updateUrl({ q: debouncedSearch });
        }
    }, [debouncedSearch, updateUrl, searchParams]);

    // Handlers
    const stock = searchParams.get("stock") || "all";
    const category = searchParams.get("category") || "all";
    const isBestSeller = searchParams.get("isBestSeller") === "true";
    const isNew = searchParams.get("isNew") === "true";
    const missing = searchParams.get("missing") === "1" || searchParams.get("missing") === "true";

    const hasFilters = search || stock !== "all" || category !== "all" || isBestSeller || isNew || missing;

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
                {/* Search */}
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search products..." 
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Filters Group */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Stock Filter */}
                    <Select value={stock} onValueChange={(val) => updateUrl({ stock: val })}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Stock Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stock</SelectItem>
                            <SelectItem value="low">Low Stock (&lt;5)</SelectItem>
                            <SelectItem value="out">Out of Stock</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Category Filter (Hardcoded for now, ideal to fetch) */}
                    <Select value={category} onValueChange={(val) => updateUrl({ category: val })}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="strollers">Strollers</SelectItem>
                            <SelectItem value="car-seats">Car Seats</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Toggles */}
                    <div className="flex bg-slate-100 p-1 rounded-md">
                        <Toggle 
                            pressed={isBestSeller} 
                            onPressedChange={(p) => updateUrl({ isBestSeller: p ? "true" : "false" })}
                            size="sm"
                            aria-label="Toggle Best Sellers"
                            className="data-[state=on]:bg-white data-[state=on]:text-amber-600 data-[state=on]:shadow-sm"
                        >
                            <Star className="h-4 w-4 mr-1" /> Best
                        </Toggle>
                        <Toggle 
                            pressed={isNew} 
                            onPressedChange={(p) => updateUrl({ isNew: p ? "true" : "false" })}
                            size="sm"
                            aria-label="Toggle New Arrivals"
                            className="data-[state=on]:bg-white data-[state=on]:text-blue-600 data-[state=on]:shadow-sm"
                        >
                            <Sparkles className="h-4 w-4 mr-1" /> New
                        </Toggle>
                        <Toggle 
                            pressed={missing} 
                            onPressedChange={(p) => updateUrl({ missing: p ? "1" : "false" })}
                            size="sm"
                            aria-label="Toggle Missing Data"
                            className="data-[state=on]:bg-white data-[state=on]:text-red-600 data-[state=on]:shadow-sm"
                        >
                            <AlertCircle className="h-4 w-4 mr-1" /> Missing Data
                        </Toggle>
                    </div>

                    {/* Clear */}
                    {hasFilters && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                                setSearch("");
                                router.replace(pathname);
                            }}
                            title="Clear all filters"
                        >
                            <XCircle className="h-4 w-4 text-slate-500" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Filter, ChevronRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { MinimalProductCard } from "@/components/product/MinimalProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { productsService } from "@/services/productsService";
import { Product, categories as allCategories } from "@/data/products";
import { cn } from "@/lib/utils";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { MobileFilters } from "@/components/shop/MobileFilters";

const ITEMS_PER_PAGE = 54;

// Category ID to translation key mapping
const categoryKeyMap: Record<string, string> = {
    'baby-care': 'babyCare',
    'strollers-gear': 'strollersGear',
    'feeding': 'feeding',
    'toys': 'toys',
    'nursery': 'nursery',
    'bathing': 'bathing',
    'clothing': 'clothing',
    'shoes': 'shoes',
    'diapering': 'diapering',
    'health': 'health',
    'maternity': 'maternity',
    'gifts': 'gifts',
    'travel': 'travel',
    'junior': 'junior'
};

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { t, i18n } = useTranslation();

  const selectedCategory = searchParams?.get("category") || "all";
  const sortBy = searchParams?.get("sort") || "recommended";

  // Local filter states
  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");
  const [priceRange, setPriceRange] = useState([0, 50000]); // Max 50k EGP

  // Sync URL search to state (for Navbar search)
  useEffect(() => {
    const query = searchParams?.get("search");
    if (query !== null && query !== searchTerm) {
      setSearchTerm(query || "");
    }
  }, [searchParams]);

  // Categories definition matching JSON sources
  const categoriesList = [
    { id: "all", name: t("categories.all") },
    { id: "baby-care", name: t("categories.babyCare") },
    { id: "strollers-gear", name: t("categories.strollersGear") },
    { id: "feeding", name: t("categories.feeding") },
    { id: "toys", name: t("categories.toys") },
    { id: "clothing", name: t("categories.clothing", "Melabes (Clothing)") }, 
    { id: "maternity", name: t("categories.maternity", "Omoma (Maternity)") }, 
    { id: "nursery", name: t("categories.nursery") },
    { id: "bathing", name: t("categories.bathing") },
  ];

  // Fetch with filters
  useEffect(() => {
    const fetch = async () => {
      const data = await productsService.getFilteredProducts({
        category: selectedCategory,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sort: sortBy,
        search: searchTerm
      });
      setProducts(data);
    };

    // Debounce fetch for slider/search
    const timeout = setTimeout(fetch, 500);
    return () => clearTimeout(timeout);

  }, [selectedCategory, sortBy, priceRange, searchTerm]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortBy, priceRange, searchTerm]);

  // Pagination calculations (Backend returns full filtered list, we page internally)
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (cat === "all") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Layout>
      <div className="container-main py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{t("nav.shop")}</h1>
            <p className="text-muted-foreground">
              {products.length} {t("common.products")}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Input
                placeholder={t("common.search", "Search products...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <Filter className="w-4 h-4 absolute left-2.5 top-3 text-muted-foreground opacity-50" />
            </div>

            <MobileFilters
              categories={categoriesList}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              sortBy={sortBy}
              onSortChange={(val) => {
                const params = new URLSearchParams(searchParams?.toString() || "");
                params.set("sort", val);
                router.push(`${pathname}?${params.toString()}`);
              }}
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 border-r pr-6">
            <ProductFilters
              categories={categoriesList}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              sortBy={sortBy}
              onSortChange={(val) => {
                const params = new URLSearchParams(searchParams?.toString() || "");
                params.set("sort", val);
                router.push(`${pathname}?${params.toString()}`);
              }}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                <p className="text-muted-foreground text-lg">{t("common.noProducts")}</p>
                <Button variant="link" onClick={() => {
                  setSearchTerm("");
                  setPriceRange([0, 50000]);
                  handleCategoryChange("all");
                }}>
                  {t("common.clearFilters")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {paginatedProducts.map((product) => (
                  <MinimalProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 mb-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "rounded-full w-10 h-10 border-2 transition-all duration-300",
                    "border-[#E0F2FE] text-[#0EA5E9] hover:border-[#0EA5E9] hover:bg-[#E0F2FE]/20 hover:text-[#0284C7]",
                    "disabled:opacity-30 disabled:border-gray-100 disabled:bg-transparent"
                  )}
                >
                  <ChevronRight className={cn(i18n.language === 'ar' ? "rotate-0" : "rotate-180", "w-5 h-5")} />
                </Button>

                <div className="flex items-center gap-1 px-1">
                  <span className="text-sm font-medium">
                    {t("common.pageInfo", { current: currentPage, total: totalPages })}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "rounded-full w-10 h-10 border-2 transition-all duration-300",
                    "border-[#E0F2FE] text-[#0EA5E9] hover:border-[#0EA5E9] hover:bg-[#E0F2FE]/20 hover:text-[#0284C7]",
                    "disabled:opacity-30 disabled:border-gray-100 disabled:bg-transparent"
                  )}
                >
                  <ChevronRight className={cn(i18n.language === 'ar' ? "rotate-180" : "rotate-0", "w-5 h-5")} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

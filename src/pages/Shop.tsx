import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { products, categories } from "@/data/products";
import { cn } from "@/lib/utils";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const selectedCategory = searchParams.get("category") || "";
  const sortBy = searchParams.get("sort") || "best-sellers";

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return result;
  }, [selectedCategory, sortBy]);

  const handleCategoryChange = (cat: string) => {
    if (cat === selectedCategory) {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <Layout>
      <div className="container-main py-8 lg:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">المتجر</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} منتج
            </p>
          </div>
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 ml-2" />
            فلترة
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={cn(
              "fixed inset-0 z-40 bg-background lg:static lg:block lg:w-64 shrink-0 transition-transform lg:translate-x-0",
              showFilters ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="p-6 lg:p-0">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="font-semibold">الفلاتر</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">الفئات</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors",
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-card hover:bg-accent"
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs opacity-70">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold mb-4">الترتيب</h3>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    searchParams.set("sort", e.target.value);
                    setSearchParams(searchParams);
                  }}
                  className="w-full p-3 rounded-lg bg-card border text-sm"
                >
                  <option value="best-sellers">الأكثر مبيعاً</option>
                  <option value="price-low">السعر: من الأقل للأعلى</option>
                  <option value="price-high">السعر: من الأعلى للأقل</option>
                  <option value="rating">التقييم</option>
                  <option value="newest">الأحدث</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 6} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

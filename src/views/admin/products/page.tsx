"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { productsService } from "@/services/productsService";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { ProductsGrid } from "./products-grid";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { motion } from "framer-motion";

export default function ProductsPage() {
    // Data State
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    
    // Pagination & Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [searchQuery, setSearchQuery] = useState("");
    
    const debouncedSearch = useDebounce(searchQuery, 400);

    // Abort Controller for search cancellation
    const abortControllerRef = useRef<AbortController | null>(null);

    const loadData = useCallback(async () => {
        // Cancel previous request if active
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            // Using the new Admin API with server-side pagination and search
            const result = await productsService.getAdminProducts(currentPage, pageSize, debouncedSearch);
            setData(result.rows);
            setTotalProducts(result.total);
        } catch (error: unknown) {
            if (error instanceof Error && error.name === 'AbortError') return;
            console.error("Failed to fetch products", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedSearch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    const totalPages = Math.ceil(totalProducts / pageSize);
    const canPrevious = currentPage > 1;
    const canNext = currentPage < totalPages;

    return (
        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
            {/* Header */}
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">
                        Manage your store's inventory and catalog ({totalProducts.toLocaleString()} total).
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={loadData}
                        disabled={loading}
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>

                    <div className="flex items-center border rounded-md bg-white mr-4">
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("list")}
                            className="h-9 w-9 rounded-none bg-none"
                            title="List View"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className="h-9 w-9 rounded-none"
                            title="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    <LocaleLink href="/admin/products/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </LocaleLink>
                </div>
            </div>

            {/* Config Bar (Search + Filters placeholder) */}
            <div className="flex items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search products..." 
                        className="pl-10" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area */}
            {loading && data.length === 0 ? (
                <TableSkeleton />
            ) : (
                <div className="relative">
                    {/* Overlay Spinner for re-fetching existing data */}
                    {loading && data.length > 0 && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {viewMode === "list" ? (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            <DataTable columns={columns} data={data} />
                            
                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between border-t pt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} entries
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={!canPrevious}
                                        onClick={() => setCurrentPage(1)}
                                        title="First Page"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={!canPrevious}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        title="Previous Page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm px-4">
                                        Page {currentPage} of {totalPages || 1}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={!canNext}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        title="Next Page"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={!canNext}
                                        onClick={() => setCurrentPage(totalPages)}
                                        title="Last Page"
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <ProductsGrid data={data} />
                    )}
                </div>
            )}
        </div>
    );
}

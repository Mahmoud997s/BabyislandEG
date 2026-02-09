"use client";

import { useEffect, useState, useCallback } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { productsService } from "@/services/productsService";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, RefreshCw } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { ProductsGrid } from "./products-grid";
import { toast } from "sonner";

export default function ProductsPage() {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Using the new Admin API via getAllProducts replacement or new method
            // The service now has getAdminProducts which fetches from API
            const result = await productsService.getAdminProducts(currentPage, 100); 
            setData(result.rows);
            setTotalProducts(result.total);
        } catch (error) {
            console.error("Failed to fetch products", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">
                        Manage your store's inventory and catalog ({totalProducts} total).
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

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                viewMode === "list" ? (
                    <DataTable columns={columns} data={data} />
                ) : (
                    <ProductsGrid data={data} />
                )
            )}
        </div>
    );
}

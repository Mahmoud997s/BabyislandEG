"use client";

import { Product } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleProductField } from "@/actions/products";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ProductsGridProps {
    data: Product[];
}

export function ProductsGrid({ data }: ProductsGridProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 border rounded-md bg-white">
                <p className="text-muted-foreground">No products found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data.map((product) => (
                <div key={product.id} className="relative group flex flex-col gap-2">
                    <ProductCard product={product} />
                    
                    {/* Admin Actions Overlay */}
                    <div className="bg-white border rounded-lg p-3 shadow-sm flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">New Arrival</span>
                            <AdminSwitch 
                                productId={product.id} 
                                field="isNew" 
                                initialValue={product.isNew || false} 
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">Best Seller</span>
                            <AdminSwitch 
                                productId={product.id} 
                                field="isBestSeller" 
                                initialValue={product.isBestSeller || false} 
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AdminSwitch({ productId, field, initialValue }: { productId: string, field: "isNew" | "isBestSeller", initialValue: boolean }) {
    const [checked, setChecked] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (val: boolean) => {
        setChecked(val);
        setLoading(true);
        try {
            await toggleProductField(productId, field, val);
            toast.success("Updated successfully");
        } catch (e: any) {
            toast.error("Failed the update");
            setChecked(!val);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Switch
            checked={checked}
            onCheckedChange={handleToggle}
            disabled={loading}
            className="scale-75 origin-right"
        />
    );
}

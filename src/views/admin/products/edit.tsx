"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/admin/products/ProductForm";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditProductPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProduct() {
            if (!id) return;

            try {
                // Use Admin API to ensure we can see hidden/draft products
                const res = await fetch(`/api/admin/products/${id}`, {
                    credentials: "include"
                });

                if (!res.ok) {
                    if (res.status === 404) throw new Error("Product not found");
                    if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
                    throw new Error("Failed to fetch product");
                }

                const data = await res.json();
                console.log("Fetched product:", data);
                setProduct(data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch product details");
                router.push("/admin/products");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [id, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
            </div>
            {product && <ProductForm initialData={product} />}
        </div>
    );
}

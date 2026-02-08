"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function CleanupPage() {
    const [status, setStatus] = useState("Idle");
    const [counts, setCounts] = useState<{ toys: number; shoes: number } | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUserId(session?.user?.id || "Anonymous (Might reference RLS issues)");
    };

    const checkCounts = async () => {
        const { count: toysCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category', 'toys');

        const { count: shoesCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category', 'shoes');

        setCounts({ toys: toysCount || 0, shoes: shoesCount || 0 });
    };

    const handleCleanup = async () => {
        setStatus("Starting Cleanup...");
        try {
            await checkCounts();

            // 1. Delete Reviews (soft check)
            setStatus("Clearing Reviews & Wishlist...");
            // Get all IDs first
            const { data: products } = await supabase
                .from('products')
                .select('id')
                .in('category', ['toys', 'shoes']);

            if (products && products.length > 0) {
                const ids = products.map(p => p.id);
                await supabase.from('reviews').delete().in('product_id', ids);
                await supabase.from('wishlist_items').delete().in('product_id', ids);
            }

            // 2. Delete Products
            setStatus("Deleting Products...");
            const { error: toysError, count: toysDeleted } = await supabase
                .from('products')
                .delete({ count: 'exact' })
                .eq('category', 'toys');

            if (toysError) throw toysError;

            const { error: shoesError, count: shoesDeleted } = await supabase
                .from('products')
                .delete({ count: 'exact' })
                .eq('category', 'shoes');

            if (shoesError) throw shoesError;

            setStatus(`Success! Deleted ${toysDeleted} toys and ${shoesDeleted} shoes.`);
            await checkCounts();

        } catch (e: any) {
            setStatus("Error: " + e.message);
            console.error(e);
        }
    };

    return (
        <div className="p-20 text-center max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Deep Cleanup Tool</h1>

            <div className="bg-gray-100 p-4 rounded text-left">
                <p><strong>User:</strong> {userId}</p>
                <div className="flex gap-4 items-center mt-2">
                    <Button variant="outline" onClick={checkCounts}>Check Counts</Button>
                    {counts && (
                        <span>Found: {counts.toys} Toys, {counts.shoes} Shoes</span>
                    )}
                </div>
            </div>

            <div className="border border-red-200 bg-red-50 p-6 rounded-xl">
                <h3 className="text-red-700 font-bold mb-2">Danger Zone</h3>
                <p className="text-sm text-red-600 mb-4">
                    This will permanently delete all products in "toys" and "shoes" categories,
                    along with their reviews and wishlist items.
                </p>
                <p className="font-mono bg-white p-2 rounded mb-4 overflow-auto">Status: {status}</p>
                <Button variant="destructive" size="lg" className="w-full" onClick={handleCleanup}>
                    Confirm Delete All
                </Button>
            </div>
        </div>
    );
}

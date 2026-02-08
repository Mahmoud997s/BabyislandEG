"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function UpdateMarginPage() {
    const [status, setStatus] = useState("جاهز");
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('id, name_ar, price, price_margin, source_platform')
            .eq('source_platform', 'amazon');
        setProducts(data || []);
    };

    const handleUpdateMargin = async () => {
        setStatus("جاري التحديث...");

        // Update price_margin to 15% for all Amazon products
        const { error } = await supabase
            .from('products')
            .update({ price_margin: 15 })
            .eq('source_platform', 'amazon');

        if (error) {
            setStatus("❌ خطأ: " + error.message);
        } else {
            // Also update the actual prices with 15% margin
            for (const product of products) {
                const newPrice = Math.round(product.price * 1.15);
                await supabase
                    .from('products')
                    .update({ price: newPrice })
                    .eq('id', product.id);
            }
            setStatus(`✅ تم تحديث ${products.length} منتج بهامش ربح 15%`);
            await loadProducts();
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">تحديث هامش الربح 💰</h1>

            <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
                <p className="text-green-800 font-medium">سيتم إضافة هامش ربح 15% على جميع المنتجات المستوردة</p>
            </div>

            <div className="mb-6 border rounded-lg p-4">
                <h2 className="font-semibold mb-3">المنتجات ({products.length})</h2>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-right py-2">المنتج</th>
                            <th className="text-center py-2">السعر الحالي</th>
                            <th className="text-center py-2">السعر الجديد (+15%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="border-b">
                                <td className="py-2 text-xs">{p.name_ar}</td>
                                <td className="text-center text-gray-500">{p.price} EGP</td>
                                <td className="text-center text-green-600 font-medium">
                                    {Math.round(p.price * 1.15)} EGP
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Button onClick={handleUpdateMargin} size="lg" className="w-full">
                ✅ تطبيق هامش الربح 15%
            </Button>

            <p className="mt-4 p-3 bg-gray-100 rounded text-center">{status}</p>
        </div>
    );
}

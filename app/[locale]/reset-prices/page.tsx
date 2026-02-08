"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Original prices before any margin was applied
const originalPrices: { [key: string]: number } = {
    "منزل الدمى الفاخر من Next Store": 850,
    "مجموعة جاك سبراتس": 450,
    "سيارة ركوب بلازما للأطفال من دريم لاند": 1200,
    "بلازما للأطفال دريم ورمادي": 1150,
    "سكوتر للاطفال": 750,
    "سكوتر قابل للطي بثلاث عجلات": 780,
    "دراجة اطفال ولادي وبناتي": 1800,
    "سكوتر كاندي بعجلات": 2250,
};

export default function ResetPricesPage() {
    const [status, setStatus] = useState("جاهز");
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('id, name_ar, name, price, source_platform')
            .eq('source_platform', 'amazon');
        setProducts(data || []);
    };

    // Find original price by matching product name
    const getOriginalPrice = (name: string): number => {
        for (const [key, value] of Object.entries(originalPrices)) {
            if (name.includes(key) || key.includes(name.substring(0, 20))) {
                return value;
            }
        }
        return 0;
    };

    const handleResetPrices = async () => {
        setStatus("جاري إعادة ضبط الأسعار...");
        let updated = 0;

        for (const product of products) {
            const originalPrice = getOriginalPrice(product.name_ar || product.name);
            if (originalPrice > 0) {
                const newPrice = Math.round(originalPrice * 1.15); // 15% margin
                await supabase
                    .from('products')
                    .update({
                        price: newPrice,
                        price_margin: 15
                    })
                    .eq('id', product.id);
                updated++;
            }
        }

        setStatus(`✅ تم إعادة ضبط ${updated} منتج بهامش ربح 15% صحيح!`);
        await loadProducts();
    };

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">إعادة ضبط الأسعار 🔄</h1>

            <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
                <p className="text-red-800 font-medium">⚠️ سيتم إرجاع الأسعار للأصل + 15% فقط</p>
            </div>

            <div className="mb-6 border rounded-lg p-4 max-h-80 overflow-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-right py-2">المنتج</th>
                            <th className="text-center py-2">السعر الحالي</th>
                            <th className="text-center py-2">السعر الأصلي</th>
                            <th className="text-center py-2">الجديد (+15%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => {
                            const orig = getOriginalPrice(p.name_ar || p.name);
                            const newPrice = Math.round(orig * 1.15);
                            return (
                                <tr key={p.id} className="border-b">
                                    <td className="py-2 text-xs">{(p.name_ar || p.name).substring(0, 30)}...</td>
                                    <td className="text-center text-red-500">{p.price} EGP</td>
                                    <td className="text-center text-gray-500">{orig} EGP</td>
                                    <td className="text-center text-green-600 font-medium">{newPrice} EGP</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Button onClick={handleResetPrices} size="lg" className="w-full bg-red-600 hover:bg-red-700">
                🔄 إعادة ضبط الأسعار (15% فقط)
            </Button>

            <p className="mt-4 p-3 bg-gray-100 rounded text-center">{status}</p>
        </div>
    );
}

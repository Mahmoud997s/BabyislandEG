"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Working toy images from Unsplash - these definitely work
const workingImages = [
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop", // Dollhouse
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop", // Building blocks
    "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&h=400&fit=crop", // Ride on car
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop", // Car toy
    "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop", // Scooter
    "https://images.unsplash.com/photo-1565728744382-61accd4aa148?w=400&h=400&fit=crop", // Kids outdoor
    "https://images.unsplash.com/photo-1532330393533-443990a51d10?w=400&h=400&fit=crop", // Bicycle
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", // Colorful scooter
];

export default function FixImagesPage() {
    const [status, setStatus] = useState("جاهز للتحديث");
    const [products, setProducts] = useState<any[]>([]);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('id, name_ar, images, source_url')
            .order('id', { ascending: true });
        setProducts(data || []);
    };

    const handleFixImages = async () => {
        setUpdating(true);
        setStatus("جاري تحديث الصور...");
        let updated = 0;

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const imageUrl = workingImages[i % workingImages.length];

            const { error } = await supabase
                .from('products')
                .update({ images: [imageUrl] })
                .eq('id', product.id);

            if (!error) updated++;
        }

        setStatus(`✅ تم تحديث ${updated} من ${products.length} منتج!`);
        setUpdating(false);
        await loadProducts();
    };

    return (
        <div className="p-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">إصلاح صور المنتجات 🖼️</h1>

            <div className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-200">
                <h3 className="font-bold text-amber-800">⚠️ ملاحظة</h3>
                <p className="text-amber-700 text-sm">
                    سيتم استخدام صور من Unsplash (صور ألعاب أطفال حقيقية).
                    يمكنك لاحقاً رفع صور المنتجات الأصلية من الداشبورد.
                </p>
            </div>

            <div className="mb-6">
                <h2 className="font-semibold mb-3">المنتجات ({products.length})</h2>
                <div className="grid grid-cols-4 gap-4">
                    {products.map((p, i) => {
                        const newImage = workingImages[i % workingImages.length];
                        return (
                            <div key={p.id} className="border rounded-lg p-2 text-center bg-white shadow-sm">
                                <div className="relative">
                                    <img
                                        src={newImage}
                                        alt={p.name_ar}
                                        className="w-full h-28 object-cover rounded mb-2"
                                    />
                                    <span className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-1 rounded">جديد</span>
                                </div>
                                <p className="text-xs truncate font-medium">{p.name_ar || p.name}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex gap-4">
                <Button onClick={handleFixImages} disabled={updating} size="lg" className="bg-green-600 hover:bg-green-700">
                    {updating ? "جاري التحديث..." : "✨ تحديث جميع الصور"}
                </Button>
                <Button variant="outline" onClick={loadProducts}>
                    🔄 تحديث القائمة
                </Button>
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded">
                <p className="font-mono text-sm">{status}</p>
            </div>
        </div>
    );
}

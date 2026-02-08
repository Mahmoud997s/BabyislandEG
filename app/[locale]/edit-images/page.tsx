"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function EditImagesPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('id, name_ar, name, images, source_url')
            .eq('source_platform', 'amazon')
            .order('id', { ascending: true });
        setProducts(data || []);
    };

    const handleSaveImage = async (productId: string, imageUrl: string) => {
        if (!imageUrl.trim()) return;
        setSaving(productId);

        await supabase
            .from('products')
            .update({ images: [imageUrl.trim()] })
            .eq('id', productId);

        setSaving(null);
        await loadProducts();
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">تعديل صور المنتجات 🖼️</h1>

            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm">
                <p><strong>الخطوات:</strong></p>
                <ol className="list-decimal mr-5 mt-2 space-y-1">
                    <li>افتح رابط المنتج على أمازون</li>
                    <li>اضغط كليك يمين على صورة المنتج → Copy image address</li>
                    <li>الصق الرابط هنا واضغط "حفظ"</li>
                </ol>
            </div>

            <div className="space-y-4">
                {products.map((p) => (
                    <div key={p.id} className="border rounded-lg p-4 bg-white flex gap-4 items-start">
                        <div className="w-20 h-20 flex-shrink-0">
                            <img
                                src={p.images?.[0] || '/placeholder.png'}
                                alt={p.name_ar}
                                className="w-full h-full object-contain rounded border"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Img';
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-sm mb-1">{p.name_ar || p.name}</p>
                            <a
                                href={p.source_url}
                                target="_blank"
                                className="text-xs text-blue-600 hover:underline block mb-2"
                            >
                                فتح في أمازون ↗
                            </a>
                            <div className="flex gap-2">
                                <Input
                                    id={`img-${p.id}`}
                                    placeholder="الصق رابط الصورة هنا..."
                                    defaultValue={p.images?.[0] || ''}
                                    className="text-xs h-8"
                                />
                                <Button
                                    size="sm"
                                    className="h-8"
                                    disabled={saving === p.id}
                                    onClick={() => {
                                        const input = document.getElementById(`img-${p.id}`) as HTMLInputElement;
                                        handleSaveImage(p.id, input.value);
                                    }}
                                >
                                    {saving === p.id ? '...' : 'حفظ'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

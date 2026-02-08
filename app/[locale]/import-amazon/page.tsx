"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

// Product data extracted from Amazon.eg
const productsData = [
    {
        name: "منزل الدمى الفاخر من Next Store - لعبة منزل الأحلام للأطفال مع شخصيات وإكسسوارات",
        name_ar: "منزل الدمى الفاخر من Next Store",
        description: "Luxury dollhouse for kids with characters and accessories - foldable design",
        description_ar: "لعبة منزل الأحلام للأطفال مع شخصيات وإكسسوارات - تصميم قابل للطي",
        price: 850, // Update with actual price
        category: "toys",
        brand: "Next Store",
        stock: 10,
        images: ["https://m.media-amazon.com/images/I/81QCDxQXz4L._AC_SL1500_.jpg"],
        source_url: "https://www.amazon.eg/dp/B0DZCZT6VT",
        source_platform: "amazon",
        sync_enabled: true,
    },
    {
        name: "مجموعة جاك سبراتس - مكعبات بناء بتصميم إبداعي",
        name_ar: "مجموعة جاك سبراتس للتركيب",
        description: "Building blocks set with creative design for kids",
        description_ar: "مجموعة مكعبات بناء بتصميم إبداعي للأطفال",
        price: 450, // Update with actual price
        category: "toys",
        brand: "Jack Sprats",
        stock: 15,
        images: ["https://m.media-amazon.com/images/I/71placeholder2.jpg"],
        source_url: "https://www.amazon.eg/dp/B09Z6SDY1K",
        source_platform: "amazon",
        sync_enabled: true,
    },
    {
        name: "سيارة ركوب بلازما للأطفال من دريم لاند - لون أخضر وأسود - موديل 5199-Y",
        name_ar: "سيارة بلازما دريم لاند أخضر",
        description: "Plasma ride-on car for kids from Dream Land - Green and Black - Model 5199-Y",
        description_ar: "سيارة ركوب بلازما للأطفال من دريم لاند، لون أخضر وأسود",
        price: 1200, // Update with actual price
        category: "toys",
        brand: "Dream Land",
        stock: 8,
        images: ["https://m.media-amazon.com/images/I/71aRKUYKr7L._AC_SL1500_.jpg"],
        source_url: "https://www.amazon.eg/dp/B0DPHXC9N4",
        source_platform: "amazon",
        sync_enabled: true,
    },
    {
        name: "بلازما للأطفال دريم ورمادي 5199-1",
        name_ar: "سيارة بلازما دريم لاند رمادي",
        description: "Gray plasma car for kids - Model 5199-1",
        description_ar: "سيارة بلازما رمادية للأطفال موديل 5199-1",
        price: 1150, // Update with actual price
        category: "toys",
        brand: "Dream Land",
        stock: 12,
        images: ["https://m.media-amazon.com/images/I/71placeholder4.jpg"],
        source_url: "https://www.amazon.eg/dp/B0DPN3ZKBJ",
        source_platform: "amazon",
        sync_enabled: true,
    },
    {
        name: "سكوتر للاطفال بـ 3 عجلات مع اضواء ليد - تزلج سريع قابل للتعديل للطي - أصفر",
        name_ar: "سكوتر أطفال 3 عجلات أصفر مع LED",
        description: "Kids scooter with 3 wheels and LED lights - fast adjustable foldable for outdoor - ages 4-12 - aluminum frame - Yellow",
        description_ar: "سكوتر للأطفال بـ 3 عجلات مع اضواء ليد تزلج سريع قابل للتعديل للطي للنزهات الخارجية - هيكل ألومنيوم",
        price: 750, // Update with actual price (EGP501-1000 range shown)
        category: "toys",
        brand: "Generic",
        stock: 20,
        images: ["https://m.media-amazon.com/images/I/71placeholder5.jpg"],
        source_url: "https://www.amazon.eg/dp/B0BQXJJ99Z",
        source_platform: "amazon",
        sync_enabled: true,
    },
    {
        name: "سكوتر قابل للطي بثلاث عجلات للأطفال مع عجلات مضيئة - ابو الجوخ - أسود",
        name_ar: "سكوتر ابو الجوخ أسود 3 عجلات",
        description: "Foldable 3-wheel scooter for kids with LED wheels - adjustable height - tilt steering - safe and durable - Black",
        description_ar: "سكوتر قابل للطي بثلاث عجلات للأطفال مع عجلات مضيئة وارتفاع قابل للتعديل - نظام توجيه بالإمالة آمن ومتين",
        price: 780, // Update with actual price (EGP501-1000 range shown)
        category: "toys",
        brand: "ابو الجوخ",
        stock: 15,
        images: ["https://m.media-amazon.com/images/I/71placeholder6.jpg"],
        source_url: "https://www.amazon.eg/dp/B0DRTPG4VN",
        source_platform: "amazon",
        sync_enabled: true,
    },
    {
        name: "دراجة اطفال ولادي وبناتي من فلاش 4 الوان ثلاث مقاسات - GTG TOYS",
        name_ar: "دراجة فلاش للأطفال - GTG TOYS",
        description: "Kids bicycle for boys and girls from Flash - 4 colors - 3 sizes - GTG TOYS Official Distributor",
        description_ar: "دراجة اطفال ولادي وبناتي من فلاش 4 الوان ثلاث مقاسات - الوكيل الرسمي في مصر",
        price: 1800, // Update with actual price
        category: "toys",
        brand: "GTG TOYS",
        stock: 10,
        images: ["https://m.media-amazon.com/images/I/71placeholder7.jpg"],
        source_url: "https://www.amazon.eg/dp/B0FJRWHSSD",
        source_platform: "amazon",
        sync_enabled: true,
    },
    {
        name: "سكوتر كاندي بعجلات من البولي يوريثان من بينجو - أرجواني وأخضر مينت",
        name_ar: "سكوتر بينجو كاندي أرجواني/أخضر",
        description: "Bingo Candy Scooter with polyurethane wheels - Purple and Mint Green",
        description_ar: "سكوتر كاندي بعجلات من البولي يوريثان من بينجو بلون أرجواني وأخضر مينت",
        price: 2250, // Update with actual price (EGP2001-2500 range shown)
        category: "toys",
        brand: "Bingo",
        stock: 8,
        images: ["https://m.media-amazon.com/images/I/71placeholder8.jpg"],
        source_url: "https://www.amazon.eg/dp/B0FHPZBXM6",
        source_platform: "amazon",
        sync_enabled: true,
    },
];

export default function ImportAmazonPage() {
    const [status, setStatus] = useState("Ready to import 8 products from Amazon.eg");
    const [results, setResults] = useState<string[]>([]);
    const [importing, setImporting] = useState(false);

    const handleImport = async () => {
        setImporting(true);
        setStatus("Importing...");
        setResults([]);
        const newResults: string[] = [];

        for (const product of productsData) {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .insert([{
                        name: product.name,
                        name_ar: product.name_ar,
                        description: product.description,
                        description_ar: product.description_ar,
                        price: product.price,
                        category: product.category,
                        brand: product.brand,
                        stock: product.stock,
                        images: product.images,
                        source_url: product.source_url,
                        source_platform: product.source_platform,
                        sync_enabled: product.sync_enabled,
                        isNew: true,
                        isBestSeller: false,
                        price_margin: 20,
                        auto_update_price: true,
                        auto_update_stock: true,
                    }])
                    .select()
                    .single();

                if (error) throw error;
                newResults.push(`✅ ${product.name_ar} - Added (ID: ${data.id})`);
            } catch (e: any) {
                newResults.push(`❌ ${product.name_ar} - Error: ${e.message}`);
            }
        }

        setResults(newResults);
        setStatus(`Import completed! ${newResults.filter(r => r.startsWith('✅')).length} of ${productsData.length} succeeded.`);
        setImporting(false);
    };

    return (
        <div className="p-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">استيراد منتجات أمازون 🛒</h1>

            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <h3 className="font-bold text-blue-800">ℹ️ معلومات</h3>
                <p className="text-blue-700 text-sm">
                    تم استخراج أسماء المنتجات الحقيقية من Amazon.eg.
                    الأسعار تقريبية ويمكن تعديلها من الداشبورد بعد الاستيراد.
                </p>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">المنتجات ({productsData.length})</h2>
                <div className="space-y-2 max-h-80 overflow-auto border rounded-lg p-4 bg-white">
                    {productsData.map((p, i) => (
                        <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                            <div>
                                <p className="font-medium text-sm">{p.name_ar}</p>
                                <p className="text-xs text-gray-500">{p.brand}</p>
                            </div>
                            <span className="font-bold text-green-600">{p.price} EGP</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <Button size="lg" onClick={handleImport} disabled={importing}>
                    {importing ? "جاري الاستيراد..." : "استيراد جميع المنتجات"}
                </Button>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-mono text-sm">الحالة: {status}</p>
                {results.length > 0 && (
                    <div className="mt-4 space-y-1 text-sm max-h-60 overflow-auto">
                        {results.map((r, i) => (
                            <p key={i} className={r.startsWith('✅') ? 'text-green-700' : 'text-red-600'}>{r}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

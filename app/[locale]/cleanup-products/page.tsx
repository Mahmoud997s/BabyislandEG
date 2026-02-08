"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function CleanupProductsPage() {
    const [status, setStatus] = useState("جاهز");
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);

        // Get total count
        const { count: total } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        // Get Amazon products stats
        const { data: amazonData, count: amazonCount } = await supabase
            .from('products')
            .select('id', { count: 'exact' })
            .eq('source_platform', 'amazon')
            .order('id', { ascending: true });

        // Get products considered 'Legacy' (NULL or 'manual')
        const { data: noSourceData, count: noSourceCount } = await supabase
            .from('products')
            .select('id', { count: 'exact' })
            .or('source_platform.is.null,source_platform.eq.manual')
            .order('id', { ascending: true });

        // Calculate stats
        const amazonMin = amazonData?.[0]?.id || 0;
        const amazonMax = amazonData?.[amazonData.length - 1]?.id || 0;

        const noSourceMin = noSourceData?.[0]?.id || 0;
        const noSourceMax = noSourceData?.[noSourceData.length - 1]?.id || 0;

        setStats({
            total: total || 0,
            amazon: { count: amazonCount, range: `${amazonMin} - ${amazonMax}` },
            noSource: { count: noSourceCount, range: `${noSourceMin} - ${noSourceMax}` },
            legacyEstimate: 634
        });
        setLoading(false);
    };

    const deleteExtraLegacy = async () => {
        const keepCount = 634;

        setStatus("جاري الحذف عبر الخادم (Admin)...");

        try {
            const response = await fetch('/api/admin/cleanup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_extra_legacy', keepCount })
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMsg = result.error || response.statusText;
                if (errorMsg.includes('SUPABASE_SERVICE_ROLE_KEY')) {
                    setStatus("⚠️ مفتاح Admin غير موجود. يرجى تشغيل الأمر التالي في Supabase SQL Editor:");
                    setSqlFallback(`DELETE FROM products WHERE source_platform IS NULL OR source_platform = 'manual' AND id > 634;`);
                } else {
                    setStatus("❌ خطأ: " + errorMsg);
                }
            } else {
                setStatus(`✅ ${result.message} (${result.count || 0} deleted)`);
                await loadStats();
            }
        } catch (e: any) {
            setStatus("❌ Connection Error: " + e.message);
        }
    };

    const deleteNewSeedToys = async () => {
        const threshold = prompt("Enter the ID threshold (delete items with ID > this):", "1000");
        if (!threshold) return;
        setSqlFallback(null); // Clear SQL fallback

        setStatus("Deleting on server...");

        try {
            const response = await fetch('/api/admin/cleanup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete_new_seed',
                    threshold: parseInt(threshold)
                })
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMsg = result.error || response.statusText;
                if (errorMsg.includes('Configuration Error')) {
                    setStatus("⚠️ مفتاح Admin غير موجود. يرجى تشغيل الأمر التالي في Supabase SQL Editor:");
                    setSqlFallback(`DELETE FROM products WHERE source_platform IS NULL AND id > ${threshold};`);
                } else {
                    setStatus("❌ Error: " + errorMsg);
                }
            } else {
                setStatus(`✅ Cleaned new seed toys! (${result.count || 0} deleted)`);
                await loadStats();
            }
        } catch (e: any) {
            setStatus("❌ Connection Error: " + e.message);
        }
    };

    // Fallback for Amazon deletion (if needed)
    const deleteAmazon = async () => {
        if (!confirm("هل أنت متأكد من حذف منتجات أمازون؟")) return;
        setSqlFallback(null); // Clear SQL fallback
        const { error } = await supabase.from('products').delete().eq('source_platform', 'amazon');
        if (error) setStatus("Error: " + error.message);
        else {
            setStatus("deleted amazon");
            loadStats();
        }
    };

    const [sqlFallback, setSqlFallback] = useState<string | null>(null);

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">تنظيف المنتجات (Admin API) 🧹</h1>

            {loading ? (
                <p>جاري التحميل...</p>
            ) : (
                <>
                    {sqlFallback && (
                        <div className="bg-amber-50 border border-amber-500 rounded p-4 mb-6">
                            <h3 className="font-bold text-amber-800 mb-2">⚠️ إجراء يدوي مطلوب</h3>
                            <p className="text-sm mb-2">لم نتمكن من الحذف التلقائي (نقص الصلاحيات). انسخ هذا الأمر وشغله في Supabase SQL Editor:</p>
                            <code className="block bg-black text-white p-3 rounded text-sm overflow-x-auto select-all">
                                {sqlFallback}
                            </code>
                        </div>
                    )}

                    <div className="bg-gray-50 p-6 rounded-lg mb-6 border">
                        <h2 className="font-bold mb-4">إحصائيات المنتجات</h2>
                        <div className="space-y-2 font-mono text-sm">
                            <p>📦 <strong>Total:</strong> {stats.total}</p>
                            <p>🟢 <strong>Amazon (Keep):</strong> {stats.amazon?.count}</p>
                            <p>🔵 <strong>Baby Island + Seed (No Source):</strong> {stats.noSource?.count}</p>
                            <p className="text-blue-600 border-t pt-2 mt-2">
                                🎯 <strong>Target:</strong> Keep first 634 No Source + All Amazon
                            </p>
                            <p className="text-red-500">
                                🗑️ <strong>To Delete:</strong> {Math.max(0, (stats.noSource?.count || 0) - 634)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="border p-4 rounded-lg bg-red-50 border-red-200">
                            <h3 className="font-bold text-red-800 mb-2">إصلاح تلقائي (Keep First 634)</h3>
                            <p className="text-sm text-red-700 mb-3">
                                هذا الزر يستخدم <strong>Admin API</strong> لحل مشكلة الصلاحيات.
                                <br />سيقوم بحذف أي منتج (بدون مصدر) ترتيبه بعد 634.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={deleteExtraLegacy}
                                disabled={(stats.noSource?.count || 0) <= 634}
                            >
                                ♻️ حذف الزيادة وإبقاء 634 منتج فقط
                            </Button>
                        </div>

                        <div className="border p-4 rounded-lg bg-red-50 border-red-200">
                            <h3 className="font-bold text-red-800 mb-2">حذف المنتجات الجديدة (Seed Toys)</h3>
                            <p className="text-sm text-red-700 mb-3">
                                أدخل رقم ID (الحد الفاصل). سيتم حذف كل المنتجات التي <strong>ليس لها مصدر</strong> و <strong>رقمها أكبر من الحد الفاصل</strong>.
                                <br />مثال: لو آخر منتج قديم رقمه 634، أدخل 634.
                            </p>
                            <Button
                                variant="destructive"
                                onClick={deleteNewSeedToys}
                            >
                                🗑️ حذف المنتجات الزائدة (فوق ID معين)
                            </Button>
                        </div>

                        <div className="border p-4 rounded-lg">
                            <h3 className="font-medium mb-2 opacity-70">خيارات أخرى</h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={deleteAmazon}
                                    size="sm"
                                >
                                    حذف Amazon
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button variant="outline" onClick={loadStats}>
                            🔄 تحديث الإحصائيات
                        </Button>
                    </div>

                    <p className="mt-4 p-3 bg-gray-100 rounded text-center">{status}</p>
                </>
            )}
        </div>
    );
}

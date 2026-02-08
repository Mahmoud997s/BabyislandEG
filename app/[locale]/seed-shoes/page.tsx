"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const shoes = [
    {
        name: "Puma Multiflex Sl V Inf",
        name_ar: "حذاء بوما مالتي فليكس للأطفال",
        description: "Kids sport shoes, comfortable and durable.",
        description_ar: "حذاء رياضي للأطفال، مريح ومتين.",
        price: 1850,
        category: "shoes",
        brand: "Puma",
        stock: 10,
        images: ["https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Puma Anzarun Lite AC",
        name_ar: "حذاء بوما أنزارون لايت",
        description: "Lightweight running shoes for active kids.",
        description_ar: "حذاء جري خفيف الوزن للأطفال النشيطين.",
        price: 2100,
        category: "shoes",
        brand: "Puma",
        stock: 8,
        images: ["https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?q=80&w=2069&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Puma Rickie Low Neck",
        name_ar: "حذاء بوما ريكي رقبة منخفضة",
        description: "Classic low neck sneaker style.",
        description_ar: "حذاء سنيكرز كلاسيكي برقبة منخفضة.",
        price: 1950,
        category: "shoes",
        brand: "Puma",
        stock: 15,
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Puma Graviton Sportstyle",
        name_ar: "حذاء بوما جرافيتون سبورت ستايل",
        description: "Modern sportstyle sneaker inspired by running.",
        description_ar: "حذاء رياضي عصري مستوحى من الجري.",
        price: 2300,
        category: "shoes",
        brand: "Puma",
        stock: 5,
        images: ["https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Puma Smash v2",
        name_ar: "حذاء بوما سماش الإصدار 2",
        description: "Tennis inspired everyday sneaker.",
        description_ar: "حذاء يومي مستوحى من التنس.",
        price: 1750,
        category: "shoes",
        brand: "Puma",
        stock: 12,
        images: ["https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=2012&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Puma Caven 2.0",
        name_ar: "حذاء بوما كافين 2.0",
        description: "Basketball inspired silhouette.",
        description_ar: "تصميم مستوحى من كرة السلة.",
        price: 2500,
        category: "shoes",
        brand: "Puma",
        stock: 7,
        images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1974&auto=format&fit=crop"],
        isNew: true
    }
];

export default function SeedShoesPage() {
    const [status, setStatus] = useState("Idle");

    const handleImport = async () => {
        setStatus("Importing...");
        try {
            for (const product of shoes) {
                const { error } = await supabase.from('products').insert([product]);
                if (error) {
                    console.error("Error inserting", product.name, error);
                    setStatus("Error: " + error.message);
                    return;
                }
            }
            setStatus("Success! 6 Products Imported.");
        } catch (e: any) {
            setStatus("Exception: " + e.message);
        }
    };

    return (
        <div className="p-20 text-center">
            <h1 className="text-2xl mb-4">Import Shoes Data</h1>
            <p className="mb-4">Status: {status}</p>
            <Button onClick={handleImport}>Start Import</Button>
        </div>
    );
}

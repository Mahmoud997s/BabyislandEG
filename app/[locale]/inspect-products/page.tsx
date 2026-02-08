"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function InspectProductsPage() {
    const [stats, setStats] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Fetch a sample of products to see what distinguishes them
        const { data } = await supabase
            .from('products')
            .select('id, name, source_platform, created_at, category')
            .order('created_at', { ascending: false })
            .limit(100);

        setStats(data || []);
    };

    return (
        <div className="p-10 font-mono text-xs">
            <h1>Product Inspection</h1>
            <table className="w-full border">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Platform</th>
                        <th>Created At</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>{p.source_platform || 'NULL'}</td>
                            <td>{new Date(p.created_at).toLocaleString()}</td>
                            <td>{p.category}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

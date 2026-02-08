"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DebugSourcesPage() {
    const [counts, setCounts] = useState<any[]>([]);

    useEffect(() => {
        checkSources();
    }, []);

    const checkSources = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('source_platform, count');
        // Note: simple group by isn't direct in client client without rpc usually, 
        // but let's just fetch all source_platforms and count js side for quickness 
        // or use specific queries.

        // Let's just do 3 queries
        const { count: nullCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).is('source_platform', null);
        const { count: manualCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('source_platform', 'manual');
        const { count: amazonCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('source_platform', 'amazon');
        const { count: otherCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
            .neq('source_platform', 'amazon')
            .neq('source_platform', 'manual')
            .not('source_platform', 'is', null);

        setCounts([
            { source: 'NULL', count: nullCount },
            { source: 'manual', count: manualCount },
            { source: 'amazon', count: amazonCount },
            { source: 'other', count: otherCount },
        ]);
    };

    return (
        <div className="p-10">
            <h1>Source Platform Distribution</h1>
            <pre>{JSON.stringify(counts, null, 2)}</pre>
        </div>
    );
}

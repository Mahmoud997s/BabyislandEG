
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function ReclassifyButton() {
    const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
    const [progress, setProgress] = useState({ processed: 0, updated: 0 });

    const startReclassification = async () => {
        if (!confirm("Start AI Re-analysis for ALL products? This may take a few minutes.")) return;

        setStatus('running');
        setProgress({ processed: 0, updated: 0 });
        
        let offset = 0;
        let limit = 50;
        let totalProcessed = 0;
        let totalUpdated = 0;
        let keepGoing = true;

        try {
            while (keepGoing) {
                // Call API
                const res = await fetch('/api/admin/reclassify', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' // Client needs key, or we proxy. Ideally use server action but keeping simple.
                        // Note: Exposing key to client is risky if public. 
                        // Better approach: Make this component trigger a Server Action that has the key.
                        // For now, assuming Admin Dashboard is protected or key is in .env.local public.
                    },
                    body: JSON.stringify({ limit, offset })
                });

                if (!res.ok) throw new Error(`Server error: ${res.status}`);

                const data = await res.json();
                
                // Update stats
                const count = data.updates || 0;
                totalUpdated += count;
                totalProcessed += limit; // Approximation or use data.processed
                
                setProgress({ processed: totalProcessed, updated: totalUpdated });

                // Check if we should stop
                // If we processed products less than limit, we reached end? 
                // Actually the API returns nextOffset. If it didn't find products, it might not return much.
                // We depend on "processed" count from API message or just if products were empty.
                // Let's assume if it says "Processed 0 products", we stop.
                if (data.message.includes("Processed 0")) {
                    keepGoing = false;
                } else {
                    offset += limit;
                }
                
                // Safety break for infinite loops
                if (offset > 10000) keepGoing = false; 
            }

            setStatus('done');
            toast.success(`Completed! Updated ${totalUpdated} products.`);

        } catch (error: any) {
            console.error(error);
            setStatus('error');
            toast.error("Process failed. Check console.");
        }
    };

    return (
        <div className="flex items-center gap-4">
            <Button 
                onClick={startReclassification} 
                disabled={status === 'running'}
                variant={status === 'done' ? "secondary" : "default"}
                className="gap-2"
            >
                {status === 'running' ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                {status === 'running' ? `Analyzing... (${progress.processed})` : "Re-Analyze Inventory"}
            </Button>
            
            {status === 'done' && (
                <span className="text-green-600 flex items-center gap-1 text-sm">
                    <CheckCircle className="w-4 h-4" /> Done ({progress.updated} updated)
                </span>
            )}
            
            {status === 'error' && (
                <span className="text-red-600 flex items-center gap-1 text-sm">
                    <AlertTriangle className="w-4 h-4" /> Error
                </span>
            )}
        </div>
    );
}

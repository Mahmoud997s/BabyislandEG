import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface StoreSettings {
    store_name: string;
    store_email: string;
    store_phone: string;
    currency: string;
    facebook_url: string;
    instagram_url: string;
    shipping_cairo: number;
    shipping_alex: number;
}

export function useSettings() {
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const { data, error } = await supabase
                    .from('store_settings')
                    .select('*')
                    .eq('id', 1)
                    .single();

                if (error) {
                    console.error("Error fetching settings:", error);
                } else if (data) {
                    setSettings(data);
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            } finally {
                setLoading(false);
            }
        }

        fetchSettings();
    }, []);

    return { settings, loading };
}

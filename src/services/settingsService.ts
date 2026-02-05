import { supabase } from "@/lib/supabase";

export interface StoreSettings {
    id: number;
    store_name: string;
    contact_email: string;
    phone?: string;
    logo_url?: string;
    favicon_url?: string;
    currency: string;

    // Social Media
    facebook_url?: string;
    instagram_url?: string;
    twitter_url?: string;
    whatsapp_number?: string;

    // Shipping
    shipping_zones: ShippingZone[];
    free_shipping_threshold: number;

    // Tax
    tax_enabled: boolean;
    tax_rate: number;
    tax_label: string;

    // Policies
    return_policy?: string;
    privacy_policy?: string;
    terms_and_conditions?: string;

    // Email
    admin_notification_email?: string;

    // Store Hours
    store_hours?: Record<string, DayHours>;
}

export interface ShippingZone {
    name: string;
    rate: number;
    cities: string[];
}

export interface DayHours {
    open: string;
    close: string;
    closed: boolean;
}

export const settingsService = {
    async getSettings(): Promise<StoreSettings | null> {
        const { data, error } = await supabase
            .from('store_settings')
            .select('*')
            .single();

        if (error) {
            console.error("Error fetching settings:", error);
            return null;
        }

        return data as StoreSettings;
    },

    async updateSettings(settings: Partial<StoreSettings>): Promise<boolean> {
        // Get first record ID
        const { data: existing } = await supabase
            .from('store_settings')
            .select('id')
            .single();

        if (!existing) return false;

        const { error } = await supabase
            .from('store_settings')
            .update({ ...settings, updated_at: new Date().toISOString() })
            .eq('id', existing.id);

        if (error) {
            console.error("Error updating settings:", error);
            return false;
        }

        return true;
    },

    async uploadLogo(file: File): Promise<string | null> {
        const fileName = `logo-${Date.now()}.${file.name.split('.').pop()}`;

        const { data, error } = await supabase.storage
            .from('store-assets')
            .upload(fileName, file, { upsert: true });

        if (error) {
            console.error("Error uploading logo:", error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('store-assets')
            .getPublicUrl(data.path);

        return publicUrl;
    },

    async uploadFavicon(file: File): Promise<string | null> {
        const fileName = `favicon-${Date.now()}.${file.name.split('.').pop()}`;

        const { data, error } = await supabase.storage
            .from('store-assets')
            .upload(fileName, file, { upsert: true });

        if (error) {
            console.error("Error uploading favicon:", error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('store-assets')
            .getPublicUrl(data.path);

        return publicUrl;
    }
};

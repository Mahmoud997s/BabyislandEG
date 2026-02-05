import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { settingsService, StoreSettings } from "@/services/settingsService";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await settingsService.getSettings();
        if (data) setSettings(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);

        // Upload logo if selected
        if (logoFile) {
            const logoUrl = await settingsService.uploadLogo(logoFile);
            if (logoUrl) settings.logo_url = logoUrl;
        }

        // Upload favicon if selected
        if (faviconFile) {
            const faviconUrl = await settingsService.uploadFavicon(faviconFile);
            if (faviconUrl) settings.favicon_url = faviconUrl;
        }

        const success = await settingsService.updateSettings(settings);
        setSaving(false);

        if (success) {
            toast.success("Settings saved successfully ✅");
            setLogoFile(null);
            setFaviconFile(null);
            loadSettings();
        } else {
            toast.error("Failed to save settings");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!settings) return <div>Error loading settings</div>;

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Store Settings
                        </h1>
                        <p className="text-slate-500 mt-1">Customize and manage all store aspects</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </Button>
                </motion.div>

                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 bg-white border shadow-sm h-12">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="shipping">Shipping</TabsTrigger>
                        <TabsTrigger value="tax">Tax</TabsTrigger>
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="policies">Policies</TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle>Store Information</CardTitle>
                                <CardDescription>Name, logo, and contact info</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Store Name</Label>
                                        <Input
                                            value={settings.store_name}
                                            onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Currency</Label>
                                        <Input
                                            value={settings.currency}
                                            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Contact Email</Label>
                                        <Input
                                            type="email"
                                            value={settings.contact_email}
                                            onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input
                                            value={settings.phone || ""}
                                            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <Label>Store Logo</Label>
                                    <div className="flex items-center gap-4">
                                        {settings.logo_url && (
                                            <img src={settings.logo_url} alt="Store Logo" className="h-16 w-auto" />
                                        )}
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                        />
                                        {logoFile && (
                                            <Button variant="ghost" size="icon" onClick={() => setLogoFile(null)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Social Media */}
                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-4">Social Media Links</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Facebook</Label>
                                            <Input
                                                placeholder="https://facebook.com/..."
                                                value={settings.facebook_url || ""}
                                                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Instagram</Label>
                                            <Input
                                                placeholder="https://instagram.com/..."
                                                value={settings.instagram_url || ""}
                                                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>WhatsApp</Label>
                                            <Input
                                                placeholder="+20 1234567890"
                                                value={settings.whatsapp_number || ""}
                                                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Shipping Tab */}
                    <TabsContent value="shipping" className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle>Shipping Zones & Rates</CardTitle>
                                <CardDescription>Manage shipping costs by zone</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Free Shipping Threshold (EGP)</Label>
                                    <Input
                                        type="number"
                                        value={settings.free_shipping_threshold}
                                        onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label>Shipping Zones</Label>
                                    {settings.shipping_zones.map((zone, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium">{zone.name}</p>
                                                <p className="text-sm text-slate-500">{zone.cities.join(", ") || "All Cities"}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    className="w-24"
                                                    value={zone.rate}
                                                    onChange={(e) => {
                                                        const zones = [...settings.shipping_zones];
                                                        zones[index].rate = Number(e.target.value);
                                                        setSettings({ ...settings, shipping_zones: zones });
                                                    }}
                                                />
                                                <span className="text-sm">EGP</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tax Tab */}
                    <TabsContent value="tax" className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle>Tax Settings</CardTitle>
                                <CardDescription>Enable or disable VAT</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Enable Tax</p>
                                        <p className="text-sm text-slate-500">Apply tax to all orders</p>
                                    </div>
                                    <Switch
                                        checked={settings.tax_enabled}
                                        onCheckedChange={(checked) => setSettings({ ...settings, tax_enabled: checked })}
                                    />
                                </div>

                                {settings.tax_enabled && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Tax Rate (%)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={settings.tax_rate}
                                                    onChange={(e) => setSettings({ ...settings, tax_rate: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Tax Label</Label>
                                                <Input
                                                    value={settings.tax_label}
                                                    onChange={(e) => setSettings({ ...settings, tax_label: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Email Tab */}
                    <TabsContent value="email" className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle>Email Settings</CardTitle>
                                <CardDescription>Notification settings</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label>Admin Notification Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="notifications@strollerchic.com"
                                        value={settings.admin_notification_email || ""}
                                        onChange={(e) => setSettings({ ...settings, admin_notification_email: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-500">New order notifications will be sent to this email</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Policies Tab */}
                    <TabsContent value="policies" className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle>Policies & Terms</CardTitle>
                                <CardDescription>Return policy, privacy policy, and terms</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-2">
                                    <Label>Return & Refund Policy</Label>
                                    <Textarea
                                        rows={5}
                                        placeholder="Enter return policy..."
                                        value={settings.return_policy || ""}
                                        onChange={(e) => setSettings({ ...settings, return_policy: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Privacy Policy</Label>
                                    <Textarea
                                        rows={5}
                                        placeholder="Enter privacy policy..."
                                        value={settings.privacy_policy || ""}
                                        onChange={(e) => setSettings({ ...settings, privacy_policy: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Terms & Conditions</Label>
                                    <Textarea
                                        rows={5}
                                        placeholder="Enter terms & conditions..."
                                        value={settings.terms_and_conditions || ""}
                                        onChange={(e) => setSettings({ ...settings, terms_and_conditions: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

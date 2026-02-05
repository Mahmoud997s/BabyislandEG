import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

export function Newsletter() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !email.includes("@")) {
            toast.error("الرجاء إدخال بريد إلكتروني صحيح");
            return;
        }

        setLoading(true);

        // Save to database (you'll need to create a newsletter_subscribers table)
        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert([{ email: email.trim(), subscribed_at: new Date().toISOString() }]);

        setLoading(false);

        if (error) {
            if (error.code === '23505') { // Duplicate email
                toast.info("أنت مشترك بالفعل في النشرة البريدية");
            } else {
                toast.error("فشل في الاشتراك، حاول مرة أخرى");
            }
        } else {
            toast.success("تم الاشتراك بنجاح! 🎉");
            setEmail("");
        }
    };

    return (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-0 shadow-lg" dir="rtl">
            <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">اشترك في نشرتنا البريدية</h3>
                <p className="text-slate-600 mb-6">احصل على أحدث العروض والمنتجات</p>

                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                    <Input
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={loading} className="gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "اشترك"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

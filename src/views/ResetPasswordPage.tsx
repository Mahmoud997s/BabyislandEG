"use client";

import { useState } from "react";
import { useLocaleNavigate } from "@/hooks/useLocaleNavigate";
import { motion } from "framer-motion";
import { Lock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const navigate = useLocaleNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("كلمات المرور غير متطابقة");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            toast.success("تم تغيير كلمة المرور بنجاح!");

            // Wait a bit then redirect to login
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error: any) {
            console.error("Password reset error:", error);
            toast.error("فشل تغيير كلمة المرور. حاول مرة أخرى.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <section className="py-12 lg:py-20 min-h-[80vh] flex items-center justify-center bg-gray-50/50">
                <div className="container-main max-w-md w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <div className="text-center mb-8">
                            <motion.div
                                className="flex justify-center mb-6"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#0EA5E9]/20 blur-xl rounded-full animate-pulse"></div>
                                    <img
                                        src="/babyisland_logo_exact.png"
                                        alt="Babyisland"
                                        className="w-24 h-24 rounded-full object-cover relative shadow-lg border-4 border-white"
                                    />
                                </div>
                            </motion.div>
                            <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-foreground font-fredoka">
                                إعادة تعيين كلمة المرور
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                أدخل كلمة المرور الجديدة
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-base font-medium">
                                        كلمة المرور الجديدة
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0EA5E9]" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pr-12 h-14 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all text-lg"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-base font-medium">
                                        تأكيد كلمة المرور
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0EA5E9]" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pr-12 h-14 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all text-lg"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:shadow-lg hover:shadow-[#0EA5E9]/25 transition-all duration-300"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "جاري التحديث..." : "تحديث كلمة المرور"}
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}

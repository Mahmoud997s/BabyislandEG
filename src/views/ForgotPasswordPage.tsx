"use client";

import { useState } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error(t("auth.validation.emailRequired"));
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setEmailSent(true);
            toast.success("تم إرسال رابط إعادة تعيين كلمة المرور!");
        } catch (error: any) {
            console.error("Password reset error:", error);
            toast.error("فشل إرسال البريد. تأكد من البريد الإلكتروني.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (emailSent) {
        return (
            <Layout>
                <section className="py-12 lg:py-20 min-h-[80vh] flex items-center justify-center bg-gray-50/50">
                    <div className="container-main max-w-md w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold mb-3">تم إرسال الرابط!</h1>
                            <p className="text-muted-foreground mb-6">
                                تحقق من بريدك الإلكتروني <strong>{email}</strong> واتبع التعليمات لإعادة تعيين كلمة المرور.
                            </p>
                            <LocaleLink href="/login">
                                <Button variant="outline" className="w-full">
                                    العودة لتسجيل الدخول
                                </Button>
                            </LocaleLink>
                        </motion.div>
                    </div>
                </section>
            </Layout>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <Layout>
            <section className="py-12 lg:py-20 min-h-[80vh] flex items-center justify-center bg-gray-50/50">
                <div className="container-main max-w-md w-full">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
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
                            <motion.h1 variants={itemVariants} className="text-3xl lg:text-4xl font-bold mb-3 text-foreground font-fredoka">
                                نسيت كلمة المرور؟
                            </motion.h1>
                            <motion.p variants={itemVariants} className="text-muted-foreground text-lg">
                                أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
                            </motion.p>
                        </div>

                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="email" className="text-base font-medium">
                                        البريد الإلكتروني
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0EA5E9]" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="example@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pr-12 h-14 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all text-lg"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:shadow-lg hover:shadow-[#0EA5E9]/25 transition-all duration-300"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
                                        <ArrowRight className="w-5 h-5 mr-2" />
                                    </Button>
                                </motion.div>
                            </form>

                            <motion.div variants={itemVariants} className="mt-6 text-center text-base">
                                <span className="text-gray-500">تذكرت كلمة المرور؟ </span>
                                <LocaleLink href="/login" className="text-[#0EA5E9] font-bold hover:text-[#F97316] transition-colors">
                                    تسجيل الدخول
                                </LocaleLink>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}

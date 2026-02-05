import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Lock, Eye, EyeOff, XCircle, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuthStore();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState("");

    // Redirect if already authenticated
    if (isAuthenticated) {
        navigate("/account");
        return null;
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t("auth.validation.nameRequired");
        }
        if (!formData.email.trim()) {
            newErrors.email = t("auth.validation.emailRequired");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = t("auth.validation.emailInvalid");
        }
        if (!formData.phone.trim()) {
            newErrors.phone = t("auth.validation.phoneRequired");
        } else if (!/^01[0125][0-9]{8}$/.test(formData.phone.trim())) {
            newErrors.phone = t("auth.validation.phoneInvalid");
        }
        if (!formData.password.trim()) {
            newErrors.password = t("auth.validation.passwordRequired");
        } else if (formData.password.length < 6) {
            newErrors.password = t("auth.validation.passwordMin");
        }
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = t("auth.validation.confirmRequired");
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t("auth.validation.passwordMismatch");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError("");

        if (!validateForm()) return;

        setIsSubmitting(true);

        const result = await register({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            password: formData.password,
        });

        if (result.success) {
            navigate("/account");
        } else {
            if (result.error === "EMAIL_EXISTS") {
                setGeneralError(t("auth.validation.emailExists"));
            } else {
                setGeneralError(t("auth.validation.registerFailed"));
            }
        }

        setIsSubmitting(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
        setGeneralError("");
    };

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
                        {/* Header */}
                        <div className="text-center mb-10">
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
                                {t("auth.register.title")}
                            </motion.h1>
                            <motion.p variants={itemVariants} className="text-muted-foreground text-lg text-pretty">
                                {t("auth.register.subtitle")}
                            </motion.p>
                        </div>

                        {/* Form Card */}
                        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                            <AnimatePresence>
                                {generalError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium mb-6"
                                    >
                                        <XCircle className="w-5 h-5 shrink-0" />
                                        {generalError}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="name" className="text-base font-medium">{t("auth.name")} *</Label>
                                    <div className="relative group">
                                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0EA5E9] transition-colors" />
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder={t("auth.namePlaceholder")}
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`pr-12 h-14 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all text-lg ${errors.name ? "border-destructive bg-destructive/5" : ""}`}
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-sm text-destructive mt-1 font-medium">{errors.name}</p>
                                    )}
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="email" className="text-base font-medium">{t("auth.email")} *</Label>
                                    <div className="relative group">
                                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0EA5E9] transition-colors" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder={t("auth.emailPlaceholder")}
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`pr-12 h-14 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all text-lg ${errors.email ? "border-destructive bg-destructive/5" : ""}`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-destructive mt-1 font-medium">{errors.email}</p>
                                    )}
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="phone" className="text-base font-medium">{t("auth.phone")} *</Label>
                                    <div className="relative group">
                                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0EA5E9] transition-colors" />
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="01xxxxxxxxx"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className={`pr-12 h-14 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all text-lg ${errors.phone ? "border-destructive bg-destructive/5" : ""}`}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-sm text-destructive mt-1 font-medium">{errors.phone}</p>
                                    )}
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="password" className="text-base font-medium">{t("auth.password")} *</Label>
                                    <div className="relative group">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0EA5E9] transition-colors" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`pr-12 pl-10 h-14 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all text-lg ${errors.password ? "border-destructive bg-destructive/5" : ""}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-destructive mt-1 font-medium">{errors.password}</p>
                                    )}
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-base font-medium">{t("auth.confirmPassword")} *</Label>
                                    <div className="relative group">
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0EA5E9] transition-colors" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={`pr-12 pl-10 h-14 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all text-lg ${errors.confirmPassword ? "border-destructive bg-destructive/5" : ""}`}
                                        />
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-destructive mt-1 font-medium">{errors.confirmPassword}</p>
                                    )}
                                </motion.div>

                                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:shadow-lg hover:shadow-[#0EA5E9]/25 transition-all duration-300 pointer-events-auto"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {t("auth.register.processing")}
                                            </div>
                                        ) : (
                                            t("auth.register.submit")
                                        )}
                                    </Button>
                                </motion.div>
                            </form>

                            {/* Login Link */}
                            <motion.div variants={itemVariants} className="mt-8 text-center text-base">
                                <span className="text-gray-500">{t("auth.register.hasAccount")} </span>
                                <Link to="/login" className="text-[#0EA5E9] font-bold hover:text-[#F97316] transition-colors">
                                    {t("auth.register.loginLink")}
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}

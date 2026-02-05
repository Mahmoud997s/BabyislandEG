import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, XCircle, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuthStore();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState("");

    // Redirect if already authenticated
    if (isAuthenticated && user) {
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
            sessionStorage.removeItem("redirectAfterLogin");
            navigate(redirectPath);
        } else {
            navigate(user.role === "admin" ? "/admin" : "/account");
        }
        return null;
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = t("auth.validation.emailRequired");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = t("auth.validation.emailInvalid");
        }
        if (!formData.password.trim()) {
            newErrors.password = t("auth.validation.passwordRequired");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError("");

        if (!validateForm()) return;

        setIsSubmitting(true);
        setGeneralError("");

        const result = await login(formData.email.trim(), formData.password);

        if (result.success) {
            const session = useAuthStore.getState();
            // Handle redirect after successful login
            const redirectPath = sessionStorage.getItem("redirectAfterLogin");
            if (redirectPath) {
                sessionStorage.removeItem("redirectAfterLogin");
                navigate(redirectPath);
            } else {
                navigate(session.user?.role === "admin" ? "/admin" : "/account");
            }
        } else {
            if (result.error === "INVALID_CREDENTIALS") {
                setGeneralError(t("auth.validation.invalidCredentials"));
            } else {
                setGeneralError(t("auth.validation.loginFailed"));
            }
        }

        setIsSubmitting(false);
    };

    const handleGuestContinue = () => {
        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
            sessionStorage.removeItem("redirectAfterLogin");
            navigate(redirectPath);
        } else {
            navigate("/shop");
        }
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
                                {t("auth.login.title")}
                            </motion.h1>
                            <motion.p variants={itemVariants} className="text-muted-foreground text-lg text-pretty">
                                {t("auth.login.subtitle")}
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

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div variants={itemVariants} className="space-y-2">
                                    <Label htmlFor="email" className="text-base font-medium">{t("auth.email")}</Label>
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
                                    <Label htmlFor="password" className="text-base font-medium">{t("auth.password")}</Label>
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
                                    <div className="text-left mt-2">
                                        <Link to="/forgot-password" className="text-sm text-[#0EA5E9] hover:text-[#F97316] transition-colors font-medium">
                                            {t("auth.login.forgotPassword")}
                                        </Link>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        type="submit"
                                        className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:shadow-lg hover:shadow-[#0EA5E9]/25 transition-all duration-300"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {t("auth.login.processing")}
                                            </div>
                                        ) : (
                                            t("auth.login.submit")
                                        )}
                                    </Button>
                                </motion.div>
                            </form>

                            {/* Guest Option */}
                            <motion.div variants={itemVariants} className="mt-6 pt-6 border-t border-gray-100">
                                <Button
                                    variant="outline"
                                    className="w-full h-14 text-lg font-bold rounded-xl border-2 border-[#0EA5E9]/20 text-[#0EA5E9] hover:bg-[#0EA5E9]/5 hover:border-[#0EA5E9] hover:text-[#0284C7] transition-all duration-300"
                                    onClick={handleGuestContinue}
                                >
                                    {t("auth.login.continueGuest")}
                                </Button>
                            </motion.div>

                            {/* Register Link */}
                            <motion.div variants={itemVariants} className="mt-8 text-center text-base">
                                <span className="text-gray-500">{t("auth.login.noAccount")} </span>
                                <Link to="/register" className="text-[#0EA5E9] font-bold hover:text-[#F97316] transition-colors">
                                    {t("auth.login.registerLink")}
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}

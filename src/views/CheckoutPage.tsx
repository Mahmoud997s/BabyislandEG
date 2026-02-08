"use client";

import { useState } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import { useLocaleNavigate } from "@/hooks/useLocaleNavigate";
import { motion } from "framer-motion";
import { CreditCard, Truck, Smartphone, ArrowLeft, LogIn, Tag, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore, CheckoutData } from "@/store/cart";
import { useAuthStore } from "@/store/authStore";
import { useSettings } from "@/hooks/use-settings";
import { discountsService, Discount } from "@/services/discountsService";
import { toast } from "sonner";

type PaymentMethod = "cod" | "card" | "vodafone";

export default function CheckoutPage() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const navigate = useLocaleNavigate();
    const { isAuthenticated } = useAuthStore();
    const {
        items,
        getSubtotal,
        getShippingFee,
        getTotal,
        getItemCount,
        setCheckoutData,
        placeOrder,
    } = useCartStore();

    const paymentMethods = [
        { id: "cod" as PaymentMethod, label: t("checkout.cashOnDelivery"), icon: Truck },
        { id: "card" as PaymentMethod, label: t("checkout.creditCard"), icon: CreditCard },
        { id: "vodafone" as PaymentMethod, label: t("checkout.vodafoneCash"), icon: Smartphone },
    ];

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        city: "",
        address: "",
        notes: "",
        email: "",
    });
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Discount Code
    const [couponCode, setCouponCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    // Dynamic Settings
    const { settings } = useSettings();

    const subtotal = getSubtotal();

    // Calculate Shipping
    let shipping = 0;
    if (subtotal >= 5000) {
        shipping = 0;
    } else {
        const city = formData.city;
        if (city === "Cairo" || city === "Giza") {
            shipping = settings?.shipping_cairo ?? 50;
        } else if (city === "Alexandria") {
            shipping = settings?.shipping_alex ?? 75;
        } else {
            // Default "Other" or undefined
            shipping = settings?.shipping_alex ?? 75; // Fallback to higher rate or a default "Rest of Egypt"
        }
    }

    // Calculate Discount
    let discountAmount = 0;
    if (appliedDiscount) {
        discountAmount = discountsService.calculateDiscount(appliedDiscount, subtotal);
    }

    // Recalculate Total with Discount
    const total = subtotal + shipping - discountAmount;

    const itemCount = getItemCount();

    const formatCurrency = (amount: number) => {
        return `${amount.toLocaleString(isRTL ? "ar-EG" : "en-EG")} ${t("common.currency")}`;
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = t("checkout.validation.nameRequired");
        }
        if (!formData.phone.trim()) {
            newErrors.phone = t("checkout.validation.phoneRequired");
        } else if (!/^01[0125][0-9]{8}$/.test(formData.phone.trim())) {
            newErrors.phone = t("checkout.validation.phoneInvalid");
        }
        if (!formData.city.trim()) {
            newErrors.city = t("checkout.validation.cityRequired");
        }
        if (!formData.address.trim()) {
            newErrors.address = t("checkout.validation.addressRequired");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        if (items.length === 0) return;

        setIsSubmitting(true);

        const checkoutData: CheckoutData = {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            city: formData.city.trim(),
            address: formData.address.trim(),
            notes: formData.notes.trim(),
            paymentMethod,
        };

        setCheckoutData(checkoutData);

        try {
            // Increment discount usage if applied
            if (appliedDiscount) {
                await discountsService.incrementUsage(appliedDiscount.id);
            }

            await placeOrder({ shipping, total });
            navigate("/checkout/success");
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error(t("checkout.validateCoupon"));
            return;
        }

        setValidatingCoupon(true);
        const result = await discountsService.validateCode(couponCode.trim(), subtotal);
        setValidatingCoupon(false);

        if (result.valid && result.discount) {
            setAppliedDiscount(result.discount);
            const currencyLabel = t("common.currency");
            toast.success(`${t("checkout.couponApplied")} ${result.discount.value}${result.discount.type === 'percentage' ? '%' : ' ' + currencyLabel}`);
        } else {
            toast.error(result.error || t("checkout.invalidCoupon"));
        }
    };

    const removeCoupon = () => {
        setAppliedDiscount(null);
        setCouponCode("");
        toast.info(t("checkout.removeCoupon"));
    };

    if (items.length === 0) {
        return (
            <Layout>
                <section className="py-16">
                    <div className="container-main text-center">
                        <h1 className="text-2xl font-bold mb-4">{t("checkout.emptyCart")}</h1>
                        <p className="text-muted-foreground mb-8">
                            {t("checkout.emptyCartDesc")}
                        </p>
                        <Button asChild>
                            <LocaleLink href="/shop">{t("checkout.shopNow")}</LocaleLink>
                        </Button>
                    </div>
                </section>
            </Layout>
        );
    }

    return (
        <Layout>
            <section className="py-8 lg:py-12">
                <div className="container-main">
                    {/* Header */}
                    <h1 className="text-2xl lg:text-3xl font-bold mb-8">{t("checkout.title")}</h1>

                    {/* Guest/Login Prompt for unauthenticated users */}
                    {!isAuthenticated && (
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <LogIn className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm sm:text-base">{t("checkout.haveAccount")}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{t("checkout.loginToTrack")}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    sessionStorage.setItem("redirectAfterLogin", "/checkout");
                                    navigate("/login");
                                }}
                            >
                                {t("checkout.loginNow")}
                            </Button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Form Section */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Customer Info */}
                                <div className="bg-card rounded-xl p-6">
                                    <h2 className="text-lg font-semibold mb-4">{t("checkout.customerInfo")}</h2>
                                    <div className="grid gap-4">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="name">{t("checkout.name")} {t("checkout.required")}</Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className={errors.name ? "border-destructive" : ""}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="phone">{t("checkout.phone")} {t("checkout.required")}</Label>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    placeholder="01xxxxxxxxx"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className={errors.phone ? "border-destructive" : ""}
                                                />
                                                {errors.phone && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="email">{t("checkout.emailOptional")}</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Info */}
                                <div className="bg-card rounded-xl p-6">
                                    <h2 className="text-lg font-semibold mb-4">{t("checkout.shippingInfo")}</h2>
                                    <div className="grid gap-4">
                                        <div>
                                            <Label htmlFor="city">{t("checkout.city")} {t("checkout.required")}</Label>
                                            <select
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={(e) => {
                                                    handleInputChange(e as any);
                                                    // Trigger re-calc of shipping if needed, 
                                                    // but we will do it in render/variables
                                                }}
                                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.city ? "border-destructive" : ""}`}
                                            >
                                                <option value="">{t("checkout.selectCity", "Select City")}</option>
                                                <option value="Cairo">Cairo (Metro)</option>
                                                <option value="Giza">Giza</option>
                                                <option value="Alexandria">Alexandria</option>
                                                <option value="Other">Other Governorates</option>
                                            </select>
                                            {errors.city && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.city}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="address">{t("checkout.address")} {t("checkout.required")}</Label>
                                            <Textarea
                                                id="address"
                                                name="address"
                                                placeholder={t("checkout.addressPlaceholder")}
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                className={errors.address ? "border-destructive" : ""}
                                            />
                                            {errors.address && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {errors.address}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="notes">{t("checkout.notesOptional")}</Label>
                                            <Textarea
                                                id="notes"
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-card rounded-xl p-6">
                                    <h2 className="text-lg font-semibold mb-4">{t("checkout.paymentMethod")}</h2>
                                    <div className="grid gap-3">
                                        {paymentMethods.map((method) => (
                                            <motion.button
                                                key={method.id}
                                                type="button"
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${paymentMethod === method.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === method.id
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-secondary"
                                                        }`}
                                                >
                                                    <method.icon className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium">{method.label}</span>
                                                {method.id !== "cod" && (
                                                    <span className="text-xs text-muted-foreground mr-auto">
                                                        {t("checkout.comingSoon")}
                                                    </span>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-card rounded-xl p-6 sticky top-24">
                                    <h2 className="text-lg font-semibold mb-4">{t("checkout.orderSummary")}</h2>

                                    {/* Items Count */}
                                    <div className="flex items-center justify-between py-3 border-b">
                                        <span className="text-muted-foreground">
                                            {t("checkout.itemCount")}
                                        </span>
                                        <span className="font-medium">{itemCount}</span>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="flex items-center justify-between py-3 border-b">
                                        <span className="text-muted-foreground">
                                            {t("checkout.subtotal")}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </div>

                                    {/* Shipping */}
                                    <div className="flex items-center justify-between py-3 border-b">
                                        <span className="text-muted-foreground">{t("checkout.shipping")}</span>
                                        <span className="font-medium">
                                            {shipping === 0
                                                ? t("checkout.free")
                                                : formatCurrency(shipping)}
                                        </span>
                                    </div>

                                    {/* Discount Code */}
                                    {!appliedDiscount ? (
                                        <div className="py-3 border-b">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder={t("checkout.discountCode")}
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && validateCoupon()}
                                                    disabled={validatingCoupon}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={validateCoupon}
                                                    disabled={validatingCoupon || !couponCode.trim()}
                                                    className="gap-2"
                                                >
                                                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                                                    {t("checkout.apply")}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-3 border-b space-y-2">
                                            <div className="flex items-center justify-between text-emerald-600">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="w-4 h-4" />
                                                    <span className="font-medium">{appliedDiscount.code}</span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={removeCoupon}
                                                    className="h-6 px-2 text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between text-emerald-600">
                                                <span className="text-sm">{t("checkout.discount")}</span>
                                                <span className="font-bold">- {formatCurrency(discountAmount)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Total */}
                                    <div className="flex items-center justify-between py-3">
                                        <span className="font-semibold">{t("checkout.total")}</span>
                                        <span className="text-xl font-bold text-primary">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full mt-6"
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            t("checkout.processing")
                                        ) : (
                                            <>
                                                {t("checkout.placeOrder")}
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                            </>
                                        )}
                                    </Button>

                                    {/* Payment info text removed */}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </Layout>
    );
}

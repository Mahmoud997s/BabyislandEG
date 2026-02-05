import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, User, Send, MessageSquare, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import emailjs from "@emailjs/browser";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function ContactPage() {
    const { t } = useTranslation();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = t("contact.validation.nameRequired");
        if (!formData.message.trim()) newErrors.message = t("contact.validation.messageRequired");
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t("contact.validation.emailInvalid");
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const saveToLocal = () => {
        const existing = JSON.parse(localStorage.getItem("contactSubmissions") || "[]");
        localStorage.setItem("contactSubmissions", JSON.stringify([...existing, { ...formData, date: new Date().toISOString() }]));
    };

    const handleFallback = () => {
        const subject = encodeURIComponent(`${import.meta.env.VITE_CONTACT_SUBJECT_PREFIX || "[Stroller Chic]"} ${formData.subject || "New Message"}`);
        const body = encodeURIComponent(`Name: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
        const mailtoLink = `mailto:${import.meta.env.VITE_CONTACT_TO_EMAIL || "info@strollerchic.com"}?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
        toast({
            title: t("contact.fallbackToast.title"),
            description: t("contact.fallbackToast.description"),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        saveToLocal();

        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        if (serviceId && templateId && publicKey) {
            try {
                await emailjs.send(
                    serviceId,
                    templateId,
                    {
                        from_name: formData.name,
                        from_phone: formData.phone,
                        from_email: formData.email || "N/A",
                        subject: formData.subject,
                        message: formData.message,
                        to_email: import.meta.env.VITE_CONTACT_TO_EMAIL
                    },
                    publicKey
                );
                toast({
                    title: t("contact.successToast.title"),
                    description: t("contact.successToast.description"),
                });
                setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            } catch (error) {
                console.error("EmailJS Failed:", error);
                handleFallback();
            }
        } else {
            handleFallback();
        }
        setIsSubmitting(false);
    };

    return (
        <Layout>
            <section className="py-12 lg:py-20">
                <div className="container-main max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold mb-4">{t("contact.title")}</h1>
                            <p className="text-muted-foreground">{t("contact.subtitle")}</p>
                        </div>

                        <div className="bg-card rounded-xl p-6 lg:p-8 shadow-sm border">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t("contact.form.name")} *</Label>
                                        <div className="relative">
                                            <User className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder={t("contact.placeholders.name")}
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={errors.name ? "border-destructive pr-10" : "pr-10"}
                                            />
                                        </div>
                                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                                        <div className="relative">
                                            <Phone className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                placeholder={t("contact.placeholders.phone")}
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="pr-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t("contact.form.email")}</Label>
                                        <div className="relative">
                                            <Mail className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder={t("contact.placeholders.email")}
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={errors.email ? "border-destructive pr-10" : "pr-10"}
                                            />
                                        </div>
                                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">{t("contact.form.subject")}</Label>
                                        <div className="relative">
                                            <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="subject"
                                                name="subject"
                                                placeholder={t("contact.placeholders.subject")}
                                                value={formData.subject}
                                                onChange={handleInputChange}
                                                className="pr-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">{t("contact.form.message")} *</Label>
                                    <div className="relative">
                                        <MessageSquare className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                                        <Textarea
                                            id="message"
                                            name="message"
                                            placeholder={t("contact.placeholders.message")}
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            className={`min-h-[150px] pr-10 ${errors.message ? "border-destructive" : ""}`}
                                        />
                                    </div>
                                    {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        t("contact.sending")
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            {t("contact.submit")}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}

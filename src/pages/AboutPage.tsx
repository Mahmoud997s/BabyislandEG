import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    ShieldCheck,
    Truck,
    RefreshCw,
    HeartHandshake,
    Star,
    Package
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
    const { t } = useTranslation();

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const offerItems = (t("about.offer.items", { returnObjects: true }) as string[]) || [];
    const returnItems = (t("about.returns.items", { returnObjects: true }) as string[]) || [];
    const afterSalesItems = (t("about.afterSales.items", { returnObjects: true }) as string[]) || [];

    return (
        <Layout>
            {/* Hero Section */}
            <section className="bg-primary/5 py-16 lg:py-24 text-center">
                <div className="container-main max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-primary">
                            {t("about.heroTitle")}
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                            {t("about.heroSubtitle")}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="rounded-full px-8">
                                <Link to="/shop">{t("about.ctaShop")}</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                                <Link to="/contact">{t("about.ctaContact")}</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="py-16 bg-background">
                <div className="container-main">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">{t("about.offer.title")}</h2>
                        <p className="text-muted-foreground">{t("about.offer.description")}</p>
                    </div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {offerItems.map((offer, idx) => (
                            <motion.div key={idx} variants={item}>
                                <Card className="h-full border hover:border-primary/50 transition-colors">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-lg">
                                            <Star className="w-5 h-5 text-primary" />
                                            {offer}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Services */}
            <section className="py-16 bg-muted/30">
                <div className="container-main">
                    <h2 className="text-3xl font-bold text-center mb-12">{t("about.services.title")}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="text-center hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Truck className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{t("about.services.items.delivery")}</h3>
                            </CardContent>
                        </Card>
                        <Card className="text-center hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <HeartHandshake className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{t("about.services.items.discount")}</h3>
                            </CardContent>
                        </Card>
                        <Card className="text-center hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{t("about.services.items.support")}</h3>
                            </CardContent>
                        </Card>
                        <Card className="text-center hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <RefreshCw className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">{t("about.services.items.returns")}</h3>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Stores */}
            <section className="py-16 bg-background">
                <div className="container-main">
                    <h2 className="text-3xl font-bold text-center mb-12">{t("about.stores.title")}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    {t("about.stores.mokattam.name")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{t("about.stores.mokattam.address")}</p>
                                <div className="flex items-center gap-2 text-sm font-medium pt-2 border-t">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>{t("about.stores.hours.weekdays")}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>{t("about.stores.hours.friday")}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    {t("about.stores.october.name")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground">{t("about.stores.october.address")}</p>
                                <div className="flex items-center gap-2 text-sm font-medium pt-2 border-t">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>{t("about.stores.hours.weekdays")}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>{t("about.stores.hours.friday")}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Returns & After Sales */}
            <section className="py-16 bg-muted/30">
                <div className="container-main">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                                {t("about.returns.title")}
                            </h2>
                            <ul className="space-y-4">
                                {returnItems.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span className="text-muted-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Package className="w-6 h-6 text-primary" />
                                {t("about.afterSales.title")}
                            </h2>
                            <ul className="space-y-4">
                                {afterSalesItems.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-muted-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support & Final CTA */}
            <section className="py-16 bg-background border-t">
                <div className="container-main max-w-3xl text-center">
                    <h2 className="text-3xl font-bold mb-8">{t("about.support.title")}</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                        <div className="p-6 bg-primary/5 rounded-xl">
                            <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">{t("about.support.phoneLabel")}</h3>
                            <p className="dir-ltr font-medium text-lg">+2 01062185805</p>
                        </div>
                        <div className="p-6 bg-primary/5 rounded-xl">
                            <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">{t("about.support.emailLabel")}</h3>
                            <p className="font-medium">info@babyislandeg.com</p>
                        </div>
                    </div>

                    <p className="text-muted-foreground mb-8">{t("about.support.availability")}</p>

                    <div className="bg-muted p-8 rounded-2xl">
                        <h3 className="text-2xl font-bold mb-4">{t("about.finalCta.title")}</h3>
                        <p className="text-muted-foreground mb-6">{t("about.finalCta.subtitle")}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg">
                                <Link to="/contact">{t("about.ctaContact")}</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link to="/shop">{t("about.ctaShop")}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

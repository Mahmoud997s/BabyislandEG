"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LocaleLink } from "@/components/LocaleLink";
import {
    ShieldCheck,
    Package,
    CheckCircle,
    Phone,
    Mail
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

export default function ReturnsPolicyPage() {
    const { t } = useTranslation();

    // Reusing the same lists from About page as per design lock/reuse instruction
    const returnItems = (t("about.returns.items", { returnObjects: true }) as string[]) || [];
    const afterSalesItems = (t("about.afterSales.items", { returnObjects: true }) as string[]) || [];

    return (
        <Layout>
            <section className="bg-primary/5 py-12 lg:py-16 text-center">
                <div className="container-main max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl lg:text-4xl font-bold mb-4 text-primary"
                    >
                        {t("about.returns.title")}
                    </motion.h1>
                </div>
            </section>

            <section className="py-16 bg-background">
                <div className="container-main">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* After Sales / Consumer Rights */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
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
                        </motion.div>

                        {/* Returns Policy */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
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
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Support CTA */}
            <section className="py-12 bg-muted/30 border-t">
                <div className="container-main max-w-2xl text-center">
                    <h2 className="text-2xl font-bold mb-4">{t("about.support.title")}</h2>
                    <p className="text-muted-foreground mb-6">
                        {t("about.finalCta.subtitle")}
                    </p>
                    <Button asChild size="lg">
                        <LocaleLink href="/contact">
                            <Phone className="w-4 h-4 mr-2" />
                            {t("about.ctaContact")}
                        </LocaleLink>
                    </Button>
                </div>
            </section>
        </Layout>
    );
}

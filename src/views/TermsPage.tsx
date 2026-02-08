"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LocaleLink } from "@/components/LocaleLink";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
    const { t } = useTranslation();
    const sections = t("terms.sections", { returnObjects: true }) as Record<string, string>;

    return (
        <Layout>
            <section className="bg-primary/5 py-12 lg:py-16 text-center">
                <div className="container-main max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl lg:text-4xl font-bold mb-4 text-primary"
                    >
                        {t("terms.title")}
                    </motion.h1>
                </div>
            </section>

            <section className="py-16 bg-background">
                <div className="container-main max-w-3xl space-y-8">
                    {Object.entries(sections).map(([key, title], idx) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <h2 className="text-xl font-bold mb-3 text-foreground">{title}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t("terms.placeholder")}
                            </p>
                        </motion.div>
                    ))}

                    <div className="pt-8 border-t">
                        <Button asChild variant="ghost">
                            <LocaleLink href="/contact">{t("about.ctaContact")}</LocaleLink>
                        </Button>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

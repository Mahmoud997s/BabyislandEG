"use client";

import { Truck, Shield, RotateCcw, Headphones, Headset } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export const BenefitsBar = () => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const benefits = [
        {
            icon: Headset,
            title: t('trust.support', 'دعم فني'),
            desc: t('trust.supportDesc', 'متاح 24/7'),
            delay: 0
        },
        {
            icon: RotateCcw,
            title: t('trust.easyReturns', 'إرجاع سهل'),
            desc: t('trust.easyReturnsDesc', 'خلال 14 يوم'),
            delay: 0.1
        },
        {
            icon: Shield,
            title: t('trust.warranty', 'ضمان شامل'),
            desc: t('trust.warrantyDesc', 'حتى 3 سنوات'),
            delay: 0.2
        },
        {
            icon: Truck,
            title: t('trust.freeShipping', 'شحن مجاني'),
            desc: t('trust.freeShippingDesc', 'للطلبات فوق 5000 جنية'),
            delay: 0.3
        }
    ];

    return (
        <section className="bg-white py-10 border-b">
            <div className="container-main">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 justify-items-center">
                    {benefits.map((benefit, i) => {
                        const Icon = benefit.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: benefit.delay, duration: 0.5 }}
                                className="flex flex-col items-center gap-4 group w-full justify-center text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#E0F2FE] flex items-center justify-center shrink-0 group-hover:bg-[#0EA5E9] transition-colors duration-300">
                                    <Icon className="w-8 h-8 text-[#0EA5E9] group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                        {benefit.desc}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

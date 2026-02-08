"use client";

import { Layout } from "@/components/layout/Layout";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Loader2, Package, CheckCircle, Truck, Home, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Order {
    id: string;
    customer_name: string;
    phone: string;
    city: string;
    address: string;
    status: string;
    total_amount: number;
    items: any[];
    created_at: string;
    updated_at: string;
}

export default function TrackOrderPage() {
    const { t, i18n } = useTranslation();
    const [orderId, setOrderId] = useState("");
    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const statusSteps = [
        { id: "pending", label: t('trackOrder.steps.pending'), icon: Package },
        { id: "confirmed", label: t('trackOrder.steps.confirmed'), icon: CheckCircle },
        { id: "shipped", label: t('trackOrder.steps.shipped'), icon: Truck },
        { id: "delivered", label: t('trackOrder.steps.delivered'), icon: Home },
    ];

    const trackOrder = async () => {
        if (!orderId.trim() || !phone.trim()) {
            setError(t('trackOrder.errors.missing'));
            return;
        }

        setLoading(true);
        setError("");
        setOrder(null);

        const { data, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId.trim())
            .eq('phone', phone.trim())
            .single();

        setLoading(false);

        if (fetchError || !data) {
            setError(t('trackOrder.errors.notFound'));
            return;
        }

        setOrder(data as Order);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language === 'en' ? 'en-EG' : 'ar-EG', { style: "currency", currency: "EGP" }).format(amount);
    };

    const getCurrentStepIndex = () => {
        if (!order) return -1;
        return statusSteps.findIndex(s => s.id === order.status);
    };

    return (
        <Layout>
            <section className="py-12 lg:py-20 min-h-[80vh] flex items-center justify-center bg-gray-50/50">
                <div className="container-main max-w-4xl w-full">
                    {/* Header with Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
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
                            {t('trackOrder.title')}
                        </h1>
                        <p className="text-muted-foreground text-lg text-pretty">{t('trackOrder.subtitle')}</p>
                    </motion.div>

                    {/* Search Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-md mx-auto mb-12"
                    >
                        <Card className="bg-white rounded-3xl p-2 shadow-xl border border-gray-100 overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl">{t('trackOrder.cardTitle')}</CardTitle>
                                <CardDescription>{t('trackOrder.cardDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t('trackOrder.orderIdLabel')}</Label>
                                        <div className="relative group">
                                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0EA5E9] transition-colors" />
                                            <Input
                                                placeholder={t('trackOrder.orderIdPlaceholder')}
                                                value={orderId}
                                                onChange={(e) => setOrderId(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
                                                className="pl-12 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('trackOrder.phoneLabel')}</Label>
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0EA5E9] transition-colors" />
                                            <Input
                                                placeholder={t('trackOrder.phonePlaceholder')}
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
                                                className="pl-12 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-red-500" />
                                        {error}
                                    </div>
                                )}

                                <Button
                                    onClick={trackOrder}
                                    disabled={loading}
                                    className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:shadow-lg hover:shadow-[#0EA5E9]/25 transition-all duration-300 gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t('trackOrder.loading')}
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-5 h-5" />
                                            {t('trackOrder.button')}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Order Details */}
                    {order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6 mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{t('trackOrder.info.title')}</h2>
                                    <p className="text-slate-500 mt-1">{t('trackOrder.info.id')}: <span className="font-mono text-slate-900 font-medium">#{order.id}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-500 mb-1">{t('trackOrder.status.updated')}</p>
                                    <p className="font-medium text-slate-900">{new Date(order.updated_at).toLocaleDateString(i18n.language === 'en' ? 'en-EG' : 'ar-EG')}</p>
                                </div>
                            </div>

                            {/* Status Timeline */}
                            <div className="relative py-8 px-4 mb-8 bg-gray-50/50 rounded-2xl border border-gray-100">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-8 md:gap-0">
                                    {statusSteps.map((step, index) => {
                                        const currentStep = getCurrentStepIndex();
                                        const isCompleted = index <= currentStep;
                                        const isCurrent = index === currentStep;

                                        return (
                                            <div key={step.id} className="flex flex-row md:flex-col items-center gap-4 md:gap-2 flex-1 relative w-full md:w-auto">
                                                {/* Connector Line (Desktop) */}
                                                {index < statusSteps.length - 1 && (
                                                    <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-10">
                                                        <div 
                                                            className={`h-full transition-all duration-500 ${index < currentStep ? 'bg-[#0EA5E9]' : 'bg-transparent'}`} 
                                                            style={{ width: index < currentStep ? '100%' : '0%' }}
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Connector Line (Mobile) */}
                                                {index < statusSteps.length - 1 && (
                                                    <div className="md:hidden absolute left-6 top-10 h-full w-0.5 bg-gray-200 -z-10 h-[calc(100%+2rem)]">
                                                         <div 
                                                            className={`w-full transition-all duration-500 ${index < currentStep ? 'bg-[#0EA5E9]' : 'bg-transparent'}`} 
                                                            style={{ height: index < currentStep ? '100%' : '0%' }}
                                                        />
                                                    </div>
                                                )}

                                                <div className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                                    ? isCurrent
                                                        ? 'bg-[#0EA5E9] text-white ring-4 ring-[#0EA5E9]/20 shadow-lg shadow-[#0EA5E9]/30 scale-110'
                                                        : 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                                    : 'bg-white border-2 border-slate-200 text-slate-300'
                                                    }`}>
                                                    <step.icon className="w-5 h-5" />
                                                </div>

                                                <div className="md:text-center pt-2 md:pt-2">
                                                    <p className={`font-semibold text-sm ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <p className="text-xs text-[#0EA5E9] font-medium mt-0.5">{t('trackOrder.status.current')}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Details Column */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">{t('trackOrder.info.title')}</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-slate-500">{t('trackOrder.info.name')}</p>
                                            <p className="font-medium">{order.customer_name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-500">{t('trackOrder.info.phone')}</p>
                                            <p className="font-medium">{order.phone}</p>
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <p className="text-slate-500">{t('trackOrder.info.address')}</p>
                                            <p className="font-medium">{order.address}, {order.city}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Column */}
                                <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">{t('trackOrder.items.title')} ({order.items?.length || 0})</h3>
                                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {order.items?.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md border border-gray-100" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                        <Package className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{item.name}</p>
                                                    <p className="text-xs text-slate-500">{t('trackOrder.items.quantity')}: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-sm whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
                                        <span className="font-bold text-gray-900">{t('trackOrder.info.total')}</span>
                                        <span className="text-xl font-bold text-[#0EA5E9]">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>
        </Layout>
    );
}

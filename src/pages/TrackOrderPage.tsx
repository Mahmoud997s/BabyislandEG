import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Loader2, Package, CheckCircle, Truck, Home, Search } from "lucide-react";
import { motion } from "framer-motion";

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

const statusSteps = [
    { id: "pending", label: "قيد المراجعة", icon: Package },
    { id: "confirmed", label: "تم التأكيد", icon: CheckCircle },
    { id: "shipped", label: "في الطريق", icon: Truck },
    { id: "delivered", label: "تم التوصيل", icon: Home },
];

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const trackOrder = async () => {
        if (!orderId.trim() || !phone.trim()) {
            setError("الرجاء إدخال رقم الطلب ورقم الهاتف");
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
            setError("لم يتم العثور على الطلب. تأكد من رقم الطلب ورقم الهاتف.");
            return;
        }

        setOrder(data as Order);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(amount);
    };

    const getCurrentStepIndex = () => {
        if (!order) return -1;
        return statusSteps.findIndex(s => s.id === order.status);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" dir="rtl">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
                        تتبع طلبك
                    </h1>
                    <p className="text-slate-500">أدخل رقم الطلب ورقم الهاتف لمعرفة حالة طلبك</p>
                </motion.div>

                {/* Search Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-0 shadow-xl shadow-slate-200/50 mb-8">
                        <CardHeader>
                            <CardTitle>معلومات الطلب</CardTitle>
                            <CardDescription>أدخل البيانات المرسلة إليك عبر البريد الإلكتروني</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>رقم الطلب</Label>
                                    <Input
                                        placeholder="مثال: 12345"
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>رقم الهاتف</Label>
                                    <Input
                                        placeholder="مثال: 01234567890"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={trackOrder}
                                disabled={loading}
                                className="w-full gap-2"
                                size="lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        جاري البحث...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        تتبع الطلب
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
                        className="space-y-6"
                    >
                        {/* Status Timeline */}
                        <Card className="border-0 shadow-xl shadow-slate-200/50">
                            <CardHeader>
                                <CardTitle>حالة الطلب</CardTitle>
                                <CardDescription>آخر تحديث: {new Date(order.updated_at).toLocaleDateString("ar-EG")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    {statusSteps.map((step, index) => {
                                        const currentStep = getCurrentStepIndex();
                                        const isCompleted = index <= currentStep;
                                        const isCurrent = index === currentStep;

                                        return (
                                            <div key={step.id} className="flex items-start gap-4 mb-8 last:mb-0">
                                                {/* Icon */}
                                                <div className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isCompleted
                                                    ? isCurrent
                                                        ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                                                        : 'bg-emerald-500 text-white'
                                                    : 'bg-slate-200 text-slate-400'
                                                    }`}>
                                                    <step.icon className="w-6 h-6" />

                                                    {/* Connector Line */}
                                                    {index < statusSteps.length - 1 && (
                                                        <div className={`absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-8 ${index < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                                                            }`} />
                                                    )}
                                                </div>

                                                {/* Label */}
                                                <div className="flex-1 pt-2">
                                                    <p className={`font-medium ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <p className="text-sm text-blue-600 mt-1">الحالة الحالية</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Info */}
                        <Card className="border-0 shadow-xl shadow-slate-200/50">
                            <CardHeader>
                                <CardTitle>معلومات الطلب</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">رقم الطلب</span>
                                    <span className="font-medium">{order.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">الاسم</span>
                                    <span className="font-medium">{order.customer_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">المدينة</span>
                                    <span className="font-medium">{order.city}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">العنوان</span>
                                    <span className="font-medium">{order.address}</span>
                                </div>
                                <div className="flex justify-between border-t pt-3">
                                    <span className="font-semibold">الإجمالي</span>
                                    <span className="text-xl font-bold text-emerald-600">{formatCurrency(order.total_amount)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card className="border-0 shadow-xl shadow-slate-200/50">
                            <CardHeader>
                                <CardTitle>المنتجات ({order.items?.length || 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {order.items?.map((item: any, index: number) => (
                                        <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-slate-500">الكمية: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

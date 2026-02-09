"use client";

import { useState, useCallback } from "react";
import { Order } from "./columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2, Package, Truck, MapPin, Phone, Mail, Copy, CheckCircle,
    Clock, AlertCircle, User, CreditCard, FileText, Save
} from "lucide-react";
import { toast } from "sonner";

interface OrderDetailsProps {
    order: Order;
    onUpdate?: () => void;
}

// Status configuration with colors and allowed transitions
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
    pending: { label: "Pending", color: "text-amber-700", bgColor: "bg-amber-100", icon: Clock },
    processing: { label: "Processing", color: "text-blue-700", bgColor: "bg-blue-100", icon: Package },
    shipped: { label: "Shipped", color: "text-purple-700", bgColor: "bg-purple-100", icon: Truck },
    delivered: { label: "Delivered", color: "text-green-700", bgColor: "bg-green-100", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "text-red-700", bgColor: "bg-red-100", icon: AlertCircle },
};

const VALID_TRANSITIONS: Record<string, string[]> = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
};

export function OrderDetails({ order, onUpdate }: OrderDetailsProps) {
    const [status, setStatus] = useState<string>(order.status);
    const [notes, setNotes] = useState<string>(order.notes || "");
    const [updating, setUpdating] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);
    const [copied, setCopied] = useState(false);

    // Parse items safely
    const items = Array.isArray(order.items)
        ? order.items
        : typeof order.items === 'string'
            ? JSON.parse(order.items)
            : [];

    // Get allowed status transitions
    const allowedTransitions = VALID_TRANSITIONS[status] || [];

    // Handle status update via API
    const handleStatusChange = useCallback(async (newStatus: string) => {
        if (newStatus === status) return;

        const previousStatus = status;
        setUpdating(true);
        setStatus(newStatus); // Optimistic update

        try {
            const response = await fetch(`/api/admin/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update status");
            }

            toast.success(`تم تحديث الحالة إلى ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
            if (onUpdate) onUpdate();
        } catch (error: unknown) {
            // Rollback on error
            setStatus(previousStatus);
            toast.error(error instanceof Error ? error.message : "فشل في تحديث الحالة");
        } finally {
            setUpdating(false);
        }
    }, [order.id, status, onUpdate]);

    // Handle notes save via API
    const handleSaveNotes = useCallback(async () => {
        if (notes === order.notes) return;

        setSavingNotes(true);

        try {
            const response = await fetch(`/api/admin/orders/${order.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ notes }),
            });

            if (!response.ok) {
                throw new Error("Failed to save notes");
            }

            toast.success("تم حفظ الملاحظات");
            if (onUpdate) onUpdate();
        } catch (error: unknown) {
            toast.error("فشل في حفظ الملاحظات");
        } finally {
            setSavingNotes(false);
        }
    }, [order.id, notes, order.notes, onUpdate]);

    // Copy order ID to clipboard
    const copyOrderId = useCallback(() => {
        navigator.clipboard.writeText(order.id);
        setCopied(true);
        toast.success("تم نسخ رقم الطلب");
        setTimeout(() => setCopied(false), 2000);
    }, [order.id]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("ar-EG", {
            style: "currency",
            currency: "EGP",
        }).format(amount);
    };

    const currentStatusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const StatusIcon = currentStatusConfig.icon;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <SheetTitle className="text-xl">Order #{order.id.slice(0, 8)}</SheetTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={copyOrderId}
                        >
                            {copied ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                    <Badge className={`${currentStatusConfig.bgColor} ${currentStatusConfig.color} gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {currentStatusConfig.label}
                    </Badge>
                </div>
                <SheetDescription className="flex items-center gap-4 text-sm">
                    <span>📅 {new Date(order.created_at).toLocaleString("ar-EG")}</span>
                    <span>💳 {order.payment_method || "N/A"}</span>
                </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1 -mx-6 px-6">
                {/* Status Control */}
                <div className="mb-6 p-4 bg-slate-50 rounded-lg space-y-3 border">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        تحديث حالة الطلب
                    </label>
                    <Select
                        value={status}
                        onValueChange={handleStatusChange}
                        disabled={updating || allowedTransitions.length === 0}
                    >
                        <SelectTrigger className={updating ? "opacity-50" : ""}>
                            {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={status} disabled>
                                {STATUS_CONFIG[status]?.label || status} (الحالية)
                            </SelectItem>
                            {allowedTransitions.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {STATUS_CONFIG[s]?.label || s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {allowedTransitions.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                            لا يمكن تغيير الحالة (الطلب منتهي)
                        </p>
                    )}
                </div>

                {/* Customer & Shipping Details */}
                <div className="mb-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" /> معلومات العميل والشحن
                    </h3>
                    <div className="grid gap-3 text-sm border rounded-lg p-4 bg-white">
                        <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{order.customer_name || "N/A"}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-muted-foreground">{order.shipping_address || "N/A"}</p>
                                <p className="text-muted-foreground">{order.city || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a href={`tel:${order.phone}`} className="text-primary hover:underline">
                                {order.phone || "N/A"}
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <a href={`mailto:${order.email}`} className="text-primary hover:underline">
                                {order.email || "N/A"}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" /> المنتجات ({items.length})
                    </h3>
                    <div className="border rounded-lg divide-y bg-white">
                        {items.length > 0 ? (
                            items.map((item: { product: { name: string; price: number; variants?: { images?: string[] }[] }; quantity: number }, i: number) => (
                                <div key={i} className="p-4 flex items-center gap-4">
                                    {item.product?.variants?.[0]?.images?.[0] && (
                                        <img
                                            src={item.product.variants[0].images[0]}
                                            alt={item.product?.name || "Product"}
                                            className="w-12 h-12 rounded object-cover border"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">
                                            {item.product?.name || "Unknown Product"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            الكمية: {item.quantity} × {formatCurrency(item.product?.price || 0)}
                                        </p>
                                    </div>
                                    <div className="font-medium text-sm whitespace-nowrap">
                                        {formatCurrency((item.product?.price || 0) * item.quantity)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-muted-foreground">
                                لا توجد منتجات
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="my-4" />

                {/* Financial Summary */}
                <div className="mb-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> الملخص المالي
                    </h3>
                    <div className="space-y-2 text-sm border rounded-lg p-4 bg-white">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">المجموع الفرعي</span>
                            <span>{formatCurrency(order.subtotal || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">رسوم الشحن</span>
                            <span>{formatCurrency(order.shipping_fee || 0)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>الإجمالي</span>
                            <span className="text-primary">{formatCurrency(order.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Status */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">حالة الدفع:</span>
                        <Badge variant={order.payment_status === "paid" ? "default" : "outline"}>
                            {order.payment_status === "paid" ? "مدفوع" :
                             order.payment_status === "refunded" ? "مسترد" : "غير مدفوع"}
                        </Badge>
                    </div>
                </div>

                <Separator className="my-4" />

                {/* Internal Notes */}
                <div className="mb-6 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" /> ملاحظات داخلية
                    </h3>
                    <Textarea
                        placeholder="أضف ملاحظات داخلية للطلب..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={savingNotes || notes === order.notes}
                        className="gap-2"
                    >
                        {savingNotes ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        حفظ الملاحظات
                    </Button>
                </div>

                {/* Timeline (simple version) */}
                <div className="mb-6 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4" /> الجدول الزمني
                    </h3>
                    <div className="border rounded-lg p-4 bg-white space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-muted-foreground">تم إنشاء الطلب</span>
                            <span className="mr-auto text-xs">
                                {new Date(order.created_at).toLocaleString("ar-EG")}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className={`w-2 h-2 rounded-full ${currentStatusConfig.bgColor}`}></div>
                            <span className="text-muted-foreground">الحالة الحالية: {currentStatusConfig.label}</span>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

import { useState } from "react";
import { Order } from "./columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { Loader2, Package, Truck, MapPin, Phone, Mail } from "lucide-react";
import { orderService } from "@/services/orderService";
import { toast } from "sonner"; // Assuming sonner is installed, or use hook

interface OrderDetailsProps {
    order: Order;
    onUpdate?: () => void;
}

export function OrderDetails({ order, onUpdate }: OrderDetailsProps) {
    const [status, setStatus] = useState<string>(order.status);
    const [updating, setUpdating] = useState(false);

    // Safe parsing of items if they are JSON string or already object
    const items = Array.isArray(order.items as any)
        ? (order.items as any)
        : typeof order.items === 'string'
            ? JSON.parse(order.items)
            : [];

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true);
        setStatus(newStatus);

        try {
            const success = await orderService.updateOrderStatus(order.id, newStatus);
            if (success) {
                // Show toast
                if (onUpdate) onUpdate();
            } else {
                // Revert if failed
                setStatus(order.status);
            }
        } catch (error) {
            console.error(error);
            setStatus(order.status);
        } finally {
            setUpdating(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-EG", {
            style: "currency",
            currency: "EGP",
        }).format(amount);
    };

    return (
        <div className="flex flex-col h-full">
            <SheetHeader className="mb-6">
                <div className="flex items-center justify-between">
                    <SheetTitle>Order #{order.id.slice(0, 8)}</SheetTitle>
                    <Badge variant={
                        status === 'delivered' ? 'default' :
                            status === 'shipped' ? 'secondary' :
                                status === 'cancelled' ? 'destructive' : 'outline'
                    } className="capitalize">{status}</Badge>
                </div>
                <SheetDescription>
                    Placed on {new Date(order.created_at).toLocaleString()}
                </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1 -mx-6 px-6">
                {/* Status Control */}
                <div className="mb-8 p-4 bg-muted/50 rounded-lg space-y-3">
                    <label className="text-sm font-medium">Update Order Status</label>
                    <Select
                        value={status}
                        onValueChange={handleStatusChange}
                        disabled={updating}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Shipping Details */}
                <div className="mb-8 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Shipping Details
                    </h3>
                    <div className="grid gap-3 text-sm border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">Address</p>
                                <p className="text-muted-foreground">{order.shipping_address || "N/A"}</p>
                                <p className="text-muted-foreground">{order.city || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{order.phone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{order.email || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="mb-8 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" /> Ordered Items
                    </h3>
                    <div className="border rounded-lg divide-y">
                        {items.map((item: any, i: number) => (
                            <div key={i} className="p-4 flex items-center gap-4">
                                {item.product.variants?.[0]?.images?.[0] && (
                                    <img
                                        src={item.product.variants[0].images[0]}
                                        alt={item.product.name}
                                        className="w-12 h-12 rounded object-cover border"
                                    />
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{item.product.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Qty: {item.quantity} × {formatCurrency(item.product.price)}
                                    </p>
                                </div>
                                <div className="font-medium text-sm">
                                    {formatCurrency(item.product.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{formatCurrency(order.shipping_fee || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2">
                        <span>Total</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

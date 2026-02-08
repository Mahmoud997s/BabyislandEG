"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Eye, Copy, Truck, Ban, CheckCircle, RefreshCcw, StickyNote, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Order } from "./columns";
import { OrderDetails } from "./order-details";
import { toast } from "sonner";
import { 
    updateOrderStatus, 
    cancelOrder, 
    markOrderAsPaid, 
    refundOrder, 
    addInternalNote, 
    updateTracking 
} from "@/actions/orders";

interface OrderActionsProps {
    order: Order;
}

export function OrderActions({ order }: OrderActionsProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Dialog States
    const [activeDialog, setActiveDialog] = useState<"cancel" | "note" | "tracking" | "refund" | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [refundAmount, setRefundAmount] = useState("");

    const handleAction = (action: () => Promise<any>, successMessage: string) => {
        startTransition(async () => {
            try {
                await action();
                toast.success(successMessage);
                setActiveDialog(null);
                setInputValue("");
            } catch (error: any) {
                toast.error(error.message || "Action failed");
            }
        });
    };

    return (
        <>
            <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(order.id);
                            toast.success("Order ID copied");
                        }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Order ID
                        </DropdownMenuItem>
                        <SheetTrigger asChild>
                            <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                        </SheetTrigger>
                        
                        <DropdownMenuSeparator />
                        
                        {/* Status Submenu */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Truck className="mr-2 h-4 w-4" />
                                Change Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                {['pending', 'processing', 'shipped', 'delivered'].map((status) => (
                                    <DropdownMenuItem 
                                        key={status}
                                        onClick={() => handleAction(() => updateOrderStatus(order.id, status), `Status updated to ${status}`)}
                                        disabled={order.status === status || isPending}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                        {order.status === status && <CheckCircle className="ml-2 h-3 w-3" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {/* Payment Actions */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Payment
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem 
                                    onClick={() => handleAction(() => markOrderAsPaid(order.id), "Order marked as paid")}
                                    disabled={order.payment_status === 'paid' || isPending}
                                >
                                    Mark as Paid
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveDialog("refund")}>
                                    Issue Refund...
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => setActiveDialog("tracking")}>
                            <Truck className="mr-2 h-4 w-4" />
                            Update Tracking
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => setActiveDialog("note")}>
                            <StickyNote className="mr-2 h-4 w-4" />
                            Add Internal Note
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setActiveDialog("cancel")}
                        >
                            <Ban className="mr-2 h-4 w-4" />
                            Cancel Order...
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <SheetContent className="sm:max-w-xl w-full">
                    <OrderDetails order={order} />
                </SheetContent>
            </Sheet>

            {/* Cancel Dialog */}
            <Dialog open={activeDialog === "cancel"} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="cancel-reason">Reason for cancellation</Label>
                        <Input 
                            id="cancel-reason" 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Customer request, Out of stock, etc." 
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>Back</Button>
                        <Button 
                            variant="destructive" 
                            disabled={isPending || !inputValue.trim()}
                            onClick={() => handleAction(() => cancelOrder(order.id, inputValue), "Order cancelled")}
                        >
                            {isPending ? "Cancelling..." : "Confirm Cancel"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Note Dialog */}
            <Dialog open={activeDialog === "note"} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Internal Note</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="note">Note</Label>
                        <Textarea 
                            id="note" 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Add details about this order..." 
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
                        <Button 
                            disabled={isPending || !inputValue.trim()}
                            onClick={() => handleAction(() => addInternalNote(order.id, inputValue), "Note added")}
                        >
                            {isPending ? "Saving..." : "Save Note"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tracking Dialog */}
            <Dialog open={activeDialog === "tracking"} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Tracking Information</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="tracking">Tracking Number / Link</Label>
                        <Input 
                            id="tracking" 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="e.g. 12345678 or URL" 
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
                        <Button 
                            disabled={isPending || !inputValue.trim()}
                            onClick={() => handleAction(() => updateTracking(order.id, inputValue), "Tracking updated")}
                        >
                            {isPending ? "Updating..." : "Update Tracking"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

             {/* Refund Dialog */}
             <Dialog open={activeDialog === "refund"} onOpenChange={(open) => !open && setActiveDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Issue Refund</DialogTitle>
                        <DialogDescription>
                            Process a refund for this order. Current Total: {order.total_amount}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="amount">Refund Amount</Label>
                        <Input 
                            id="amount" 
                            type="number"
                            value={refundAmount} 
                            onChange={(e) => setRefundAmount(e.target.value)}
                            placeholder="Amount..." 
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
                        <Button 
                            variant="destructive"
                            disabled={isPending || !refundAmount}
                            onClick={() => handleAction(() => refundOrder(order.id, parseFloat(refundAmount), "partial"), "Partial refund processed")}
                        >
                           Partial Refund
                        </Button>
                        <Button 
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => handleAction(() => refundOrder(order.id, order.total_amount, "full"), "Full refund processed")}
                        >
                           Refund Full Amount
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

import { OrderActions } from "./order-actions";

export type Order = {
    id: string;
    created_at: string;
    customer_name: string;
    total_amount: number;
    subtotal?: number;
    shipping_fee?: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    payment_status: "paid" | "unpaid" | "refunded";
    payment_method?: string;
    items: any; // JSONB
    shipping_address?: string;
    city?: string;
    phone?: string;
    email?: string;
    notes?: string;
};

export const columns: ColumnDef<Order>[] = [
    {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => <div className="font-medium">{(row.getValue("id") as string).slice(0, 8)}...</div>,
    },
    {
        accessorKey: "customer_name",
        header: "Customer",
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            return new Date(row.getValue("created_at")).toLocaleDateString();
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            let variant: "default" | "secondary" | "destructive" | "outline" = "outline";

            switch (status) {
                case 'delivered': variant = 'default'; break;
                case 'shipped': variant = 'secondary'; break;
                case 'cancelled': variant = 'destructive'; break;
                case 'processing': variant = 'outline'; break;
                default: variant = 'outline';
            }

            return <Badge variant={variant} className="capitalize">{status}</Badge>;
        },
    },
    {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ row }) => {
            const status = row.getValue("payment_status") as string;
            return (
                <span className={
                    status === 'paid' ? "text-green-600 font-medium" :
                        status === 'refunded' ? "text-red-600" : "text-yellow-600"
                }>
                    {status.toUpperCase()}
                </span>
            )
        }
    },
    {
        accessorKey: "total_amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="justify-end w-full"
                >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total_amount"));
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "EGP",
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <OrderActions order={row.original} />
    }
];

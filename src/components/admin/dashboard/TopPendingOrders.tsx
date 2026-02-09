"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, AlertCircle, ShoppingBag } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
    id: string;
    customer_name: string;
    total_amount: number;
    created_at: string;
    status: string;
}

export function TopPendingOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch("/api/admin/orders?status=pending&pageSize=8&sort=created_at&dir=desc");
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setOrders(data.rows || []);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(val);
    };

    if (loading) {
        return (
            <Card className="h-full shadow-sm border-slate-200">
                <CardHeader className="pb-2 border-b border-slate-50">
                    <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="h-full border-red-100 bg-red-50/50">
                <CardContent className="flex flex-col items-center justify-center py-8 text-red-600">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <p className="text-sm font-medium">Failed to load orders</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full shadow-sm border-slate-200 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    Pending Orders
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 ml-2">
                        {orders.length}
                    </Badge>
                </CardTitle>
                <LocaleLink href="/admin/orders?status=pending">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-slate-900">
                        View All <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </LocaleLink>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                {orders.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                        <ShoppingBag className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No pending orders</p>
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[80px] text-xs font-semibold">ID</TableHead>
                                    <TableHead className="text-xs font-semibold">Customer</TableHead>
                                    <TableHead className="text-right text-xs font-semibold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow 
                                        key={order.id} 
                                        className="cursor-pointer hover:bg-slate-50 transition-colors group"
                                    >
                                        <TableCell className="font-mono text-xs font-medium text-slate-600">
                                            <LocaleLink href={`/admin/orders/${order.id}`} className="block w-full h-full">
                                                #{order.id.slice(0, 6)}
                                            </LocaleLink>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-slate-900">
                                            <LocaleLink href={`/admin/orders/${order.id}`} className="block w-full h-full">
                                                {order.customer_name}
                                                <div className="text-[10px] text-slate-400 font-normal">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </LocaleLink>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-700 text-sm">
                                            <LocaleLink href={`/admin/orders/${order.id}`} className="block w-full h-full">
                                                {formatCurrency(order.total_amount)}
                                            </LocaleLink>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

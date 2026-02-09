"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, AlertCircle, Package } from "lucide-react";
import { LocaleLink } from "@/components/LocaleLink";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
    id: string;
    name: string;
    name_ar?: string;
    stockQuantity: number;
    price: number;
}

export function TopLowStock() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("/api/admin/products?stock=low&pageSize=8");
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setProducts(data.rows || []);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
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
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-8" />
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
                    <p className="text-sm font-medium">Failed to load low stock items</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full shadow-sm border-slate-200 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                    <Package className="w-4 h-4 text-red-500" />
                    Low Stock Alert
                    <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 ml-2">
                        {products.length}
                    </Badge>
                </CardTitle>
                <LocaleLink href="/admin/products?stock=low">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-slate-900">
                        View All <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </LocaleLink>
            </CardHeader>
            <CardContent className="p-0 flex-1">
                {products.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                        <Package className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No low stock items!</p>
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="text-xs font-semibold">Product</TableHead>
                                    <TableHead className="text-right text-xs font-semibold w-[80px]">Stock</TableHead>
                                    <TableHead className="text-right text-xs font-semibold w-[80px]">Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((p) => (
                                    <TableRow 
                                        key={p.id} 
                                        className="cursor-pointer hover:bg-red-50/30 transition-colors"
                                    >
                                        <TableCell className="text-sm font-medium text-slate-900">
                                            <LocaleLink href={`/admin/products/${p.id}`} className="block w-full h-full truncate max-w-[150px]">
                                                {p.name}
                                            </LocaleLink>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <LocaleLink href={`/admin/products/${p.id}`} className="block w-full h-full">
                                                <Badge variant="outline" className={`font-mono ${p.stockQuantity === 0 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                                    {p.stockQuantity}
                                                </Badge>
                                            </LocaleLink>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-slate-500">
                                            <LocaleLink href={`/admin/products/${p.id}`} className="block w-full h-full">
                                                {formatCurrency(p.price)}
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

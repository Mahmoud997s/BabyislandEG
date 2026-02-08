"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { discountsService, Discount, DiscountInput } from "@/services/discountsService";
import { Loader2, Plus, Percent, DollarSign, Trash2, Edit, Tag, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

    // Form State
    const [formData, setFormData] = useState<DiscountInput>({
        code: "",
        type: "percentage",
        value: 10,
        min_order_amount: 0,
        max_uses: null,
        expires_at: null,
        active: true
    });

    useEffect(() => {
        loadDiscounts();
    }, []);

    const loadDiscounts = async () => {
        setLoading(true);
        const data = await discountsService.getAll();
        setDiscounts(data);
        setLoading(false);
    };

    const openCreateDialog = () => {
        setEditingDiscount(null);
        setFormData({
            code: "",
            type: "percentage",
            value: 10,
            min_order_amount: 0,
            max_uses: null,
            expires_at: null,
            active: true
        });
        setDialogOpen(true);
    };

    const openEditDialog = (discount: Discount) => {
        setEditingDiscount(discount);
        setFormData({
            code: discount.code,
            type: discount.type,
            value: discount.value,
            min_order_amount: discount.min_order_amount,
            max_uses: discount.max_uses,
            expires_at: discount.expires_at ? discount.expires_at.split('T')[0] : null,
            active: discount.active
        });
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.code.trim()) {
            toast.error("Please enter a discount code");
            return;
        }

        const payload = {
            ...formData,
            code: formData.code.toUpperCase().trim(),
            expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
        };

        if (editingDiscount) {
            const success = await discountsService.update(editingDiscount.id, payload);
            if (success) {
                toast.success("Coupon updated successfully");
                loadDiscounts();
                setDialogOpen(false);
            } else {
                toast.error("Failed to update coupon");
            }
        } else {
            const result = await discountsService.create(payload);
            if (result) {
                toast.success("Coupon created successfully");
                loadDiscounts();
                setDialogOpen(false);
            } else {
                toast.error("Failed to create coupon - Code may already exist");
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        const success = await discountsService.delete(id);
        if (success) {
            toast.success("Coupon deleted");
            loadDiscounts();
        } else {
            toast.error("Failed to delete coupon");
        }
    };

    const toggleActive = async (discount: Discount) => {
        await discountsService.update(discount.id, { active: !discount.active });
        loadDiscounts();
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Discount Codes
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Manage coupons and promotional offers
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create New Coupon
                    </Button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                >
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 p-6 text-white shadow-lg shadow-violet-500/20">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-violet-100 text-sm">Total Coupons</span>
                                <Tag className="h-5 w-5 text-violet-200" />
                            </div>
                            <p className="text-3xl font-bold">{discounts.length}</p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg shadow-emerald-500/20">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-emerald-100 text-sm">Active</span>
                                <Tag className="h-5 w-5 text-emerald-200" />
                            </div>
                            <p className="text-3xl font-bold">{discounts.filter(d => d.active).length}</p>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white shadow-lg shadow-amber-500/20">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-amber-100 text-sm">Redemptions</span>
                                <Tag className="h-5 w-5 text-amber-200" />
                            </div>
                            <p className="text-3xl font-bold">{discounts.reduce((sum, d) => sum + d.uses_count, 0)}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold text-slate-800">Coupons List</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {discounts.length === 0 ? (
                                <div className="text-center py-12">
                                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">No coupons found</p>
                                    <Button onClick={openCreateDialog} variant="link" className="mt-2">
                                        Create your first coupon
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead>Code</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Min Order</TableHead>
                                            <TableHead>Usage</TableHead>
                                            <TableHead>Expires</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {discounts.map((discount) => (
                                            <TableRow key={discount.id} className="hover:bg-slate-50">
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono text-base bg-violet-50 text-violet-700 border-violet-200">
                                                        {discount.code}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {discount.type === "percentage" ? (
                                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                                            <Percent className="w-3 h-3 mr-1" /> %
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                            <DollarSign className="w-3 h-3 mr-1" /> Fixed
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-bold">
                                                    {discount.value}{discount.type === "percentage" ? "%" : " EGP"}
                                                </TableCell>
                                                <TableCell>{discount.min_order_amount} EGP</TableCell>
                                                <TableCell>
                                                    {discount.uses_count}
                                                    {discount.max_uses && ` / ${discount.max_uses}`}
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500">
                                                    {formatDate(discount.expires_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={discount.active}
                                                        onCheckedChange={() => toggleActive(discount)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="icon" variant="ghost" onClick={() => openEditDialog(discount)}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(discount.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingDiscount ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
                        <DialogDescription>Enter discount code details</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Discount Code</Label>
                            <Input
                                placeholder="e.g. SAVE20"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="font-mono uppercase"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Discount Type</Label>
                                <Select value={formData.type} onValueChange={(v: "percentage" | "fixed") => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage %</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Order Amount (EGP)</Label>
                                <Input
                                    type="number"
                                    value={formData.min_order_amount}
                                    onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Uses</Label>
                                <Input
                                    type="number"
                                    placeholder="Unlimited"
                                    value={formData.max_uses || ""}
                                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? Number(e.target.value) : null })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Expiration Date</Label>
                            <Input
                                type="date"
                                value={formData.expires_at || ""}
                                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value || null })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.active}
                                onCheckedChange={(v) => setFormData({ ...formData, active: v })}
                            />
                            <Label>Activate Coupon</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>
                            {editingDiscount ? "Save Changes" : "Create Coupon"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

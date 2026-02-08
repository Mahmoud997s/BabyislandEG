"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import { customersService, Customer } from "@/services/customersService";
import { Loader2, Users, Search, Phone, Mail, MapPin, ShoppingBag, Download } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerOrders, setCustomerOrders] = useState<any[]>([]);
    const [sheetOpen, setSheetOpen] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredCustomers(customers);
        } else {
            const q = searchQuery.toLowerCase();
            setFilteredCustomers(
                customers.filter(c =>
                    c.name.toLowerCase().includes(q) ||
                    c.phone.includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    c.city.toLowerCase().includes(q)
                )
            );
        }
    }, [searchQuery, customers]);

    const loadCustomers = async () => {
        setLoading(true);
        const data = await customersService.getAll();
        setCustomers(data);
        setFilteredCustomers(data);
        setLoading(false);
    };

    const openCustomerDetails = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setSheetOpen(true);
        const orders = await customersService.getCustomerOrders(customer.phone);
        setCustomerOrders(orders);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(val);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric"
        });
    };

    const exportCSV = () => {
        const headers = ["Name", "Phone", "Email", "City", "Orders Count", "Total Spent"];
        const rows = customers.map(c => [
            c.name, c.phone, c.email, c.city, c.ordersCount, c.totalSpent
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "customers.csv";
        link.click();
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const handleToggleBan = async (customer: Customer) => {
        const action = customer.is_banned ? "Unban" : "Ban";
        if (!confirm(`Are you sure you want to ${action} this customer?`)) return;

        const success = await customersService.toggleBanStatus(customer.id, customer.is_banned || false);

        if (success) {
            toast.success(`Customer ${action}ned successfully`);
            loadCustomers();
            if (selectedCustomer?.id === customer.id) {
                setSelectedCustomer({ ...customer, is_banned: !customer.is_banned });
            }
        } else {
            toast.error("Failed to update ban status");
        }
    };

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
                            Customers
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {customers.length} registered customers
                        </p>
                    </div>
                    <Button onClick={exportCSV} variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                >
                    <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 text-sm font-medium">Total Customers</span>
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Users className="h-5 w-5 text-indigo-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{customers.length}</p>
                    </div>

                    <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 text-sm font-medium">Total Spent</span>
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <ShoppingBag className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">
                            {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-500 text-sm font-medium">Avg. Spending</span>
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Users className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">
                            {formatCurrency(customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0)}
                        </p>
                    </div>
                </motion.div>

                {/* Search */}
                <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name, email, phone, or city..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Customers Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border shadow-sm overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-lg font-bold text-slate-800">Customer List</CardTitle>
                            <CardDescription>Sorted by total spending</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>City</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead>Total Spent</TableHead>
                                        <TableHead>Last Order</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCustomers.map((customer, index) => (
                                        <TableRow
                                            key={customer.id}
                                            className={`cursor-pointer transition-colors ${customer.is_banned ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}`}
                                            onClick={() => openCustomerDetails(customer)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${customer.is_banned ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{customer.name}</p>
                                                        <p className="text-xs text-slate-500">{customer.email || 'No Email'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{customer.phone}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-50">
                                                    {customer.city || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                                                    {customer.ordersCount} Orders
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-emerald-600">
                                                {formatCurrency(customer.totalSpent)}
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm">
                                                {formatDate(customer.lastOrderDate)}
                                            </TableCell>
                                            <TableCell>
                                                {customer.is_banned ? (
                                                    <Badge variant="destructive">Banned</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {filteredCustomers.length === 0 && (
                                <div className="text-center py-12 text-slate-500">
                                    No customers found matching your search.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Customer Details Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                    {selectedCustomer && (
                        <>
                            <SheetHeader className="pb-6 border-b">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${selectedCustomer.is_banned ? 'bg-red-100 text-red-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'}`}>
                                        {selectedCustomer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <SheetTitle className="text-2xl flex items-center gap-3">
                                            {selectedCustomer.name}
                                            {selectedCustomer.is_banned && <Badge variant="destructive">Banned</Badge>}
                                        </SheetTitle>
                                        <SheetDescription>Customer since {formatDate(selectedCustomer.lastOrderDate)}</SheetDescription>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        variant={selectedCustomer.is_banned ? "default" : "destructive"}
                                        className="w-full"
                                        onClick={() => handleToggleBan(selectedCustomer)}
                                    >
                                        {selectedCustomer.is_banned ? "Unban Customer" : "Ban Customer"}
                                    </Button>
                                </div>
                            </SheetHeader>

                            <div className="py-6 space-y-6">
                                {/* Contact Info */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-slate-800">Contact Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="w-4 h-4" />
                                            <span className="font-mono">{selectedCustomer.phone}</span>
                                        </div>
                                        {selectedCustomer.email && (
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Mail className="w-4 h-4" />
                                                <span>{selectedCustomer.email}</span>
                                            </div>
                                        )}
                                        {selectedCustomer.city && (
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <MapPin className="w-4 h-4" />
                                                <span>{selectedCustomer.city}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-emerald-700">{formatCurrency(selectedCustomer.totalSpent)}</p>
                                        <p className="text-xs text-emerald-600">Total Spent</p>
                                    </div>
                                    <div className="bg-indigo-50 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-indigo-700">{selectedCustomer.ordersCount}</p>
                                        <p className="text-xs text-indigo-600">Total Orders</p>
                                    </div>
                                </div>

                                {/* Orders History */}
                                <div>
                                    <h3 className="font-semibold text-slate-800 mb-3">Order History</h3>
                                    <div className="space-y-3">
                                        {customerOrders.map(order => (
                                            <div key={order.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs text-slate-500">#{String(order.id).slice(0, 8)}</span>
                                                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                                        {order.status === 'delivered' ? 'Delivered' :
                                                            order.status === 'shipped' ? 'Shipped' :
                                                                order.status === 'pending' ? 'Pending' : order.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-slate-600">{formatDate(order.created_at)}</span>
                                                    <span className="font-bold text-emerald-600">{formatCurrency(order.total_amount)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

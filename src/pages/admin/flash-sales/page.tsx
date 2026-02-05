import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { flashSalesService, FlashSale } from "@/services/flashSalesService";
import { Loader2, Plus, Trash2, Clock, Flame } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function FlashSalesPage() {
    const [sales, setSales] = useState<FlashSale[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        discount_percentage: 20,
        category: '',
        active: true
    });

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        setLoading(true);
        const data = await flashSalesService.getAllSales();
        setSales(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await flashSalesService.createSale(formData);

        if (success) {
            toast.success("Flash sale created successfully");
            setDialogOpen(false);
            loadSales();
            resetForm();
        } else {
            toast.error("Failed to create flash sale");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this sale?")) return;

        const success = await flashSalesService.deleteSale(id);

        if (success) {
            toast.success("Sale deleted");
            loadSales();
        } else {
            toast.error("Failed to delete sale");
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            starts_at: new Date().toISOString(),
            ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            discount_percentage: 20,
            category: '',
            active: true
        });
    };

    const isActive = (sale: FlashSale) => {
        const now = new Date();
        const start = new Date(sale.starts_at);
        const end = new Date(sale.ends_at);
        return sale.active && now >= start && now <= end;
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
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
                            <Flame className="w-10 h-10 text-orange-600" />
                            Flash Sales
                        </h1>
                        <p className="text-slate-500 mt-1">Manage limited-time offers</p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                New Sale
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create Flash Sale</DialogTitle>
                                <DialogDescription>Add a limited-time offer</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Sale Name *</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Discount Percentage % *</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.discount_percentage}
                                        onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Category (Optional)</Label>
                                    <Input
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Leave empty for sitewide sale"
                                    />
                                </div>

                                <Button type="submit" className="w-full">
                                    Create Sale
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </motion.div>

                {/* Sales List */}
                <div className="space-y-4">
                    {sales.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-slate-500">
                                <Flame className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                <p>No flash sales currently active</p>
                            </CardContent>
                        </Card>
                    ) : (
                        sales.map((sale) => (
                            <motion.div
                                key={sale.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-bold">{sale.name}</h3>
                                                    <Badge variant={isActive(sale) ? "default" : "secondary"}>
                                                        {isActive(sale) ? "Active" : "Inactive"}
                                                    </Badge>
                                                    <Badge className="bg-orange-500">
                                                        {sale.discount_percentage}% OFF
                                                    </Badge>
                                                </div>
                                                {sale.description && (
                                                    <p className="text-slate-600 mb-3">{sale.description}</p>
                                                )}
                                                <div className="flex gap-4 text-sm text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        Starts: {new Date(sale.starts_at).toLocaleString('en-US')}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        Ends: {new Date(sale.ends_at).toLocaleString('en-US')}
                                                    </div>
                                                </div>
                                                {sale.category && (
                                                    <p className="text-sm text-slate-500 mt-2">Category: {sale.category}</p>
                                                )}
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(sale.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

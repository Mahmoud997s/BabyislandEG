import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { rolesService, UserRole } from "@/services/rolesService";
import { Loader2, Shield, UserPlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RolesPage() {
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<UserRole | null>(null);

    const [formData, setFormData] = useState({
        role: 'viewer' as 'admin' | 'staff' | 'viewer',
        can_manage_products: false,
        can_manage_orders: false,
        can_manage_customers: false,
        can_manage_discounts: false,
        can_manage_settings: false,
        can_view_reports: false,
        can_manage_reviews: false,
    });

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        const data = await rolesService.getAllRoles();
        setRoles(data);
        setLoading(false);
    };

    const handleEdit = (role: UserRole) => {
        setEditingRole(role);
        setFormData({
            role: role.role,
            can_manage_products: role.can_manage_products,
            can_manage_orders: role.can_manage_orders,
            can_manage_customers: role.can_manage_customers,
            can_manage_discounts: role.can_manage_discounts,
            can_manage_settings: role.can_manage_settings,
            can_view_reports: role.can_view_reports,
            can_manage_reviews: role.can_manage_reviews,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!editingRole) return;

        const success = await rolesService.updateRole(editingRole.user_id, formData);

        if (success) {
            toast.success("Permissions updated successfully");
            setDialogOpen(false);
            setEditingRole(null);
            loadRoles();
            await rolesService.logActivity('update_role', 'user_role', editingRole.user_id);
        } else {
            toast.error("Update failed");
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user role?")) return;

        const success = await rolesService.deleteRole(userId);

        if (success) {
            toast.success("Role deleted successfully");
            loadRoles();
            await rolesService.logActivity('delete_role', 'user_role', userId);
        } else {
            toast.error("Deletion failed");
        }
    };

    const getRoleBadge = (role: string) => {
        const variants: Record<string, any> = {
            admin: { variant: "default", label: "Admin" },
            staff: { variant: "secondary", label: "Staff" },
            viewer: { variant: "outline", label: "Viewer" }
        };

        const config = variants[role] || variants.viewer;
        return <Badge variant={config.variant}>{config.label}</Badge>;
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
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Roles & Permissions
                        </h1>
                        <p className="text-slate-500 mt-1">Manage user access and roles</p>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border shadow-sm">
                        <CardContent className="pt-6">
                            <p className="text-sm font-medium text-slate-500">Admins</p>
                            <p className="text-3xl font-bold">{roles.filter(r => r.role === 'admin').length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardContent className="pt-6">
                            <p className="text-sm font-medium text-slate-500">Staff</p>
                            <p className="text-3xl font-bold">{roles.filter(r => r.role === 'staff').length}</p>
                        </CardContent>
                    </Card>
                    <Card className="border shadow-sm">
                        <CardContent className="pt-6">
                            <p className="text-sm font-medium text-slate-500">Viewers</p>
                            <p className="text-3xl font-bold">{roles.filter(r => r.role === 'viewer').length}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Roles List */}
                <Card className="border shadow-sm">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle>Users ({roles.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-slate-100 rounded-lg">
                                            <Shield className="w-6 h-6 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{role.user_id.substring(0, 8)}...</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {getRoleBadge(role.role)}
                                                {role.can_manage_products && <Badge variant="outline" className="text-xs">Products</Badge>}
                                                {role.can_manage_orders && <Badge variant="outline" className="text-xs">Orders</Badge>}
                                                {role.can_view_reports && <Badge variant="outline" className="text-xs">Reports</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(role)}
                                        >
                                            Edit
                                        </Button>
                                        {role.role !== 'admin' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(role.user_id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit Permissions</DialogTitle>
                            <DialogDescription>Customize user access levels</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={formData.role} onValueChange={(v: any) => setFormData({ ...formData, role: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <Label>Granular Permissions</Label>

                                {[
                                    { key: 'can_manage_products', label: 'Manage Products' },
                                    { key: 'can_manage_orders', label: 'Manage Orders' },
                                    { key: 'can_manage_customers', label: 'Manage Customers' },
                                    { key: 'can_manage_discounts', label: 'Manage Discounts' },
                                    { key: 'can_manage_reviews', label: 'Manage Reviews' },
                                    { key: 'can_view_reports', label: 'View Reports' },
                                    { key: 'can_manage_settings', label: 'Manage Settings' },
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-700">{label}</span>
                                        <Switch
                                            checked={formData[key as keyof typeof formData] as boolean}
                                            onCheckedChange={(checked) => setFormData({ ...formData, [key]: checked })}
                                            disabled={formData.role === 'admin'}
                                        />
                                    </div>
                                ))}
                            </div>

                            <Button onClick={handleSave} className="w-full">
                                Save Changes
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

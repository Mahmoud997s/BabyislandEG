"use client";


import { Checkbox } from "@/components/ui/checkbox";
import { toggleProductField, deleteProduct } from "@/actions/products";
import { Product } from "@/data/products";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown, Pencil, Trash, RefreshCw } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { LocaleLink } from "@/components/LocaleLink";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const columns: ColumnDef<Product>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected()
                        ? true
                        : table.getIsSomePageRowsSelected()
                            ? "indeterminate"
                            : false
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(value === true)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "images",
        header: "Image",
        cell: ({ row }) => {
            const images = row.getValue("images") as string[];
            const image = images && images.length > 0 ? images[0] : "/placeholder.png";
            return (
                <div className="w-12 h-12 rounded-lg overflow-hidden border bg-gray-50">
                    <img src={image} alt={row.getValue("name")} className="w-full h-full object-cover" />
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="font-medium max-w-[200px] truncate" title={row.getValue("name")}>{row.getValue("name")}</div>,
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.getValue("category")}</Badge>,
    },
    {
        accessorKey: "isBestSeller",
        header: "Best Seller",
        cell: ({ row }) => {
            const product = row.original;
            const [checked, setChecked] = useState(row.getValue("isBestSeller") as boolean);

            const handleToggle = async (val: boolean) => {
                // Optimistic Update
                setChecked(val);

                try {
                    await toggleProductField(product.id, "isBestSeller", val);
                    toast.success(val ? "Added to Best Sellers" : "Removed from Best Sellers");
                } catch (e: any) {
                    toast.error(e.message || "Failed to update status");
                    setChecked(!val);
                }
            };
            return (
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={checked}
                        onCheckedChange={handleToggle}
                        disabled={false} // Maybe add loading state
                    />
                </div>
            );
        }
    },
    {
        accessorKey: "isNew",
        header: "New Arrival",
        cell: ({ row }) => {
            const product = row.original;
            const [checked, setChecked] = useState(row.getValue("isNew") as boolean);

            const handleToggle = async (val: boolean) => {
                // Optimistic Update
                setChecked(val);

                try {
                    await toggleProductField(product.id, "isNew", val);
                    toast.success(val ? "Marked as New Arrival" : "Removed from New Arrivals");
                } catch (e: any) {
                    toast.error(e.message || "Failed to update status");
                    setChecked(!val);
                }
            };
            return (
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={checked}
                        onCheckedChange={handleToggle}
                    />
                </div>
            );
        }
    },

    {
        accessorKey: "stockQuantity",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Inventory
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const stock = Number(row.getValue("stockQuantity"));
            return (
                <div className={stock <= 2 ? "text-red-500 font-bold" : "text-gray-600"}>
                    {stock} in stock
                </div>
            );
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="justify-end w-full"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"));
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "EGP",
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "last_synced_at",
        header: "Sync",
        cell: ({ row }) => {
            const product = row.original;
            const [syncing, setSyncing] = useState(false);
            const [lastSynced, setLastSynced] = useState(product.last_synced_at);

            const handleSync = async () => {
                if (!product.source_url) {
                    toast.error("No source URL configured for this product");
                    return;
                }
                setSyncing(true);
                try {
                    const res = await fetch('/api/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ productId: product.id, forceUpdate: true }),
                    });
                    const data = await res.json();
                    if (data.success) {
                        toast.success(`Synced! ${data.priceUpdated ? 'Price updated.' : ''} ${data.stockUpdated ? 'Stock updated.' : ''}`);
                        setLastSynced(new Date().toISOString());
                    } else {
                        toast.error(data.error || "Sync failed");
                    }
                } catch (e: any) {
                    toast.error(e.message || "Sync failed");
                } finally {
                    setSyncing(false);
                }
            };

            const formatDate = (dateStr: string | null | undefined) => {
                if (!dateStr) return "Never";
                const d = new Date(dateStr);
                const now = new Date();
                const diff = now.getTime() - d.getTime();
                const hours = Math.floor(diff / (1000 * 60 * 60));
                if (hours < 1) return "Just now";
                if (hours < 24) return `${hours}h ago`;
                return `${Math.floor(hours / 24)}d ago`;
            };

            return (
                <div className="flex flex-col items-center gap-1" >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSync}
                        disabled={syncing || !product.source_url}
                        className="text-xs h-7"
                    >
                        {syncing ? "..." : "Sync"}
                    </Button>
                    <span className="text-[10px] text-gray-400">
                        {formatDate(lastSynced)}
                    </span>
                </div >
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;

            const handleDelete = async () => {
                if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                    try {
                        await deleteProduct(product.id);
                        toast.success("Product deleted");
                        // window.location.reload(); // Not needed if server action revalidates, but helpful for UI clear
                    } catch (e: any) {
                        toast.error(e.message || "Failed to delete");
                    }
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(product.id)}
                        >
                            Copy Product ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <LocaleLink href={`/admin/products/edit/${product.id}`}>
                            <DropdownMenuItem className="cursor-pointer gap-2">
                                <Pencil className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                        </LocaleLink>
                        <DropdownMenuItem
                            className="text-red-600 cursor-pointer gap-2"
                            onClick={handleDelete}
                        >
                            <Trash className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

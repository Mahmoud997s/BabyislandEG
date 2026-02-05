import { Product } from "@/data/products";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown, Pencil, Trash } from "lucide-react";
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
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const columns: ColumnDef<Product>[] = [
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
            const handleToggle = async (checked: boolean) => {
                const { error } = await supabase
                    .from('products')
                    .update({ isBestSeller: checked })
                    .eq('id', product.id);

                if (error) {
                    toast.error("Failed to update status");
                } else {
                    toast.success(checked ? "Added to Best Sellers" : "Removed from Best Sellers");
                    // Optionally refresh data - but ui updates optimistically if we manage state
                    // For now, simpler to just toast.
                    setTimeout(() => window.location.reload(), 500); // Quick refresh to see change
                }
            };
            return (
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={row.getValue("isBestSeller") as boolean}
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
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;

            const handleDelete = async () => {
                if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                    const { error } = await supabase.from('products').delete().eq('id', product.id);
                    if (error) {
                        toast.error(`Failed to delete: ${error.message}`);
                    } else {
                        toast.success("Product deleted");
                        window.location.reload();
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
                        <Link to={`/admin/products/edit/${product.id}`}>
                            <DropdownMenuItem className="cursor-pointer gap-2">
                                <Pencil className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                        </Link>
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

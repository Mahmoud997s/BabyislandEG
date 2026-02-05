import { useState } from "react";
import { MoreHorizontal, Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Order } from "./columns";
import { OrderDetails } from "./order-details";

interface OrderActionsProps {
    order: Order;
}

export function OrderActions({ order }: OrderActionsProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                        onClick={() => navigator.clipboard.writeText(order.id)}
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Order ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <SheetTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                    </SheetTrigger>
                </DropdownMenuContent>
            </DropdownMenu>

            <SheetContent className="sm:max-w-xl w-full">
                <OrderDetails order={order} />
            </SheetContent>
        </Sheet>
    );
}

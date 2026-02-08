"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const [isDeleting, setIsDeleting] = React.useState(false);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        initialState: {
            pagination: {
                pageSize: 50,
            },
        },
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
    });

    const handleDeleteSelected = async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows;
        if (selectedRows.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedRows.length} items?`)) {
            setIsDeleting(true);
            try {
                // Assuming TData has an 'id' property.
                const ids = selectedRows.map(row => (row.original as any).id);

                // Import Server Action dynamically or use check
                const { bulkDeleteProducts } = await import("@/actions/products");
                await bulkDeleteProducts(ids);

                // Force reload or update data
                window.location.reload();

            } catch (error: any) {
                alert("Error deleting items: " + error.message);
            } finally {
                setIsDeleting(false);
                setRowSelection({});
            }
        }
    };

    return (
        <div>
            <div className="flex items-center py-4 gap-4 flex-wrap">
                <Input
                    placeholder="Filter products..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />

                {/* Bulk Actions */}
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteSelected}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : `Delete ${table.getFilteredSelectedRowModel().rows.length} Selected`}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                const ids = table.getFilteredSelectedRowModel().rows.map(row => (row.original as any).id);
                                try {
                                    const res = await fetch('/api/sync/bulk', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ productIds: ids, forceUpdate: true }),
                                    });
                                    const data = await res.json();
                                    alert(`Synced ${data.success} of ${data.total} products`);
                                    window.location.reload();
                                } catch (e: any) {
                                    alert("Sync failed: " + e.message);
                                }
                            }}
                        >
                            Sync {table.getFilteredSelectedRowModel().rows.length} Selected
                        </Button>
                    </div>
                )}

                {table.getColumn("isBestSeller") && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant={table.getColumn("isBestSeller")?.getFilterValue() === true ? "secondary" : "outline"}
                            onClick={() => {
                                const column = table.getColumn("isBestSeller");
                                const isFiltered = column?.getFilterValue() === true;
                                column?.setFilterValue(isFiltered ? undefined : true);
                            }}
                            className="border-dashed h-8"
                        >
                            {table.getColumn("isBestSeller")?.getFilterValue() === true
                                ? "All"
                                : "Best Sellers"}
                        </Button>
                    </div>
                )}
                {table.getColumn("isNew") && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant={table.getColumn("isNew")?.getFilterValue() === true ? "secondary" : "outline"}
                            onClick={() => {
                                const column = table.getColumn("isNew");
                                const isFiltered = column?.getFilterValue() === true;
                                column?.setFilterValue(isFiltered ? undefined : true);
                            }}
                            className="border-dashed h-8"
                        >
                            {table.getColumn("isNew")?.getFilterValue() === true
                                ? "All"
                                : "New Arrivals"}
                        </Button>
                    </div>
                )}
            </div>
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between py-4">
                <div className="flex-1 text-sm text-muted-foreground hidden md:block">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

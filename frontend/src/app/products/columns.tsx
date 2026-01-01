"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product, BACKEND_URL } from "@/lib/api"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, Image as ImageIcon } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

function getImageUrl(url: string | null) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}${url}`;
}

export const columns: ColumnDef<Product>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Product" />
        ),
        cell: ({ row }) => {
            const product = row.original
            return (
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg border border-border/40 bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                        {product.imageUrl ? (
                            <img
                                src={getImageUrl(product.imageUrl) || ""}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[200px]" title={product.name}>
                            {product.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {product.sku}
                        </span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return <StatusBadge status={status || "DRAFT"} type="lifecycle" />
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "stockStatus",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Stock" />
        ),
        cell: ({ row }) => {
            const stockStatus = row.original.stockStatus
            return <StatusBadge status={stockStatus || "Out of Stock"} type="stock" />
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Quantity" />
        ),
        cell: ({ row }) => {
            return <div className="text-muted-foreground">{row.getValue("quantity")} units</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original

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
                            onClick={() => navigator.clipboard.writeText(product.sku)}
                        >
                            Copy SKU
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/products/edit?id=${product.id}`}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </DropdownMenuItem>
                        {/* Note: Delete action needs to be handled via a callback or context if we want to trigger the page dialog */}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

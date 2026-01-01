"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Category {
    id: number
    name: string
}

interface ProductsToolbarProps {
    // Search
    search: string
    onSearchChange: (value: string) => void
    // Category filter
    categories: Category[]
    categoryId: string
    onCategoryChange: (value: string) => void
    // Price filter
    priceMin: string
    priceMax: string
    onPriceMinChange: (value: string) => void
    onPriceMaxChange: (value: string) => void
    // Stock Status filter
    stockStatus: string
    onStockStatusChange: (value: string) => void
    // Reset
    onReset: () => void
    // Show reset button?
    hasFilters: boolean
}

export function ProductsToolbar({
    search,
    onSearchChange,
    categories,
    categoryId,
    onCategoryChange,
    priceMin,
    priceMax,
    onPriceMinChange,
    onPriceMaxChange,
    stockStatus,
    onStockStatusChange,
    onReset,
    hasFilters,
}: ProductsToolbarProps) {
    return (
        <div className="flex flex-1 flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 h-9"
                />
            </div>

            {/* Category Filter */}
            <Select value={categoryId} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Stock Status Filter */}
            <Select value={stockStatus} onValueChange={onStockStatusChange}>
                <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
            </Select>

            {/* Price Min */}
            <Input
                type="number"
                placeholder="Min $"
                value={priceMin}
                onChange={(e) => onPriceMinChange(e.target.value)}
                className="w-[100px] h-9"
            />

            {/* Price Max */}
            <Input
                type="number"
                placeholder="Max $"
                value={priceMax}
                onChange={(e) => onPriceMaxChange(e.target.value)}
                className="w-[100px] h-9"
            />

            {/* Reset Filters */}
            {hasFilters && (
                <Button
                    variant="ghost"
                    onClick={onReset}
                    className="h-9 px-2 lg:px-3"
                >
                    Reset
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    )
}


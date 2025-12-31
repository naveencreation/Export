"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getProducts, getCategories, deleteProduct, bulkDeleteProducts, BACKEND_URL, type Product, type Category } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
    Search,
    Filter,
    Plus,
    Pencil,
    Trash2,
    MoreHorizontal,
    Download,
    List,
    LayoutGrid,
    ChevronLeft,
    ChevronRight,
    Package,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

function getImageUrl(url: string | null) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}${url}`;
}

// Stock status calculation based on quantity
const getStockStatusStyles = (stockStatus: string) => {
    switch (stockStatus) {
        case "In Stock":
            return "border-green-500/20 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400";
        case "Low Stock":
            return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
        case "Out of Stock":
            return "border-red-500/20 bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400";
        default:
            return "border-slate-200 bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400";
    }
};

// Lifecycle status styling (DRAFT/ACTIVE/ARCHIVED)
const getStatusStyles = (status: string) => {
    switch (status) {
        case "ACTIVE":
            return "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
        case "DRAFT":
            return "border-purple-500/20 bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400";
        case "ARCHIVED":
            return "border-gray-500/20 bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400";
        default:
            return "border-slate-200 bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400";
    }
};

export default function ProductsPage() {
    const router = useRouter();
    const { toast } = useToast();

    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset to page 1 when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory]);

    // Metrics State
    const [metrics, setMetrics] = useState({
        totalProducts: 0,
        totalValue: 0,
        lowStock: 0,
        topCategory: "—",
    });

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [productsRes, categoriesData] = await Promise.all([
                getProducts({
                    page: currentPage,
                    limit: ITEMS_PER_PAGE,
                    search: debouncedSearch,
                    categoryId: selectedCategory !== "all" ? Number(selectedCategory) : undefined,
                }),
                getCategories(),
            ]);
            setProducts(productsRes.data);
            setTotalItems(productsRes.meta.total);
            setTotalPages(productsRes.meta.totalPages);
            setCategories(categoriesData);

            // Set global metrics from backend
            setMetrics({
                totalProducts: productsRes.meta.total,
                totalValue: productsRes.meta.inventoryValue,
                lowStock: productsRes.meta.lowStockCount,
                topCategory: productsRes.meta.topCategory,
            });
        } catch (err) {
            setError("Unable to load products. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, debouncedSearch, selectedCategory]);

    // Selection State
    const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

    // Toggle single product selection
    const toggleProductSelection = (id: number) => {
        const newSelected = new Set(selectedProductIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedProductIds(newSelected);
    };

    // Toggle all products on current page
    const toggleAllPageSelection = () => {
        const allPageIds = products.map((p) => p.id);
        const allSelected = allPageIds.every((id) => selectedProductIds.has(id));

        const newSelected = new Set(selectedProductIds);
        if (allSelected) {
            allPageIds.forEach((id) => newSelected.delete(id));
        } else {
            allPageIds.forEach((id) => newSelected.add(id));
        }
        setSelectedProductIds(newSelected);
    };

    // Single Delete State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const confirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await deleteProduct(productToDelete.id);
            toast({
                title: "Product deleted",
                description: `"${productToDelete.name}" has been successfully removed.`,
            });
            fetchData();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete product.",
            });
        } finally {
            setDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    };

    // Bulk Delete State
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

    const confirmBulkDelete = async () => {
        try {
            await bulkDeleteProducts(Array.from(selectedProductIds));
            toast({
                title: "Products deleted",
                description: `${selectedProductIds.size} products have been successfully removed.`,
            });
            setSelectedProductIds(new Set()); // Clear selection
            fetchData(); // Refresh list
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete selected products.",
            });
        } finally {
            setBulkDeleteDialogOpen(false);
        }
    };

    // Reset selection when page changes
    useEffect(() => {
        setSelectedProductIds(new Set());
    }, [currentPage, selectedCategory, debouncedSearch]);

    return (
        <div className="space-y-8">
            {/* Metrics Deck */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Total Products
                        </h3>
                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                    {metrics.totalProducts}
                                </div>
                                <p className="text-xs text-blue-600/80 dark:text-blue-300/80 mt-1">
                                    Active inventory items
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-100 dark:border-emerald-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                            Inventory Value
                        </h3>
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                    ${metrics.totalValue.toLocaleString()}
                                </div>
                                <p className="text-xs text-emerald-600/80 dark:text-emerald-300/80 mt-1">
                                    Total asset value
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                            Low Stock Alerts
                        </h3>
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-12" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                                    {metrics.lowStock}
                                </div>
                                <p className="text-xs text-amber-600/80 dark:text-amber-300/80 mt-1">
                                    Items below 10 units
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-100 dark:border-purple-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            Top Category
                        </h3>
                        <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 truncate">
                                    {metrics.topCategory}
                                </div>
                                <p className="text-xs text-purple-600/80 dark:text-purple-300/80 mt-1">
                                    Highest volume category
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Card */}
            <Card className="border-border/40 shadow-sm overflow-hidden bg-background/60 backdrop-blur-xl">
                <CardHeader className="border-b border-border/40 bg-muted/5 px-6 py-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Search & Filter Group */}
                        <div className="flex flex-1 items-center gap-3">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-colors"
                                    aria-label="Search products"
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-[180px] bg-background/50 border-border/50 focus:bg-background transition-colors" aria-label="Filter by category">
                                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Actions Group */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-border/50 rounded-md bg-background/50 p-1" role="group" aria-label="View mode">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8 rounded-sm", viewMode === "list" && "bg-muted shadow-sm")}
                                    onClick={() => setViewMode("list")}
                                    aria-label="List view"
                                    aria-pressed={viewMode === "list"}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("h-8 w-8 rounded-sm", viewMode === "grid" && "bg-muted shadow-sm")}
                                    onClick={() => setViewMode("grid")}
                                    aria-label="Grid view"
                                    aria-pressed={viewMode === "grid"}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button variant="outline" className="gap-2 bg-background/50 border-border/50 hover:bg-accent/50" aria-label="Export products to CSV">
                                <Download className="h-4 w-4" aria-hidden="true" />
                                Export
                            </Button>

                            <Button onClick={() => router.push("/products/edit")} className="gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-4 w-4" aria-hidden="true" />
                                Add Product
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-border/40">
                                <TableHead className="w-[50px] pl-6">
                                    <Checkbox
                                        checked={
                                            products.length > 0 &&
                                            products.every((p) => selectedProductIds.has(p.id))
                                        }
                                        onCheckedChange={toggleAllPageSelection}
                                        className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        aria-label="Select all products on this page"
                                    />
                                </TableHead>
                                <TableHead className="w-[400px]">Product</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-[400px] text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                                                <Package className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-lg">No products found</h3>
                                                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                                    We couldn't find any products matching your search. Try adjusting your filters.
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setSelectedCategory("all");
                                                }}
                                                className="mt-4"
                                            >
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => {
                                    const status = product.status || "DRAFT";
                                    const stockStatus = product.stockStatus || "Out of Stock";
                                    const isSelected = selectedProductIds.has(product.id);
                                    return (
                                        <TableRow
                                            key={product.id}
                                            className={cn(
                                                "group transition-colors border-border/40",
                                                isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/30"
                                            )}
                                            data-state={isSelected ? "selected" : undefined}
                                        >
                                            <TableCell className="pl-6">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleProductSelection(product.id)}
                                                    className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    aria-label={`Select ${product.name}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg border border-border/40 bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={getImageUrl(product.imageUrl) || ""}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            SKU: PROD-{product.id.toString().padStart(4, '0')} • {product.category?.name || "Uncategorized"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn("rounded-full px-3 py-0.5 font-medium border-0", getStatusStyles(status))}
                                                    aria-label={`Product status: ${status}`}
                                                >
                                                    {status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={cn("rounded-full px-3 py-0.5 font-medium border-0", getStockStatusStyles(stockStatus))}
                                                    aria-label={`Stock status: ${stockStatus}`}
                                                >
                                                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-60" aria-hidden="true" />
                                                    {stockStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-foreground">
                                                ${product.price.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {product.quantity} units
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/products/edit?id=${product.id}`)}
                                                        aria-label={`Edit ${product.name}`}
                                                        className="h-8 w-8"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label={`More actions for ${product.name}`}
                                                                className="h-8 w-8"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => router.push(`/products/edit?id=${product.id}`)}>
                                                                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" /> Edit Product
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                onClick={() => {
                                                                    setProductToDelete(product);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Delete Product
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* Footer / Pagination */}
                <div className="border-t border-border/40 bg-muted/5 px-6 py-4 flex items-center justify-between" role="navigation" aria-label="Pagination">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
                        <span className="font-medium text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of{" "}
                        <span className="font-medium text-foreground">{totalItems}</span> products
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0 bg-background/50"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0 bg-background/50"
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Floating Action Bar */}
            {selectedProductIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-foreground text-background rounded-full shadow-xl px-6 py-3 flex items-center gap-6 border border-border/20">
                        <span className="font-medium text-sm">
                            {selectedProductIds.size} selected
                        </span>
                        <div className="h-4 w-px bg-background/20" />
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedProductIds(new Set())}
                                className="h-8 hover:bg-background/20 hover:text-background text-background/80"
                                aria-label="Cancel selection"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setBulkDeleteDialogOpen(true)}
                                className="h-8 rounded-full px-4 shadow-sm"
                                aria-label={`Delete ${selectedProductIds.size} selected products`}
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Single Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            "{productToDelete?.name}" and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Dialog */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedProductIds.size} Products?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected {selectedProductIds.size} products and remove them from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-600 hover:bg-red-700">
                            Delete {selectedProductIds.size} Products
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getProducts, getCategories, deleteProduct, bulkDeleteProducts, exportProducts, type Product, type Category } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data-table";
import { ProductsToolbar } from "@/components/ui/products-toolbar";
import { getColumns } from "./columns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
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
import {
    Plus,
    Download,
    Package,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    Trash2,
    X,
} from "lucide-react";
import { PaginationState, RowSelectionState } from "@tanstack/react-table";

const DEFAULT_PAGE_SIZE = 10;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function ProductsPage() {
    const router = useRouter();
    const { toast } = useToast();

    // ---- State ----
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Pagination (server-side)
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
    });
    const [pageCount, setPageCount] = useState(0);

    // Filters (server-side)
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("all");
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");
    const [stockStatus, setStockStatus] = useState("all");

    // Debounced search
    const debouncedSearch = useDebounce(search, 300);

    // Metrics
    const [metrics, setMetrics] = useState({
        totalProducts: 0,
        totalValue: 0,
        lowStock: 0,
        topCategory: "—",
    });

    // ---- Delete State ----
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ---- Bulk Delete State ----
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // ---- Fetch Data ----
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsRes, categoriesData] = await Promise.all([
                getProducts({
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize,
                    search: debouncedSearch || undefined,
                    categoryId: categoryId !== "all" ? Number(categoryId) : undefined,
                    status: status,
                    priceMin: priceMin ? Number(priceMin) : undefined,
                    priceMax: priceMax ? Number(priceMax) : undefined,
                    stockStatus: stockStatus !== "all" ? stockStatus : undefined,
                }),
                getCategories(),
            ]);

            setProducts(productsRes.data);
            setPageCount(productsRes.meta.totalPages);
            setCategories(categoriesData);

            setMetrics({
                totalProducts: productsRes.meta.total,
                totalValue: productsRes.meta.inventoryValue,
                lowStock: productsRes.meta.lowStockCount,
                topCategory: productsRes.meta.topCategory,
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load products.",
            });
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, debouncedSearch, categoryId, status, priceMin, priceMax, stockStatus, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch, categoryId, status, priceMin, priceMax, stockStatus]);

    // ---- Handlers ----
    const handleExport = async () => {
        setExporting(true);
        try {
            await exportProducts();
            toast({ title: "Success", description: "Products exported to CSV." });
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Export failed." });
        } finally {
            setExporting(false);
        }
    };

    const handleTabChange = (value: string) => {
        // Reset stockStatus filter when tabs change (mutually exclusive)
        setStockStatus("all");
        if (value === "all") {
            setStatus(undefined);
        } else if (value === "outofstock") {
            setStatus(undefined);
            setStockStatus("out_of_stock");
        } else {
            setStatus(value.toUpperCase());
        }
    };

    const handleResetFilters = () => {
        setSearch("");
        setCategoryId("all");
        setPriceMin("");
        setPriceMax("");
        setStockStatus("all");
    };

    // Single Delete
    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;
        setDeleting(true);
        try {
            await deleteProduct(productToDelete.id);
            toast({ title: "Deleted", description: `"${productToDelete.name}" has been deleted.` });
            setDeleteDialogOpen(false);
            setProductToDelete(null);
            fetchData();
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete product." });
        } finally {
            setDeleting(false);
        }
    };

    // Bulk Delete
    const selectedProductIds = useMemo(() => {
        return Object.keys(rowSelection)
            .filter((key) => rowSelection[key])
            .map((key) => products[parseInt(key)]?.id)
            .filter(Boolean) as number[];
    }, [rowSelection, products]);

    const handleBulkDeleteClick = () => {
        setBulkDeleteDialogOpen(true);
    };

    const handleBulkDeleteConfirm = async () => {
        if (selectedProductIds.length === 0) return;
        setBulkDeleting(true);
        try {
            await bulkDeleteProducts(selectedProductIds);
            toast({ title: "Deleted", description: `${selectedProductIds.length} products deleted.` });
            setBulkDeleteDialogOpen(false);
            setRowSelection({});
            fetchData();
        } catch (err) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete products." });
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleClearSelection = () => {
        setRowSelection({});
    };

    const hasFilters = search !== "" || categoryId !== "all" || priceMin !== "" || priceMax !== "" || stockStatus !== "all";

    // ---- Columns with Delete Action ----
    const columns = useMemo(
        () => getColumns({ onDelete: handleDeleteClick }),
        []
    );

    // ---- Toolbar Component ----
    const toolbar = useMemo(
        () => (
            <ProductsToolbar
                search={search}
                onSearchChange={setSearch}
                categories={categories}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                priceMin={priceMin}
                priceMax={priceMax}
                onPriceMinChange={setPriceMin}
                onPriceMaxChange={setPriceMax}
                stockStatus={stockStatus}
                onStockStatusChange={setStockStatus}
                onReset={handleResetFilters}
                hasFilters={hasFilters}
            />
        ),
        [search, categories, categoryId, priceMin, priceMax, stockStatus, hasFilters]
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">
                        Manage your product catalog, inventory, and pricing.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport} disabled={exporting}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={() => router.push("/products/edit")} className="shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Metrics Deck */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Products"
                    value={loading ? "..." : metrics.totalProducts}
                    icon={Package}
                    description="Active inventory items"
                    className="bg-primary/5 border-primary/20"
                    titleClassName="text-primary"
                    iconClassName="text-primary"
                    valueClassName="text-primary"
                    descriptionClassName="text-primary/80"
                />
                <MetricCard
                    title="Inventory Value"
                    value={loading ? "..." : `$${metrics.totalValue.toLocaleString()}`}
                    icon={DollarSign}
                    description="Total asset value"
                    className="bg-success/5 border-success/20"
                    titleClassName="text-success"
                    iconClassName="text-success"
                    valueClassName="text-success"
                    descriptionClassName="text-success/80"
                />
                <MetricCard
                    title="Low Stock Alerts"
                    value={loading ? "..." : metrics.lowStock}
                    icon={AlertTriangle}
                    description="Items below 10 units"
                    className="bg-warning/5 border-warning/20"
                    titleClassName="text-warning"
                    iconClassName="text-warning"
                    valueClassName="text-warning"
                    descriptionClassName="text-warning/80"
                />
                <MetricCard
                    title="Top Category"
                    value={loading ? "..." : metrics.topCategory}
                    icon={TrendingUp}
                    description="Highest volume category"
                    className="bg-accent/10 border-accent/20"
                    titleClassName="text-accent-foreground"
                    iconClassName="text-accent-foreground"
                    valueClassName="text-accent-foreground truncate"
                    descriptionClassName="text-accent-foreground/80"
                />
            </div>

            {/* Main Content */}
            <Card className="border-border/40 shadow-sm bg-background/60 backdrop-blur-xl">
                <CardHeader className="p-0" />
                <CardContent className="p-6">
                    {/* Status Tabs */}
                    <Tabs defaultValue="all" onValueChange={handleTabChange} className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList>
                                <TabsTrigger value="all">All Products</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="draft">Draft</TabsTrigger>
                                <TabsTrigger value="archived">Archived</TabsTrigger>
                                <TabsTrigger value="outofstock">Out of Stock</TabsTrigger>
                            </TabsList>
                        </div>
                    </Tabs>

                    {/* DataTable */}
                    <DataTable
                        columns={columns}
                        data={products}
                        pageCount={pageCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        toolbar={toolbar}
                        loading={loading}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                    />
                </CardContent>
            </Card>

            {/* Floating Action Bar for Bulk Selection */}
            {selectedProductIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="flex items-center gap-3 bg-background border border-border rounded-lg shadow-lg px-4 py-3">
                        <span className="text-sm font-medium">
                            {selectedProductIds.length} selected
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDeleteClick}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                </div>
            )}

            {/* Single Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Dialog */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedProductIds.length} Products</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedProductIds.length} products? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDeleteConfirm}
                            disabled={bulkDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {bulkDeleting ? "Deleting..." : "Delete All"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

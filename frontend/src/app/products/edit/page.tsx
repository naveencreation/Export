"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
    createProduct,
    updateProduct,
    getProductById,
    getCategories,
    createCategory,
    uploadImage,
    Category,
    BACKEND_URL,
} from "@/lib/api";
import { ArrowLeft, Loader2, ImagePlus, X, Plus, Package, DollarSign, Truck, MoreVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be non-negative"),
    quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
    imageUrl: z.string().optional(),
    categoryId: z.coerce.number().positive("Category is required"),
    hsCode: z.string().optional(),
    originCountry: z.string().optional(),
    weight: z.coerce.number().min(0).optional(),
    length: z.coerce.number().min(0).optional(),
    width: z.coerce.number().min(0).optional(),
    height: z.coerce.number().min(0).optional(),
    material: z.string().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

function ProductEditContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get("id");
    const isEditMode = !!productId;
    const { toast } = useToast();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Category modal state
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creatingCategory, setCreatingCategory] = useState(false);

    // Unsaved changes guard
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            sku: "",
            description: "",
            price: 0,
            quantity: 0,
            imageUrl: "",
            categoryId: 0,
            hsCode: "",
            originCountry: "",
            weight: undefined,
            length: undefined,
            width: undefined,
            height: undefined,
            material: "",
            status: "DRAFT",
        },
    });

    useEffect(() => {
        const init = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats);

                if (isEditMode) {
                    const product = await getProductById(Number(productId));
                    form.reset({
                        name: product.name,
                        sku: product.sku,
                        description: product.description || "",
                        price: product.price,
                        quantity: product.quantity,
                        imageUrl: product.imageUrl || "",
                        categoryId: product.categoryId,
                        hsCode: product.hsCode || "",
                        originCountry: product.originCountry || "",
                        weight: product.weight ?? undefined,
                        length: product.length ?? undefined,
                        width: product.width ?? undefined,
                        height: product.height ?? undefined,
                        material: product.material || "",
                        status: (product.status as "DRAFT" | "ACTIVE" | "ARCHIVED") || "DRAFT",
                    });
                    if (product.imageUrl) {
                        const fullUrl = product.imageUrl.startsWith("http")
                            ? product.imageUrl
                            : `${BACKEND_URL}${product.imageUrl}`;
                        setImagePreview(fullUrl);
                    }
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load data.",
                });
            } finally {
                setInitialLoading(false);
            }
        };
        init();
    }, [isEditMode, productId, form, toast]);

    // Unsaved changes protection
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (form.formState.isDirty && !isSubmitting) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [form.formState.isDirty, isSubmitting]);

    const handleNavigation = (action: () => void) => {
        if (form.formState.isDirty && !isSubmitting) {
            setPendingAction(() => action);
            setShowUnsavedDialog(true);
        } else {
            action();
        }
    };

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true);
        setIsSubmitting(true);
        try {
            let imageUrl = data.imageUrl;

            if (imageFile) {
                setUploadingImage(true);
                const uploadResult = await uploadImage(imageFile);
                imageUrl = uploadResult.imageUrl;
                setUploadingImage(false);
            }

            const productData = { ...data, imageUrl };

            if (isEditMode) {
                await updateProduct(Number(productId), productData);
                toast({ title: "Success", description: "Product updated successfully." });
            } else {
                await createProduct(productData);
                toast({ title: "Success", description: "Product created successfully." });
            }
            router.push("/products");
        } catch (error) {
            setUploadingImage(false);
            setIsSubmitting(false);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save product.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        form.setValue("imageUrl", "", { shouldDirty: true });
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;

        setCreatingCategory(true);
        try {
            const newCategory = await createCategory(newCategoryName.trim());
            setCategories((prev) => [...prev, newCategory]);
            form.setValue("categoryId", newCategory.id, { shouldDirty: true });
            setCategoryModalOpen(false);
            setNewCategoryName("");
            toast({ title: "Success", description: `Category "${newCategory.name}" created.` });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create category.",
            });
        } finally {
            setCreatingCategory(false);
        }
    };

    const generateSku = () => {
        const name = form.getValues("name");
        const catId = form.getValues("categoryId");
        if (!name) return;

        const cat = categories.find(c => c.id === catId)?.name.substring(0, 3).toUpperCase() || "GEN";
        const namePart = name.substring(0, 3).toUpperCase();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");

        form.setValue("sku", `${cat}-${namePart}-${random}`, { shouldDirty: true });
    };

    const currentStatus = form.watch("status") || "DRAFT";

    if (initialLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Sticky Header */}
            <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-4 -mt-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => handleNavigation(() => router.push("/products"))}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold">
                            {isEditMode ? "Edit Product" : "Add Product"}
                        </h1>
                        <Badge variant={currentStatus === "ACTIVE" ? "default" : "secondary"} className="capitalize">
                            {currentStatus.toLowerCase()}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleNavigation(() => router.push("/products"))}
                        disabled={loading}
                    >
                        Discard
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            form.setValue("status", "DRAFT");
                            form.handleSubmit(onSubmit)();
                        }}
                        disabled={loading}
                    >
                        Save Draft
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            form.setValue("status", "ACTIVE");
                            form.handleSubmit(onSubmit)();
                        }}
                        disabled={loading}
                        className="shadow-lg shadow-primary/20"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Publish
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content - 2 columns */}
                        <div className="lg:col-span-2 space-y-6">
                            <Tabs defaultValue="general" className="w-full">
                                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                                    <TabsTrigger
                                        value="general"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        General
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="media"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                    >
                                        <ImagePlus className="h-4 w-4 mr-2" />
                                        Media
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="shipping"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                                    >
                                        <Truck className="h-4 w-4 mr-2" />
                                        Shipping
                                    </TabsTrigger>
                                </TabsList>

                                {/* General Tab */}
                                <TabsContent value="general" className="mt-6 space-y-6">
                                    <Card className="border-0 shadow-sm">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base">Product Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Premium Cotton T-Shirt" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="sku"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>SKU</FormLabel>
                                                            <div className="flex gap-2">
                                                                <FormControl>
                                                                    <Input placeholder="CLO-TSH-001" {...field} />
                                                                </FormControl>
                                                                <Button type="button" variant="outline" size="sm" onClick={generateSku}>
                                                                    Generate
                                                                </Button>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="material"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Material</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="100% Cotton" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description (Optional)</FormLabel>
                                                        <FormControl>
                                                            <textarea
                                                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                                placeholder="A detailed description of the product..."
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription>
                                                            Set a description to the product for better visibility.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-sm">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base">Export Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="hsCode"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>HS Code</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="6109.10" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="originCountry"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Country of Origin</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="India" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Media Tab */}
                                <TabsContent value="media" className="mt-6 space-y-6">
                                    <Card className="border-0 shadow-sm">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base">Product Images</CardTitle>
                                            <CardDescription>Upload images for your product. PNG or JPG (max. 5MB)</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Main Upload Zone - Full Width */}
                                            {!imagePreview ? (
                                                <label className="cursor-pointer block">
                                                    <div className="relative rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all duration-200 py-12 px-6">
                                                        <div className="flex flex-col items-center justify-center gap-4">
                                                            <div className="rounded-full bg-primary/10 p-4">
                                                                <ImagePlus className="h-8 w-8 text-primary" />
                                                            </div>
                                                            <div className="text-center space-y-1">
                                                                <p className="text-sm font-medium">
                                                                    Drag & drop your images here, or{" "}
                                                                    <span className="text-primary underline underline-offset-2">browse</span>
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    PNG, JPG up to 5MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                                        onChange={handleFileChange}
                                                        className="sr-only"
                                                    />
                                                </label>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* Image Gallery Grid */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                        {/* Uploaded Image */}
                                                        <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted/30 group">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="h-full w-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={clearImage}
                                                                    className="h-8 w-8 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                            <div className="absolute bottom-2 left-2">
                                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Primary</Badge>
                                                            </div>
                                                        </div>

                                                        {/* Add More Images */}
                                                        <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all">
                                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                                <Plus className="h-6 w-6" />
                                                                <span className="text-xs">Add More</span>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                                onChange={handleFileChange}
                                                                className="sr-only"
                                                            />
                                                        </label>
                                                    </div>

                                                    <p className="text-xs text-muted-foreground">
                                                        Click to replace • Max file size 5MB
                                                    </p>
                                                </div>
                                            )}

                                            {uploadingImage && (
                                                <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Uploading image...
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Shipping Tab */}
                                <TabsContent value="shipping" className="mt-6 space-y-6">
                                    <Card className="border-0 shadow-sm">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-base">Shipping & Logistics</CardTitle>
                                            <CardDescription>Physical dimensions for freight calculation.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="weight"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Weight (kg)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="length"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Length (cm)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="width"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Width (cm)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="height"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Height (cm)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar - 1 column */}
                        <div className="space-y-6">
                            {/* Pricing Card */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Pricing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Base Price</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                                        <Input type="number" step="0.01" className="pl-7" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stock Quantity</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Status Card */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base">Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="DRAFT">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                                Draft
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="ACTIVE">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                                Active
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="ARCHIVED">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full bg-gray-500" />
                                                                Archived
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>Set the product status.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Categories Card */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base">Categories</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex gap-2">
                                                    <Select
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={field.value ? field.value.toString() : ""}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="flex-1">
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categories.map((category) => (
                                                                <SelectItem
                                                                    key={category.id}
                                                                    value={category.id.toString()}
                                                                >
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setCategoryModalOpen(true)}
                                                        title="Create New Category"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>

            {/* Unsaved Changes Dialog */}
            <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (pendingAction) pendingAction();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create Category Modal */}
            <AlertDialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Create New Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Enter a name for the new category. It will be automatically selected after creation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="e.g. Electronics, Clothing, Home Decor"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleCreateCategory();
                                }
                            }}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setNewCategoryName("")}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCreateCategory}
                            disabled={!newCategoryName.trim() || creatingCategory}
                        >
                            {creatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function ProductEditPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductEditContent />
        </Suspense>
    );
}

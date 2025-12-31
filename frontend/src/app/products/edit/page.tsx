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
import { ArrowLeft, Loader2, Box, Globe, Truck, ImagePlus, X, Plus } from "lucide-react";
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
                        weight: product.weight || 0,
                        length: product.length || 0,
                        width: product.width || 0,
                        height: product.height || 0,
                        material: product.material || "",
                        status: (product.status as any) || "DRAFT",
                    });
                    if (product.imageUrl) {
                        setImagePreview(`${BACKEND_URL}${product.imageUrl}`);
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


    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const { isDirty } = form.formState;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasUnsavedChanges = (isDirty || !!imageFile) && !isSubmitting;

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleNavigation = (action: () => void) => {
        if (hasUnsavedChanges) {
            const confirmLeave = window.confirm(
                "You have unsaved changes. Are you sure you want to leave?"
            );
            if (!confirmLeave) return;
        }
        action();
    };

    const onSubmit = async (data: ProductFormValues) => {
        setLoading(true);
        setIsSubmitting(true);
        try {
            let finalImageUrl = data.imageUrl;

            if (imageFile) {
                setUploadingImage(true);
                const uploadResult = await uploadImage(imageFile);
                finalImageUrl = uploadResult.imageUrl;
                setUploadingImage(false);
            }

            const productData = { ...data, imageUrl: finalImageUrl };

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

    if (initialLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => handleNavigation(() => router.back())}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditMode ? "Edit Product" : "New Product"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditMode
                            ? "Update product details and export information."
                            : "Add a new product to your export catalog."}
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Basic Information */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Box className="h-5 w-5 text-primary" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>Core product details for inventory.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Premium Cotton Shirt" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
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
                                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <div className="flex gap-2">
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value ? field.value.toString() : ""}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="flex-1">
                                                            <SelectValue placeholder="Select category" />
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

                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SKU</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input placeholder="e.g. CLO-SHI-001" {...field} />
                                                </FormControl>
                                                <Button type="button" variant="outline" onClick={generateSku}>
                                                    Generate
                                                </Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price (USD)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
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

                                {/* Image Upload */}
                                <div className="sm:col-span-2">
                                    <FormLabel>Product Image</FormLabel>
                                    <div className="mt-2 flex items-start gap-4">
                                        {/* Preview / Dropzone */}
                                        <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/30">
                                            {imagePreview ? (
                                                <>
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={clearImage}
                                                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center gap-1 text-muted-foreground">
                                                    <ImagePlus className="h-8 w-8" />
                                                    <span className="text-xs">Upload</span>
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                                        onChange={handleFileChange}
                                                        className="sr-only"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm text-muted-foreground">
                                                Upload a product image. Accepted formats: JPEG, PNG, GIF, WebP. Max 5MB.
                                            </p>
                                            {!imagePreview && (
                                                <label className="inline-flex">
                                                    <Button type="button" variant="outline" size="sm" asChild>
                                                        <span>
                                                            <ImagePlus className="h-4 w-4 mr-2" />
                                                            Choose File
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                                onChange={handleFileChange}
                                                                className="sr-only"
                                                            />
                                                        </span>
                                                    </Button>
                                                </label>
                                            )}
                                            {uploadingImage && (
                                                <p className="text-sm text-primary flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Uploading image...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Export Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-blue-600" />
                                    Export Details
                                </CardTitle>
                                <CardDescription>Required for customs and compliance.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="hsCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>HS Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 6109.10" {...field} />
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
                                                <Input placeholder="e.g. India" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="material"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Material Composition</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 100% Cotton" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Shipping & Logistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-orange-600" />
                                    Shipping & Logistics
                                </CardTitle>
                                <CardDescription>Physical dimensions for freight.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (kg)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <FormField
                                        control={form.control}
                                        name="length"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Length (cm)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" {...field} />
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
                                                    <Input type="number" step="0.1" {...field} />
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
                                                    <Input type="number" step="0.1" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleNavigation(() => router.back())}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Create Product"}
                        </Button>
                    </div>
                </form>
            </Form>

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

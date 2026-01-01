export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export interface DashboardStats {
    totalProducts: number;
    totalCategories: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalInventoryValue: number;
    recentProducts: Product[];
    topCategories: { name: string; value: number }[];
}

export interface Category {
    id: number;
    name: string;
    createdAt: string;
    _count?: { products: number };
}

export interface Product {
    id: number;
    name: string;
    description: string | null;
    price: number;
    quantity: number;
    imageUrl: string | null;
    categoryId: number;
    category: Category;
    createdAt: string;
    updatedAt: string;
    status?: string;
    stockStatus?: string;
    sku: string;
    hsCode: string | null;
    originCountry: string | null;
    weight: number | null;
    length: number | null;
    width: number | null;
    height: number | null;
    material: string | null;
}

export interface CreateProductData {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    categoryId: number;
    sku: string;
    hsCode?: string;
    originCountry?: string;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    material?: string;
    status?: string;
}

// Dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
}

// Categories
export async function getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

export async function createCategory(name: string): Promise<Category> {
    const res = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return res.json();
}

// Products
export interface ProductsResponse {
    data: Product[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        inventoryValue: number;
        lowStockCount: number;
        topCategory: string;
    };
}

export async function getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    status?: string;
    priceMin?: number;
    priceMax?: number;
    stockStatus?: string;
}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.categoryId) searchParams.set("categoryId", params.categoryId.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.priceMin !== undefined) searchParams.set("priceMin", params.priceMin.toString());
    if (params?.priceMax !== undefined) searchParams.set("priceMax", params.priceMax.toString());
    if (params?.stockStatus) searchParams.set("stockStatus", params.stockStatus);

    const res = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
}

export async function getProductById(id: number): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    return res.json();
}

export async function createProduct(data: CreateProductData): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
}

export async function updateProduct(
    id: number,
    data: Partial<CreateProductData>
): Promise<Product> {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete product");
}

export const bulkDeleteProducts = async (ids: number[]) => {
    const response = await fetch(`${API_BASE_URL}/products/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error("Failed to delete products");
    return response.json();
};

// Image Upload
export async function uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload image");
    return res.json();
}

// Export Products
export async function exportProducts(): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/products/export`);
    if (!res.ok) throw new Error("Failed to export products");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

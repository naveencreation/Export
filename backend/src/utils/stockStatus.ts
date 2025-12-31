/**
 * Calculate stock status based on quantity
 * Centralized logic to avoid duplication across services and frontend
 * 
 * @param quantity - Current product quantity
 * @returns Stock status string: "In Stock" | "Low Stock" | "Out of Stock"
 */
export function calculateStockStatus(quantity: number): string {
    if (quantity > 10) {
        return 'In Stock';
    } else if (quantity > 0) {
        return 'Low Stock';
    } else {
        return 'Out of Stock';
    }
}

"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
    "/": "Overview",
    "/products": "Products",
    "/products/edit": "Add / Edit Products",
};

export function Topbar() {
    const pathname = usePathname();
    const title = pageTitles[pathname] || "Dashboard";

    return (
        <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-border bg-card">
            <div className="flex h-full items-center px-6">
                <h1 className="text-xl font-semibold text-card-foreground">{title}</h1>
            </div>
        </header>
    );
}

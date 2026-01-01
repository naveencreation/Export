"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/products", label: "Products", icon: Package },
    { href: "/products/edit", label: "Add Product", icon: PlusSquare },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-primary">
            {/* Logo Section */}
            <div className="flex h-16 items-center border-b border-primary-foreground/10 px-6">
                <Image
                    src="/logo.jpg"
                    alt="NS Exports"
                    width={40}
                    height={40}
                    className="rounded"
                />
                <span className="ml-3 text-lg font-semibold text-primary-foreground">
                    NS Exports
                </span>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-3">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary-foreground/10 text-primary-foreground font-semibold"
                                            : "text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}

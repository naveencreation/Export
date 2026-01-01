"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getDashboardStats, DashboardStats } from "@/lib/api";
import {
    Package,
    FolderOpen,
    CheckCircle,
    AlertTriangle,
    XCircle,
    RefreshCw,
    TrendingUp,
    DollarSign,
    ArrowRight,
    Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import Link from "next/link";
import { MetricCard } from "@/components/ui/metric-card";
import { cn } from "@/lib/utils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function OverviewPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (err) {
            setError("Unable to load dashboard stats. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <XCircle className="h-12 w-12 text-destructive" />
                <p className="text-muted-foreground text-center">{error}</p>
                <Button onClick={fetchStats} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    // Prepare chart data
    const inventoryStatusData = [
        { name: "In Stock", value: stats?.inStock || 0, color: "#16a34a" },
        { name: "Low Stock", value: stats?.lowStock || 0, color: "#d97706" },
        { name: "Out of Stock", value: stats?.outOfStock || 0, color: "#dc2626" },
    ].filter((d) => d.value > 0);

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Real-time overview of your inventory health.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={fetchStats} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Link href="/products/edit">
                        <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
                            <Package className="h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards Section */}
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div variants={item}>
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="pb-2">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-4xl font-bold tracking-tight">${stats?.totalInventoryValue.toLocaleString()}</p>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                    <TrendingUp className="h-3 w-3" />
                                    +12%
                                </span>
                                <span className="text-xs text-muted-foreground">from last month</span>
                            </div>
                        </CardContent>
                        <div className="absolute right-4 top-4">
                            <div className="rounded-full bg-emerald-500/10 p-2">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="pb-2">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Products</p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-4xl font-bold tracking-tight">{stats?.totalProducts || 0}</p>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-600">
                                    <TrendingUp className="h-3 w-3" />
                                    +5
                                </span>
                                <span className="text-xs text-muted-foreground">new this week</span>
                            </div>
                        </CardContent>
                        <div className="absolute right-4 top-4">
                            <div className="rounded-full bg-blue-500/10 p-2">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="pb-2">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Low Stock Alerts</p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-4xl font-bold tracking-tight">{stats?.lowStock || 0}</p>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    Attention
                                </span>
                                <span className="text-xs text-muted-foreground">requires review</span>
                            </div>
                        </CardContent>
                        <div className="absolute right-4 top-4">
                            <div className="rounded-full bg-amber-500/10 p-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <CardHeader className="pb-2">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Categories</p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-4xl font-bold tracking-tight">{stats?.totalCategories || 0}</p>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-600">
                                    <CheckCircle className="h-3 w-3" />
                                    Active
                                </span>
                                <span className="text-xs text-muted-foreground">product categories</span>
                            </div>
                        </CardContent>
                        <div className="absolute right-4 top-4">
                            <div className="rounded-full bg-violet-500/10 p-2">
                                <FolderOpen className="h-5 w-5 text-violet-600" />
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                <motion.div variants={item} className="lg:col-span-4">
                    <Card className="h-full border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Top Categories</CardTitle>
                            <CardDescription>
                                Distribution of products across your top 5 categories.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.topCategories} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="name"
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="hsl(var(--muted-foreground))"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                borderColor: "hsl(var(--border))",
                                                borderRadius: "var(--radius)",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="url(#barGradient)"
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item} className="lg:col-span-3">
                    <Card className="h-full border-0 shadow-sm flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">Inventory Status</CardTitle>
                            <CardDescription>Stock distribution overview</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                            <div className="relative h-[250px] w-full flex-1 min-h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={inventoryStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={110}
                                            paddingAngle={2}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {inventoryStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                borderColor: "hsl(var(--border))",
                                                borderRadius: "var(--radius)",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Label */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-5xl font-bold tracking-tighter">
                                            {stats?.totalProducts ? Math.round(((stats.inStock || 0) / stats.totalProducts) * 100) : 0}%
                                        </p>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">In Stock</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Stats */}
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-medium text-muted-foreground">In Stock</p>
                                        <p className="text-base font-bold">{stats?.inStock || 0}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-medium text-muted-foreground">Low Stock</p>
                                        <p className="text-base font-bold">{stats?.lowStock || 0}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                        <XCircle className="h-4 w-4" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-medium text-muted-foreground">Out of Stock</p>
                                        <p className="text-base font-bold">{stats?.outOfStock || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </section>

            {/* Recent Activity Section */}
            <section>
                <motion.div variants={item}>
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                                <CardDescription>
                                    Latest products added to the catalog.
                                </CardDescription>
                            </div>
                            <Link href="/products">
                                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                                    View All
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {stats?.recentProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                                            index !== (stats?.recentProducts.length || 0) - 1 && "border-b border-border/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 shrink-0">
                                                <Package className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-medium leading-none">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.category?.name} • Added recently
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold">
                                            ${product.price.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </section>
        </motion.div>
    );
}



function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-9 w-24" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-32 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
                <div className="col-span-4">
                    <Skeleton className="h-[400px] w-full rounded-lg" />
                </div>
                <div className="col-span-3 space-y-4">
                    <Skeleton className="h-[200px] w-full rounded-lg" />
                    <Skeleton className="h-[180px] w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
}

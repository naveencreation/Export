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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Real-time overview of your inventory health.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={fetchStats} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Link href="/products/add">
                        <Button size="sm">
                            <Package className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Hero Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats?.totalInventoryValue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="+12% from last month"
                    trendUp={true}
                    className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background"
                />
                <StatsCard
                    title="Total Products"
                    value={stats?.totalProducts.toString() || "0"}
                    icon={Package}
                    trend="+5 new this week"
                    trendUp={true}
                />
                <StatsCard
                    title="Low Stock Alerts"
                    value={stats?.lowStock.toString() || "0"}
                    icon={AlertTriangle}
                    trend="Requires attention"
                    trendUp={false}
                    iconColor="text-amber-600"
                />
                <StatsCard
                    title="Categories"
                    value={stats?.totalCategories.toString() || "0"}
                    icon={FolderOpen}
                    trend="Active categories"
                    trendUp={true}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Charts Section */}
                <motion.div variants={item} className="col-span-4">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Top Categories</CardTitle>
                            <CardDescription>
                                Distribution of products across your top 5 categories.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.topCategories}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "transparent" }}
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                borderColor: "hsl(var(--border))",
                                                borderRadius: "var(--radius)",
                                            }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Inventory Status & Recent Activity */}
                <div className="col-span-3 space-y-4">
                    <motion.div variants={item}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={inventoryStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {inventoryStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-4 text-sm">
                                    {inventoryStatusData.map((item) => (
                                        <div key={item.name} className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-muted-foreground">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Latest products added to the catalog.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats?.recentProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                                    <Package className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {product.category?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium">
                                                ${product.price}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    className,
    iconColor,
}: {
    title: string;
    value: string;
    icon: any;
    trend: string;
    trendUp: boolean;
    className?: string;
    iconColor?: string;
}) {
    return (
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            <Card className={cn("overflow-hidden", className)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <Icon className={cn("h-4 w-4 text-muted-foreground", iconColor)} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                        {trendUp ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                            <Activity className="mr-1 h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={trendUp ? "text-green-500" : "text-muted-foreground"}>
                            {trend}
                        </span>
                    </p>
                </CardContent>
            </Card>
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
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
                <div className="col-span-3 space-y-4">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                    <Skeleton className="h-[180px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

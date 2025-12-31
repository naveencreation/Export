import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { TrendingUp, Activity } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    className?: string;
    iconClassName?: string;
    valueClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    iconClassName,
    valueClassName,
    titleClassName,
    descriptionClassName,
}: MetricCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn("text-sm font-medium", titleClassName || "text-muted-foreground")}>
                    {title}
                </CardTitle>
                <Icon className={cn("h-4 w-4", iconClassName || "text-muted-foreground")} />
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
                {description && (
                    <p className={cn("text-xs mt-1", descriptionClassName || "text-muted-foreground")}>
                        {description}
                    </p>
                )}
                {trend && (
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                        {trend.isPositive ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                            <Activity className="mr-1 h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={trend.isPositive ? "text-green-500" : "text-muted-foreground"}>
                            {trend.value}
                        </span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

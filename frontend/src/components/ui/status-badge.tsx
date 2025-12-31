import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatusBadgeProps {
    status: string;
    type: "lifecycle" | "stock";
    className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
    const getStyles = () => {
        if (type === "stock") {
            switch (status) {
                case "In Stock":
                    return "border-success/20 bg-success/10 text-success";
                case "Low Stock":
                    return "border-warning/20 bg-warning/10 text-warning";
                case "Out of Stock":
                    return "border-destructive/20 bg-destructive/10 text-destructive";
                default:
                    return "border-muted bg-muted/50 text-muted-foreground";
            }
        } else {
            switch (status) {
                case "ACTIVE":
                    return "border-primary/20 bg-primary/10 text-primary";
                case "DRAFT":
                    return "border-accent/20 bg-accent/10 text-accent-foreground";
                case "ARCHIVED":
                    return "border-muted bg-muted/50 text-muted-foreground";
                default:
                    return "border-muted bg-muted/50 text-muted-foreground";
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="inline-flex"
        >
            <Badge
                variant="outline"
                className={cn("rounded-full px-3 py-0.5 font-medium border-0", getStyles(), className)}
            >
                {type === "stock" && (
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-60" aria-hidden="true" />
                )}
                {status}
            </Badge>
        </motion.div>
    );
}

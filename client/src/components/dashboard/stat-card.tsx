import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "secondary" | "warning" | "danger" | "success" | "info";
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  // Mapeando cores para classes do Tailwind
  const colorClasses = {
    primary: {
      border: "border-primary",
      iconBg: "bg-primary-light/10",
      iconText: "text-primary"
    },
    secondary: {
      border: "border-secondary",
      iconBg: "bg-secondary-light/10",
      iconText: "text-secondary"
    },
    warning: {
      border: "border-warning",
      iconBg: "bg-warning/10",
      iconText: "text-warning"
    },
    danger: {
      border: "border-destructive",
      iconBg: "bg-destructive/10",
      iconText: "text-destructive"
    },
    success: {
      border: "border-success",
      iconBg: "bg-success/10",
      iconText: "text-success"
    },
    info: {
      border: "border-info",
      iconBg: "bg-info/10",
      iconText: "text-info"
    }
  };

  const currentColor = colorClasses[color];
  
  return (
    <div className={cn(
      "bg-white rounded-lg shadow p-5 border-l-4",
      currentColor.border
    )}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-neutral-dark font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs flex items-center mt-1",
              trend.positive ? "text-success" : "text-destructive"
            )}>
              <i className={cn(
                "fas mr-1",
                trend.positive ? "fa-arrow-up" : "fa-arrow-down"
              )}></i> 
              {trend.value}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-full",
          currentColor.iconBg
        )}>
          <i className={cn(
            "fas",
            icon,
            "text-xl",
            currentColor.iconText
          )}></i>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Map status to style
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'novo':
        return 'bg-primary/20 text-primary';
      case 'em preparo':
      case 'pendente':
        return 'bg-warning/20 text-warning';
      case 'pago':
        return 'bg-info/20 text-info';
      case 'entregue':
      case 'completo':
      case 'finalizado':
        return 'bg-success/20 text-success';
      case 'cancelado':
        return 'bg-destructive/20 text-destructive';
      case 'livre':
        return 'bg-success/20 text-success';
      case 'ocupada':
        return 'bg-destructive/20 text-destructive';
      case 'reservada':
        return 'bg-primary/20 text-primary';
      case 'limpeza':
        return 'bg-info/20 text-info';
      case 'aberto':
        return 'bg-success text-white';
      case 'fechado':
        return 'bg-destructive text-white';
      default:
        return 'bg-neutral-medium/20 text-neutral-dark';
    }
  };

  return (
    <span className={cn(
      "px-2 py-1 rounded-full text-xs font-medium",
      getStatusStyle(status),
      className
    )}>
      {status}
    </span>
  );
}

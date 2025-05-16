import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getStatusColor(status: string): {
  bg: string,
  text: string
} {
  switch (status.toLowerCase()) {
    case 'novo':
      return { bg: 'bg-primary/20', text: 'text-primary' };
    case 'em preparo':
    case 'pendente':
      return { bg: 'bg-warning/20', text: 'text-warning' };
    case 'pago':
    case 'finalizado':
      return { bg: 'bg-info/20', text: 'text-info' };
    case 'entregue':
    case 'completo':
      return { bg: 'bg-success/20', text: 'text-success' };
    case 'cancelado':
      return { bg: 'bg-destructive/20', text: 'text-destructive' };
    default:
      return { bg: 'bg-neutral-medium/20', text: 'text-neutral-dark' };
  }
}

export function calculateTotal(items: Array<{ preco: number, quantidade: number }>): number {
  return items.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

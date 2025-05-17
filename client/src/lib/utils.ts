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
  bgColor: string,
  textColor: string
} {
  switch (status.toLowerCase()) {
    case 'novo':
      return { bgColor: 'bg-primary/20', textColor: 'text-primary' };
    case 'em preparo':
    case 'pendente':
      return { bgColor: 'bg-amber-100', textColor: 'text-amber-800' };
    case 'pago':
    case 'finalizado':
      return { bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
    case 'entregue':
    case 'completo':
      return { bgColor: 'bg-green-100', textColor: 'text-green-800' };
    case 'cancelado':
      return { bgColor: 'bg-red-100', textColor: 'text-red-800' };
    default:
      return { bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
  }
}

export function calculateTotal(items: Array<{ preco: number, quantidade: number }>): number {
  return items.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

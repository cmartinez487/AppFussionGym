export function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatDate(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value: string): string {
  const d = new Date(value);
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

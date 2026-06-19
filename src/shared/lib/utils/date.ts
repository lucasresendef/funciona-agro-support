export function formatDatePtBr(value: string): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

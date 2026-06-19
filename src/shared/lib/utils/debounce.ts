export function debounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, wait = 300) {
  let timeout: number | undefined;
  return (...args: TArgs) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), wait);
  };
}

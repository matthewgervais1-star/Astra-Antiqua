// Specimen stub for next/navigation. The culture a component sees comes from
// SPECIMEN_QUERY (e.g. "culture=egypt"), which is how useActivePantheon reads
// it when no route culture is in context.
export function usePathname(): string {
  return process.env.SPECIMEN_PATH ?? "/";
}
export function useSearchParams(): URLSearchParams {
  return new URLSearchParams(process.env.SPECIMEN_QUERY ?? "");
}
export function useRouter() {
  const noop = () => {};
  return { push: noop, replace: noop, back: noop, forward: noop, refresh: noop, prefetch: async () => {} };
}
export function useParams(): Record<string, string> {
  return {};
}
export function notFound(): never {
  throw new Error("notFound() during specimen render");
}
export function redirect(url: string): never {
  throw new Error(`redirect(${url}) during specimen render`);
}

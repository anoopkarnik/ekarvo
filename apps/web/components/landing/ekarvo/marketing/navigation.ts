/** Source-site paths resolve under the app's public marketing route group. */
export function marketingHref(path: string): string {
  if (path === "/landing" || path.startsWith("/landing/")) return path;
  if (path === "/") return "/landing";
  return `/landing${path.startsWith("/") ? path : `/${path}`}`;
}

export const MARKETING_NAV = [
  ["Products", marketingHref("/products")],
  ["Approach", marketingHref("/approach")],
  ["Platform", marketingHref("/platform")],
  ["Trust", marketingHref("/trust")],
  ["Company", marketingHref("/company")],
] as const;

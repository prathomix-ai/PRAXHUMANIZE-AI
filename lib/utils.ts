import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves a dynamic base URL for authentication redirects and callbacks.
 * Priority:
 * 1. process.env.NEXT_PUBLIC_SITE_URL (Production URL set in Vercel/env)
 * 2. window.location.origin (Current browser URL on client side)
 * 3. process.env.NEXT_PUBLIC_VERCEL_URL (Automatic Vercel deployment URL)
 * 4. Fallback to 'http://localhost:3000'
 */
export const getURL = (path: string = ""): string => {
  let url =
    (typeof window !== "undefined" && window.location.origin ? window.location.origin : null) ??
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";

  // Include `https://` if not already present
  url = url.startsWith("http") ? url : `https://${url}`;

  // Ensure trailing slash is handled if needed
  url = url.endsWith("/") ? url : `${url}/`;

  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${url}${cleanPath}`;
};


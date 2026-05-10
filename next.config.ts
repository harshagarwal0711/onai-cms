import type { NextConfig } from "next";

/**
 * Allow next/image to load uploaded images from Supabase Storage. The hostname
 * is parsed from NEXT_PUBLIC_SUPABASE_URL so prod and dev share one source of truth.
 */
const supabaseHost = (() => {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!u) return undefined;
  try {
    return new URL(u).hostname;
  } catch {
    return undefined;
  }
})();

const config: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
};

export default config;

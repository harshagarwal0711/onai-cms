import type { NextConfig } from "next";

const config: NextConfig = {
  // Allow loading the storefront's product photos directly in the admin so
  // previews show real images even though the file lives in a sibling folder.
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3000" },
    ],
  },
};

export default config;

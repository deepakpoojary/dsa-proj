import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Reuse a visited section's rendered page for 30s, so hopping back to it
    // is instant instead of re-rendering on the server. Trade-off: figures on
    // a revisited page (e.g. Dashboard earnings) can be up to 30s stale; any
    // router.refresh() clears this cache.
    staleTimes: {
      dynamic: 30,
    },
  },
};

export default nextConfig;

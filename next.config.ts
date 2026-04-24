import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  /** Avoid stale SW during local dev; production builds still emit `sw.js` + workbox bundles. */
  disable: process.env.NODE_ENV === "development",
  scope: "/",
  sw: "sw.js",
});

const nextConfig: NextConfig = {
  /* config options here */
};

/** `@types/next-pwa` pins an older `NextConfig`; runtime config is valid for Next 15. */
export default withPWA(nextConfig as unknown as Parameters<typeof withPWA>[0]);

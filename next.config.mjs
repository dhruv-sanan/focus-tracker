// next.config.mjs
import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const baseConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

// Wrap in InjectManifest mode by specifying swSrc:
const withPWA = nextPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
   // exclude Next.js internals from precache
   buildExcludes: [
    /app-build-manifest\.json$/,
    /react-loadable-manifest\.json$/,
    /routes-manifest\.json$/,
    /middleware-manifest\.json$/,
  ],
  // remove swSrc entirely — let next-pwa build the worker
  // sw: "sw.js"    // by default it will be public/sw.js
  // (you can uncomment and rename if you prefer)
});

export default withPWA(baseConfig);

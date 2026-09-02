import { fileURLToPath } from 'url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pins the project root Turbopack should use for this app. Without this,
  // Turbopack auto-detects a root by looking for the nearest lockfile going
  // up the filesystem — and can land on a stray package-lock.json sitting in
  // a home directory (as it did for Eric's Mac), which Next.js then refuses
  // to use since that would pull the whole home folder into scope.
  turbopack: {
    root: projectRoot,
  },
  images: {
    // Next.js's image optimizer refuses to fetch from a host that resolves to
    // a private/loopback IP by default (SSRF protection) — but our own API is
    // exactly that in local dev (localhost:5001), so it needs to be allowed
    // explicitly. Safe here since remotePatterns below still restricts *which*
    // local host/path is trusted; this only lifts the "is it local" check.
    dangerouslyAllowLocalIP: true,
    // Allow next/image to load files served from the Express API's /uploads
    // route in local development, regardless of which port it's running on
    // (this project runs the API on port 5001 — see server/.env).
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        // no `port` set = matches any port, so this keeps working
        // even if the API port ever changes again.
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;

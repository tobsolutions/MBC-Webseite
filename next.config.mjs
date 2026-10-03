/** @type {import('next').NextConfig} */
const nextConfig = {
  // Nur fuer den Docker-Build (Plesk): erzeugt .next/standalone. Auf Vercel darf
  // diese Option nicht gesetzt sein, sonst schlaegt das Output-File-Tracing fehl.
  ...(process.env.BUILD_STANDALONE === "1" ? { output: "standalone" } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

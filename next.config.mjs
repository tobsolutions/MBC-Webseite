/** @type {import('next').NextConfig} */
const nextConfig = {
  // Erzeugt einen minimalen, eigenstaendigen Build (.next/standalone) fuer schlanke Docker-Images.
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

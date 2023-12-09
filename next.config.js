/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "upcdn.io",
          },
          {
            protocol: "https",
            hostname: "replicate.delivery",
          },
        ],
    },
}

module.exports = nextConfig

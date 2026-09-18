/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase storage — covers any project subdomain
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Allow any https image (for flexibility with new Supabase project URL)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
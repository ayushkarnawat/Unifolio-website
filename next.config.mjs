/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: "export", // Temporarily disabled for dev — re-enable for production AWS build
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

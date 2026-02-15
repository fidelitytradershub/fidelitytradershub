/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // Optional but recommended: limit to your Cloudinary cloud name
        // pathname: '/dllfdzyji/**',   ← uncomment if you want stricter control
      },
      // Add more patterns if you use other external domains later
    ],
  },
};

export default nextConfig;
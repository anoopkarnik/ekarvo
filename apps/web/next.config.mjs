import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/auth", "@workspace/database", "@workspace/i18n"],
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/trpc/*": ["../../packages/database/src/docs/**/*.mdx"],
  },
  images: {
    remotePatterns: [
      { hostname: "localhost", protocol: "http" },
      { hostname: "prod-files-secure.s3.us-west-2.amazonaws.com", protocol: "https" }
    ],
    unoptimized: true
  },
  async headers() {
    return [
      {
        source: "/_next/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "http://localhost:5173" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" }
        ]
      }
    ];
  }
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);

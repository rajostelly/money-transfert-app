/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Security headers for PCI DSS compliance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security headers for PCI DSS compliance
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // HSTS (Strict Transport Security) - only in production
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.stripe.com https://*.stripe.com https://m.stripe.network",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // Additional security for API routes
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, nosnippet, noarchive",
          },
        ],
      },
    ];
  },

  // Redirects for security
  async redirects() {
    return [
      // Force HTTPS in production
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/(.*)",
              has: [
                {
                  type: "header",
                  key: "x-forwarded-proto",
                  value: "http",
                },
              ],
              destination: "https://:host/:path*",
              permanent: true,
            },
          ]
        : []),
    ];
  },

  // Webpack optimizations for performance
  webpack: (config, { dev, isServer }) => {
    // Fix for 'self is not defined' error
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
          },
        },
      };
    }

    // Prevent client-side polyfills for Node.js modules
    config.resolve.alias = {
      ...config.resolve.alias,
      crypto: false,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // Environment variables validation
  env: {
    // Only expose non-sensitive environment variables to the client
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLIC_KEY,
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV,
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
  },

  // Disable X-Powered-By header
  poweredByHeader: false,

  // Compression
  compress: true,

  // Output tracing for debugging
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
};

export default nextConfig;

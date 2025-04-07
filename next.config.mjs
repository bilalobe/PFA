/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Enable output compression
  compress: true,
  // Configure caching headers
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Add bundle analyzer in production builds
  webpack: (config, { isServer, dev }) => {
    // This adds bundle analysis capabilities
    if (!dev && !isServer) {
      import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: '../analyze/client.html',
          })
        );
      });
    }
    return config;
  },
  // Output standalone build for better deployment options
  output: 'standalone',
  // Improved module resolution
  experimental: {
    optimizeCss: true,
    turbotrace: {
      logLevel: 'error'
    },
    esmExternals: true,
  },
};

export default nextConfig;
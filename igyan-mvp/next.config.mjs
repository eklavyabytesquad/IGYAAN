/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
			{
				source: "/",
				destination: "/features",
				permanent: false,
			},
		];
	},
	images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/aida-public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // Next 16 uses Turbopack for `next dev`; keep an explicit config alongside
  // the Webpack compatibility hook used by the PPT export dependency.
  turbopack: {},
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      // pptxgenjs references Node protocol imports that are not needed in the
      // browser bundle used by the content-generator download flow.
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "node:fs": false,
        "node:https": false,
      };
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
      );
    }

    return config;
  },
};

export default nextConfig;

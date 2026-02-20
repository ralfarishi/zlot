import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: [
			"@phosphor-icons/react",
			"framer-motion",
			"date-fns",
			"recharts",
			"nuqs",
		],
	},
};

export default nextConfig;

import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false, // Terminal output only
})

const nextConfig = {
  reactStrictMode: true,
}

export default withBundleAnalyzer(nextConfig)

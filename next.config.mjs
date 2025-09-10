/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "flagcdn.com",
                protocol: 'https'
            },
            {
                hostname: "currency.world",
                protocol: 'https'
            },
            {
                hostname: "flagpedia.net",
                protocol: 'https'
            },
        ]
    }
};

export default nextConfig;

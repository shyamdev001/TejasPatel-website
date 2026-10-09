import type { NextConfig } from 'next';

const config: NextConfig = {
  async redirects() {
    return [{ source: '/', destination: '/en', permanent: false }];
  },
};

export default config;

const runtimeCaching = require('next-pwa/cache');
const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching,
});
const withTM = require('next-transpile-modules')(['@stripe/firestore-stripe-payments']);

const headers = async () => {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ];
};

module.exports = withPWA({
  images: {
    domains: ['console.firebase.google.com', 'firebasestorage.googleapis.com', 'files.stripe.com'],
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  env: {
    FIREBASE_PROJECT_ID: 'thenextrental',
  },
  headers,
});

module.exports = withTM({
  reactStrictMode: true,
});
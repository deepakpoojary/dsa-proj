import type { MetadataRoute } from 'next';

// Installable app (PWA): "Install app" / "Add to Home screen" opens it in its
// own window. It loads the live site, so every deploy updates it.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DSA Answers',
    short_name: 'DSA',
    description: 'DSA, theory Q&A, notes, habits and study tracking.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0d1117',
    theme_color: '#0d1117',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Search', url: '/search' },
      { name: 'Notes', url: '/notes' },
      { name: 'Habits', url: '/habits' },
      { name: 'Theory', url: '/theory' },
    ],
  };
}

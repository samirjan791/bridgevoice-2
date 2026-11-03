import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BridgeVoice — Every Voice Deserves to Be Understood',
    short_name: 'BridgeVoice',
    description: 'Human-first multilingual communication and interpreter assistance.',
    start_url: '/app',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#163b5c',
    icons: [
      { src: '/brand/bridgevoice-app-icon.png', sizes: 'any', type: 'image/png', purpose: 'any' },
      { src: '/brand/apple-touch-icon.png', sizes: 'any', type: 'image/png' },
    ],
  };
}

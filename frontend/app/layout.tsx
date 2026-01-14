import type { Metadata, Viewport } from 'next';
import './globals.css';
import ConditionalLayout from './components/ConditionalLayout';

export const metadata: Metadata = {
  title: 'LinkVesta - Bridging Capital',
  description: 'Bridging high-growth African businesses with global and local capital.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get API and Auth URLs from environment (these are available at runtime in client components)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3002';
  
  return (
    <html lang="en">
      <head>
        {/* Inject runtime config for client-side access */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__LINKVESTA_CONFIG__ = {
                apiUrl: ${JSON.stringify(apiUrl)},
                authUrl: ${JSON.stringify(authUrl)}
              };
            `,
          }}
        />
      </head>
      <body style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        margin: 0
      }}>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}


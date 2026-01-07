import type { Metadata } from 'next';
import './globals.css';
import ConditionalLayout from './components/ConditionalLayout';

export const metadata: Metadata = {
  title: 'LinkVesta - Bridging Capital',
  description: 'Bridging high-growth African businesses with global and local capital.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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


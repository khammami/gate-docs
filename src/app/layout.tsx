import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from "@/components/ui/toaster";
import { Inter as FontInter, Space_Grotesk as FontSpaceGrotesk } from 'next/font/google';

const fontInter = FontInter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fontSpaceGrotesk = FontSpaceGrotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Gatedocs',
  description: 'Secure document platform with GitHub authentication.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontInter.variable} ${fontSpaceGrotesk.variable}`}>
      <head>
        {/* Next/font handles font loading, additional link tags for Google Fonts are not needed here. */}
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

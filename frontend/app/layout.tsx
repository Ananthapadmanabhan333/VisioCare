import './globals.css';
import Sidebar from '@/components/Sidebar';
import React from 'react';

export const metadata = {
  title: 'VisioCare VLM Diagnostic Intelligence Platform',
  description: 'Enterprise-grade AI-powered visual customer support & real-time device diagnostics ecosystem',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen bg-background text-gray-100 antialiased overflow-hidden select-none">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

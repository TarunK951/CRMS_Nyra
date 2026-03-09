import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyra Sales Command Center",
  description: "CRM for marketing team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans">{children}</body>
    </html>
  );
}

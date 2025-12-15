import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR-Health - Recovery Companion",
  description: "Your trusted recovery companion. Track progress, stay on schedule, and recover with confidence. By Quantum Rishi.",
  keywords: ["recovery", "health", "medication", "exercise", "wellness", "healthcare"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background font-sans">
        {children}
      </body>
    </html>
  );
}

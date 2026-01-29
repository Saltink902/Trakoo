import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { AppContainer } from "@/components/AppContainer";
import "./globals.css";

const nunito = Nunito({ 
  subsets: ["latin"], 
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#e8d5d0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Trakoo",
  description: "Private mobile-first PWA by Trakoo",
  applicationName: "Trakoo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Trakoo",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    title: "Trakoo",
    description: "Private mobile-first PWA by Trakoo",
    siteName: "Trakoo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#e8d5d0" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${nunito.variable} font-sans antialiased`}>
        <AppContainer>{children}</AppContainer>
      </body>
    </html>
  );
}

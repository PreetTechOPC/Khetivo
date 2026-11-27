import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://khetivo.com"),
  title: "Khetivo | Smart Agriculture & Precision Farm Management System",
  description:
    "Khetivo empowers Indian farmers with precision agriculture: live farm weather data, multi-farm GPS management, crop cycle tracking, PAU advisories, equipment maintenance, store inventory, worker delegation, and mandi ledger.",
  keywords: [
    "Khetivo",
    "smart agriculture",
    "precision farming India",
    "farm management system",
    "crop advisory PAU",
    "farm equipment maintenance",
    "farm inventory management",
    "agricultural weather updates",
    "mandi ledger",
    "Punjab agriculture",
    "Kisan dashboard",
  ],
  authors: [{ name: "Khetivo AgTech" }],
  creator: "Khetivo",
  publisher: "Khetivo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://khetivo.com",
    title: "Khetivo | Precision Farm Management & Agriculture OS",
    description:
      "All-in-one farm management software for Indian farmers: multi-holding GPS, weather intelligence, crop life cycles, equipment fleet, worker delegation, store inventory, and profit & loss ledger.",
    siteName: "Khetivo",
    images: [
      {
        url: "/logo-khetivo-cropped.png",
        width: 1200,
        height: 630,
        alt: "Khetivo Smart Farm Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khetivo | Smart Precision Farming Platform",
    description:
      "Manage farms, monitor live weather, track crop stages, schedule machinery service, and optimize yields with Khetivo.",
    images: ["/logo-khetivo-cropped.png"],
  },
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Khetivo Farm Management OS",
              operatingSystem: "Web, Android, iOS",
              applicationCategory: "BusinessApplication",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              description:
                "Complete farm operating system for Indian farmers featuring GPS farm mapping, live weather updates, PAU crop advisories, equipment maintenance, inventory tracking, task delegation, and mandi financials.",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "1280",
              },
            }),
          }}
        />
        {children}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

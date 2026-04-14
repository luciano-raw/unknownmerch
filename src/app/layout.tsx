import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { ChatWidget } from "@/components/chat-widget";
import { DiscountProvider } from "@/components/discount-provider";
import { OrganizationSchema } from "@/components/json-ld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://unknown-club.store"),
  title: {
    default: "Unknown Club | Minimalist Merch Store",
    template: "%s | Unknown Club"
  },
  description: "Exclusive minimalist merch from Unknown Club. Pure black and white aesthetics for car enthusiasts.",
  keywords: ["minimalist", "merch", "unknown club", "car club", "apparel chile"],
  authors: [{ name: "Unknown Club" }],
  creator: "Unknown Club",
  publisher: "Unknown Club",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  openGraph: {
    title: "Unknown Club | Minimalist Merch Store",
    description: "Exclusive minimalist merch from Unknown Club. Pure black and white aesthetics.",
    url: "https://unknown-club.store",
    siteName: "Unknown Club",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unknown Club | Minimalist Merch Store",
    description: "Exclusive minimalist merch from Unknown Club. Pure black and white aesthetics.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://unknown-club.store",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const discount = (user?.publicMetadata?.discount as number) || 0;

  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  var theme = localStorage.getItem('theme');
                  var isSysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && isSysDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              `,
            }}
          />
        </head>
        <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
          <ThemeProvider>
            <DiscountProvider discount={discount} />
            <Header />
            {children}
            <OrganizationSchema />
            <ChatWidget />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

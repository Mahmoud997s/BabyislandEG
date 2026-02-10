import { headers } from "next/headers";
import type { Metadata } from "next";
import { Cairo, Fredoka, Chewy, Shadows_Into_Light, Baskervville_SC, Aref_Ruqaa } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./providers";
import { DirectionProvider } from "@/components/providers/DirectionProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const cairo = Cairo({
    subsets: ["arabic", "latin"],
    variable: "--font-cairo",
});

const fredoka = Fredoka({
    subsets: ["latin"],
    variable: "--font-fredoka",
    weight: ["300", "400", "500", "600", "700"],
});

const chewy = Chewy({
    subsets: ["latin"],
    variable: "--font-chewy",
    weight: "400",
});

const shadows = Shadows_Into_Light({
    subsets: ["latin"],
    variable: "--font-shadows",
    weight: "400",
});

const baskervville = Baskervville_SC({
    subsets: ["latin"],
    variable: "--font-baskervville-sc",
    weight: "400",
});

const arefRuqaa = Aref_Ruqaa({
    subsets: ["arabic"],
    variable: "--font-aref-ruqaa",
    weight: ["400", "700"],
});

export const metadata: Metadata = {
    metadataBase: new URL('https://babyislandeg.com'),
    title: {
        default: "BabyislandEG | عربات الأطفال ومستلزماتها",
        template: "%s | BabyislandEG"
    },
    description: "Premium baby strollers, high chairs, and accessories in Egypt. Shop top brands like Chicco, Joie, and more. عربات أطفال فاخرة ومستلزماتها في مصر.",
    keywords: ["baby stroller", "baby gear", "egypt", "stroller chic", "baby island", "عربات أطفال", "مستلزمات بيبي", "شيكو", "جوي"],
    authors: [{ name: "BabyislandEG" }],
    icons: {
        icon: "/favicon_custom.png",
        apple: "/favicon_custom.png",
    },
    openGraph: {
        type: 'website',
        locale: 'ar_EG',
        alternateLocale: 'en_US',
        url: 'https://babyislandeg.com',
        siteName: 'BabyislandEG',
        title: 'BabyislandEG | Premium Baby Gear',
        description: 'Discover the best baby strollers and accessories in Egypt.',
        images: [
            {
                url: '/og-image.jpg', // Ensure this exists or use a default product image
                width: 1200,
                height: 630,
                alt: 'BabyislandEG',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BabyislandEG',
        description: 'Premium Baby Gear and Strollers in Egypt',
        images: ['/og-image.jpg'], // Same here
    },
    alternates: {
        canonical: 'https://babyislandeg.com',
        languages: {
            'en': 'https://babyislandeg.com/en',
            'ar': 'https://babyislandeg.com/ar',
        },
    },
};

import { HydrationSanitizer } from "@/components/HydrationSanitizer";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Determine locale/direction from headers (set by middleware)
    const headersList = await headers();
    const locale = headersList.get("x-locale") || "ar"; // default to ar
    const dir = locale === "ar" ? "rtl" : "ltr";

    return (
        <html lang={locale} dir={dir}>
            <body suppressHydrationWarning className={`${cairo.variable} ${fredoka.variable} ${chewy.variable} ${shadows.variable} ${baskervville.variable} ${arefRuqaa.variable} font-sans antialiased`}>
                <HydrationSanitizer />
                <ClientProviders>
                    <DirectionProvider />
                    {children}
                </ClientProviders>
                <SpeedInsights />
            </body>
        </html>
    );
}

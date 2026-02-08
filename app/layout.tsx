import { headers } from "next/headers";
import type { Metadata } from "next";
import { Cairo, Fredoka, Chewy, Shadows_Into_Light, Baskervville_SC, Aref_Ruqaa } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./providers";
import { DirectionProvider } from "@/components/providers/DirectionProvider";

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
    title: "BabyislandEG | عربات الأطفال",
    description: "Premium baby strollers and accessories - BabyislandEG - عربات أطفال فاخرة ومستلزماتها",
    icons: {
        icon: "/favicon_custom.png",
        apple: "/favicon_custom.png",
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
            </body>
        </html>
    );
}

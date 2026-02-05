import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: "website" | "product" | "article";
    price?: number;
    currency?: string;
    availability?: "in stock" | "out of stock";
}

export function SEO({
    title = "Stroller Chic - كل ما تحتاجه لطفلك",
    description = "متجر العربات والمستلزمات الأطفال الأول في مصر. عربات أطفال فاخرة، ألعاب آمنة، ومستلزمات عالية الجودة.",
    image = "https://strollerchic.com/og-image.jpg",
    url = "https://strollerchic.com",
    type = "website",
    price,
    currency = "EGP",
    availability = "in stock"
}: SEOProps) {
    const fullTitle = title.includes("Stroller Chic") ? title : `${title} | Stroller Chic`;

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:locale" content="ar_EG" />
            <meta property="og:site_name" content="Stroller Chic" />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Product Schema (if product type) */}
            {type === "product" && price && (
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": title,
                        "image": image,
                        "description": description,
                        "offers": {
                            "@type": "Offer",
                            "url": url,
                            "priceCurrency": currency,
                            "price": price,
                            "availability": availability === "in stock"
                                ? "https://schema.org/InStock"
                                : "https://schema.org/OutOfStock"
                        }
                    })}
                </script>
            )}

            {/* Canonical URL */}
            <link rel="canonical" href={url} />
        </Helmet>
    );
}

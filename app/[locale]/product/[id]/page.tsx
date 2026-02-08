import { Metadata, ResolvingMetadata } from 'next';
import ProductDetailsPage from "@/views/ProductDetailsPage";
import { productsService } from "@/services/productsService";

type Props = {
    params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id, locale } = await params;

    const product = await productsService.getProductById(id);

    if (!product) {
        return {
            title: locale === 'ar' ? 'المنتج غير موجود' : 'Product Not Found',
        }
    }

    const isRtl = locale === 'ar';
    const title = (isRtl && product.name_ar) ? product.name_ar : product.name;
    const description = (isRtl && product.description_ar) ? product.description_ar : product.description; // Fallback to en description if ar missing? Logic says strict fallback.
    const finalDesc = description || ((isRtl && product.description) ? product.description : "") || "";

    return {
        title: title,
        description: finalDesc.substring(0, 160),
        openGraph: {
            title: title,
            description: finalDesc.substring(0, 160),
            images: product.images || [],
            type: 'website',
            locale: locale,
            siteName: 'BabyislandEG',
        },
        alternates: {
            canonical: `https://babyislandeg.com/${locale}/product/${id}`,
            languages: {
                'en': `https://babyislandeg.com/en/product/${id}`,
                'ar': `https://babyislandeg.com/ar/product/${id}`,
            }
        }
    }
}

export default async function ProductDetailsPageWrapper(props: { params: Promise<{ id: string; locale: string }> }) {
    const { id, locale } = await props.params;
    const product = await productsService.getProductById(id);

    if (!product) return <ProductDetailsPage />;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: locale === 'ar' ? product.name_ar : product.name,
        image: product.images || [],
        description: locale === 'ar' ? product.description_ar : product.description,
        sku: product.id,
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'EGP',
            availability: (product.stockStatus === 'in-stock' || product.stockStatus === 'low-stock') 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
            url: `https://babyislandeg.com/${locale}/product/${id}`,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailsPage />
        </>
    );
}

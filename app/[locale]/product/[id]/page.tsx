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
        },
    }
}

export default function ProductDetailsPageWrapper() {
    return <ProductDetailsPage />;
}

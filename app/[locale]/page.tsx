import Index from "@/views/Index";
import { productsService } from "@/services/productsService";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const bestSellers = await productsService.getBestSellers();
    return <Index bestSellers={bestSellers} />;
}

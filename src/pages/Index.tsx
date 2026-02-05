import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/home/HeroSlider";
import { BrandLogoSlider } from "@/components/home/BrandLogoSlider";
import { categories } from "@/data/products";
import { BestsellersCarousel } from "@/components/home/BestsellersCarousel";
import { NewArrivals } from "@/components/home/NewArrivals";
import { BrowseByCategory } from "@/components/home/BrowseByCategory";
import { productsService } from "@/services/productsService";
import { Product } from "@/data/products";

const trustBadges = [
  { icon: Truck, key: "freeShipping" },
  { icon: Shield, key: "warranty" },
  { icon: RotateCcw, key: "easyReturns" },
  { icon: Headphones, key: "support" },
];

const categoryKeyMap: Record<string, string> = {
  'strollers-gear': 'strollersGear',
  'feeding': 'feeding',
  'toys': 'toys',
  'nursery': 'nursery',
  'bathing': 'bathing'
};

export default function HomePage() {
  const { t } = useTranslation();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    productsService.getBestSellers().then((products) => {
      setBestSellers(products);
    });
  }, []);

  return (
    <Layout>
      {/* Brand Slider */}
      <BrandLogoSlider />

      {/* Hero Section (Slider) */}
      <HeroSlider />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Best Sellers */}
      <section className="py-8 lg:py-12">
        <div className="container-main">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-2">{t('home.bestSellers')}</h2>
              <p className="text-muted-foreground">{t('home.bestSellersDesc')}</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/shop">{t('common.viewAll')}</Link>
            </Button>
          </div>
          <div className="relative">
            <BestsellersCarousel products={bestSellers} />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-b">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <badge.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t(`trust.${badge.key}`)}</h3>
                  <p className="text-xs text-muted-foreground">{t(`trust.${badge.key}Desc`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse By Category */}
      <BrowseByCategory />



      {/* CTA removed as per user request */}
    </Layout>
  );
}

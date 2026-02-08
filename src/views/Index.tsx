"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/home/HeroSlider";
import { BenefitsBar } from "@/components/home/BenefitsBar";
import { BrandLogoSlider } from "@/components/home/BrandLogoSlider";
import { BestsellersCarousel } from "@/components/home/BestsellersCarousel";
import { NewArrivals } from "@/components/home/NewArrivals";
import { BrowseByCategory } from "@/components/home/BrowseByCategory";
import { ReviewsCarousel } from "@/components/home/ReviewsCarousel";
// link imported but used inside Button asChild
import { LocaleLink } from "@/components/LocaleLink";
import { Product } from "@/data/products";

interface HomePageProps {
  bestSellers: Product[];
}

export default function HomePage({ bestSellers }: HomePageProps) {
  const { t } = useTranslation();

  return (
    <Layout>
      {/* Brand Slider */}
      <BrandLogoSlider />

      {/* Hero Section (Slider) */}
      <HeroSlider />

      {/* Benefits Bar (New Section) */}
      <BenefitsBar />

      {/* Browse By Category - Now First! */}
      <BrowseByCategory />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Best Sellers */}
      {/* Best Sellers */}
      <section className="py-8 lg:py-12">
        <div className="container-main">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-center mb-12 uppercase tracking-tighter">
            {t('home.bestSellers')}
          </h2>
          <div className="relative">
            <BestsellersCarousel products={bestSellers} />
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild size="lg" className="rounded-full px-8">
              <LocaleLink href="/shop">{t('common.viewAll')}</LocaleLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <ReviewsCarousel />
    </Layout>
  );
}

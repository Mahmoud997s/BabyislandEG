import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { getBestSellers, categories } from "@/data/products";

const trustBadges = [
  { icon: Truck, title: "شحن مجاني", desc: "للطلبات فوق 5000 جنيه" },
  { icon: Shield, title: "ضمان شامل", desc: "حتى 3 سنوات" },
  { icon: RotateCcw, title: "إرجاع سهل", desc: "خلال 14 يوم" },
  { icon: Headphones, title: "دعم فني", desc: "متاح 24/7" },
];

export default function HomePage() {
  const bestSellers = getBestSellers().slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-gradient py-16 lg:py-24">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                عربات أطفال{" "}
                <span className="text-gradient">فاخرة</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                اكتشف مجموعتنا المميزة من عربات الأطفال الفاخرة المصممة للراحة
                والأمان. لأن طفلك يستحق الأفضل.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/shop">
                    تسوق الآن
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/shop">استكشف المجموعة</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-secondary overflow-hidden">
                <img
                  src="/placeholder.svg"
                  alt="عربة أطفال فاخرة"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-b">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <badge.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{badge.title}</h3>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">تصفح حسب الفئة</h2>
            <div className="section-divider mb-4" />
            <p className="text-muted-foreground">اختر ما يناسب احتياجاتك</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/shop?category=${cat.id}`}
                  className="block p-6 rounded-2xl bg-card card-hover text-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{cat.count} منتج</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container-main">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-2">الأكثر مبيعاً</h2>
              <p className="text-muted-foreground">المنتجات المفضلة لعملائنا</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/shop">عرض الكل</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="container-main">
          <div className="bg-primary rounded-3xl p-8 lg:p-16 text-center text-primary-foreground">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              جاهز لاختيار عربة طفلك؟
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              تصفح مجموعتنا الكاملة واستمتع بشحن مجاني للطلبات فوق 5000 جنيه
            </p>
            <Button variant="gold" size="xl" asChild>
              <Link to="/shop">تسوق الآن</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

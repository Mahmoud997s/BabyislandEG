import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { PriceDisplay } from "@/components/ui/price-display";

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getItemCount,
    getShippingFee,
    getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const shipping = getShippingFee();
  const total = getTotal();
  const itemCount = getItemCount();
  const isFreeShipping = shipping === 0;

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString(isRTL ? "ar-EG" : "en-EG")} ${t("common.currency")}`;
  };

  return (
    <Layout>
      <section className="py-8 lg:py-12">
        <div className="container-main">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <ShoppingBag className="w-6 h-6" />
            <h1 className="text-2xl lg:text-3xl font-bold">{t("cart.title")}</h1>
            <span className="text-muted-foreground">({itemCount} {t("cart.itemCount")})</span>
          </div>

          {items.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="w-20 h-20 text-muted-foreground mb-6" />
              <h2 className="text-xl font-medium mb-2">{t("cart.empty")}</h2>
              <p className="text-muted-foreground mb-8">
                {t("cart.emptyDesc")}
              </p>
              <Button asChild>
                <Link to="/shop">{t("cart.shopNow")}</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={`${item.product.id}-${item.variant.color}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 p-4 bg-card rounded-xl"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 rounded-lg bg-secondary overflow-hidden shrink-0">
                      <img
                        src={item.variant.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("cart.color")}: {item.variant.color}
                      </p>
                      <div className="mt-2">
                        <PriceDisplay
                          price={item.product.price}
                          size="sm"
                          showCurrency={false}
                        />
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.variant.color,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-10 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.variant.color,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() =>
                            removeItem(item.product.id, item.variant.color)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl p-6 sticky top-24">
                  <h2 className="text-lg font-semibold mb-4">{t("cart.orderSummary")}</h2>

                  {/* Free Shipping Note */}
                  {!isFreeShipping && (
                    <div className="bg-accent/50 rounded-lg p-3 mb-4 text-center">
                      <p className="text-sm">
                        {t("cart.addMoreForFree")}{" "}
                        <span className="font-bold text-primary">
                          {formatCurrency(5000 - subtotal)}
                        </span>{" "}
                        {t("cart.forFreeShipping")}
                      </p>
                    </div>
                  )}

                  {isFreeShipping && (
                    <div className="bg-green-500/10 text-green-600 rounded-lg p-3 mb-4 text-center">
                      <p className="text-sm font-medium">
                        {t("cart.freeShippingCongrats")}
                      </p>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="text-muted-foreground">{t("cart.shipping")}</span>
                    <span className="font-medium">
                      {isFreeShipping ? t("cart.free") : formatCurrency(shipping)}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between py-3">
                    <span className="font-semibold">{t("cart.total")}</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 mt-6">
                    <Button className="w-full" size="lg" asChild>
                      <Link to="/checkout">
                        {t("cart.checkout")}
                        <ArrowLeft className="w-4 h-4 mr-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/shop">{t("cart.continueShopping")}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

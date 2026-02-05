import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { PriceDisplay } from "@/components/ui/price-display";

export function CartDrawer() {
  const { t, i18n } = useTranslation();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getItemCount,
  } = useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  const formatPrice = (value: number) => {
    return value.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h2 className="text-lg font-semibold">{t('cart.title')}</h2>
                <span className="text-sm text-muted-foreground">
                  ({itemCount} {t('cart.itemCount')})
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t('cart.empty')}</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t('cart.emptyDesc')}
                  </p>
                  <Button onClick={closeCart} asChild>
                    <Link to="/shop">{t('cart.shopNow')}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.variant.color}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-3 bg-card rounded-xl"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg bg-secondary overflow-hidden shrink-0">
                        <img
                          src={item.variant.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t('cart.color')}: {item.variant.color}
                        </p>
                        <div className="mt-2">
                          <PriceDisplay
                            price={item.product.price}
                            compareAtPrice={item.product.compareAtPrice}
                            discountPercentage={item.product.discountPercentage}
                            size="sm"
                            showCurrency={false}
                          />
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.variant.color,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.variant.color,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
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
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                {/* Free Shipping Note */}
                {subtotal < 5000 && (
                  <div className="bg-accent/50 rounded-lg p-3 text-center">
                    <p className="text-sm">
                      {t('cart.addMoreForFree')}{" "}
                      <span className="font-bold text-primary">
                        {formatPrice(5000 - subtotal)} {t('common.egp')}
                      </span>{" "}
                      {t('cart.forFreeShipping')}
                    </p>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span className="text-lg font-bold">
                    {formatPrice(subtotal)} {t('common.egp')}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link to="/checkout" onClick={closeCart}>
                      {t('cart.checkout')}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={closeCart}
                    asChild
                  >
                    <Link to="/cart">{t('cart.viewCart')}</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

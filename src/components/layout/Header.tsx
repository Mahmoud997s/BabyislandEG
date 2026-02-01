import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/shop", label: "المتجر" },
  {
    href: "/shop",
    label: "الفئات",
    children: [
      { href: "/shop?category=lightweight", label: "خفيفة الوزن" },
      { href: "/shop?category=travel-system", label: "نظام السفر" },
      { href: "/shop?category=twin", label: "توأم" },
      { href: "/shop?category=jogger", label: "رياضية" },
      { href: "/shop?category=premium", label: "فاخرة" },
    ],
  },
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "تواصل معنا" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const location = useLocation();
  const { getItemCount, openCart } = useCartStore();
  const itemCount = getItemCount();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground text-sm py-2">
        <div className="container-main flex items-center justify-center gap-2">
          <span>🚚 شحن مجاني للطلبات فوق 5,000 جنيه</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">✅ ضمان حتى 3 سنوات</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">🔄 إرجاع سهل خلال 14 يوم</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="glass border-b">
        <div className="container-main">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="القائمة"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">ب</span>
              </div>
              <span className="text-xl font-bold text-foreground hidden sm:block">
                بيبي ستورز
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div key={link.label} className="relative group">
                  {link.children ? (
                    <button
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                        location.pathname === link.href
                          ? "text-primary"
                          : "text-foreground"
                      )}
                      onMouseEnter={() => setIsCategoryOpen(true)}
                      onMouseLeave={() => setIsCategoryOpen(false)}
                    >
                      {link.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link
                      to={link.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        location.pathname === link.href
                          ? "text-primary"
                          : "text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* Dropdown */}
                  {link.children && (
                    <div
                      className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                      onMouseEnter={() => setIsCategoryOpen(true)}
                      onMouseLeave={() => setIsCategoryOpen(false)}
                    >
                      <div className="bg-card rounded-xl shadow-lg border p-2 min-w-[180px]">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="block px-4 py-2 text-sm rounded-lg hover:bg-accent transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="بحث">
                <Search className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="حسابي">
                <User className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={openCart}
                aria-label="السلة"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-b overflow-hidden"
          >
            <nav className="container-main py-4">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <div>
                      <button
                        className="w-full flex items-center justify-between py-3 text-foreground font-medium"
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      >
                        {link.label}
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform",
                            isCategoryOpen && "rotate-180"
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {isCategoryOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pr-4 overflow-hidden"
                          >
                            {link.children.map((child) => (
                              <Link
                                key={child.label}
                                to={child.href}
                                className="block py-2 text-muted-foreground hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={link.href}
                      className="block py-3 text-foreground font-medium hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { useState, useMemo } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { SearchResults } from "./SearchResults";
import { productsService } from "@/services/productsService";
import { Product } from "@/data/products";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LocaleLink } from "@/components/LocaleLink";
import { useLocaleNavigate } from "@/hooks/useLocaleNavigate";

interface NavLink {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const location = useLocation();
  const { getItemCount, openCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useLocaleNavigate();
  const itemCount = getItemCount();

  const navLinks: NavLink[] = useMemo(() => [
    { href: "/", label: t("nav.home") },
    { href: "/shop", label: t("nav.shop") },
    {
      href: "/shop",
      label: t("nav.categories"),
      children: [
        { href: "/shop?category=strollers-gear", label: t("categories.strollersGear") },
        { href: "/shop?category=feeding", label: t("categories.feeding") },
        { href: "/shop?category=toys", label: t("categories.toys") },
        { href: "/shop?category=nursery", label: t("categories.nursery") },
        { href: "/shop?category=bathing", label: t("categories.bathing") },
      ],
    },
    { href: "/track-order", label: t("nav.trackOrder") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ], [t]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 1) {
      setIsLoadingSearch(true);
      productsService.getFilteredProducts({ search: q }).then((products) => {
        setSearchResults(products.slice(0, 5));
        setIsLoadingSearch(false);
      });
    } else {
      setSearchResults([]);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-black text-white text-sm py-2">
        <div className="container-main flex items-center justify-center gap-2">
          <span>{t("header.topBar.freeShipping")}</span>
          <LocaleLink to="/shop" className="font-semibold underline">
            {t("header.topBar.signUpNow", "Sign Up Now")}
          </LocaleLink>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b">
        <div className="container-main">
          <div className="flex items-center justify-between h-16 lg:h-[72px] gap-4 lg:gap-10">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={t("nav.categories")}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            {/* Logo */}
            <LocaleLink to="/" className="flex items-center gap-3 group shrink-0">
              <img
                src="/babyisland_logo_exact.png"
                alt="BabyislandEG"
                className="w-12 h-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg ring-2 ring-white/50"
              />
              <div className="hidden sm:flex flex-col items-center gap-0">
                <span className="text-2xl font-black transition-all duration-300 group-hover:tracking-wide drop-shadow-sm leading-tight" style={{ fontFamily: "'Nexa', sans-serif" }}>
                  <span className="text-[#0EA5E9]">Babyisland</span>
                  <span className="text-[#F97316]">EG</span>
                </span>
                <span className="text-[10px] font-bold text-[#F97316] tracking-wider uppercase -mt-1" style={{ fontFamily: "'Chewy', cursive" }}>
                  {t("header.slogan")}
                </span>
              </div>
            </LocaleLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <div key={link.label} className="relative group">
                  {link.children ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            "flex items-center gap-1 text-base transition-colors hover:text-black/60",
                            location.pathname === link.href ? "text-black" : "text-black"
                          )}
                        >
                          {link.label}
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[180px]">
                        {link.children.map((child) => (
                          <DropdownMenuItem key={child.label} asChild>
                            <LocaleLink to={child.href} className="w-full">
                              {child.label}
                            </LocaleLink>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <LocaleLink
                      to={link.href}
                      className={cn(
                        "text-base transition-colors hover:text-black/60",
                        location.pathname === link.href ? "text-black" : "text-black"
                      )}
                    >
                      {link.label}
                    </LocaleLink>
                  )}
                </div>
              ))}
            </nav>

            {/* Search Bar - Large, always visible on desktop */}
            <div className="hidden lg:flex flex-1 max-w-[580px] relative">
              <div className="relative w-full">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchResults([]);
                    }
                  }}
                  placeholder={t("common.searchProducts", "Search for products...")}
                  className="w-full h-12 pl-12 pr-4 bg-[#F0F0F0] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                />
                {searchQuery && searchResults.length > 0 && (
                  <SearchResults
                    results={searchResults}
                    isLoading={isLoadingSearch}
                    query={searchQuery}
                    onClose={() => {
                      setSearchResults([]);
                      setSearchQuery("");
                    }}
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Mobile Search */}
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Search className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={openCart}
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>

              {/* User Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={t("nav.account")}>
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  {!isAuthenticated ? (
                    <>
                      <DropdownMenuItem onClick={() => {
                        const currentPath = location.pathname;
                        if (currentPath !== "/login" && currentPath !== "/register") {
                          sessionStorage.setItem("redirectAfterLogin", currentPath);
                        }
                        navigate("/login");
                      }}>
                        {t("nav.login", "Sign In")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/register")}>
                        {t("nav.register", "Register")}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate(user?.role === "admin" ? "/admin" : "/account")}>
                        {user?.role === "admin" ? t("nav.dashboard") : t("nav.account")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/track-order")}>
                        {t("nav.trackOrder", "Track Order")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={async () => {
                          await logout();
                          navigate("/shop");
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        {t("nav.logout")}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Language Switcher */}
              <LanguageSwitcher />
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
            className="lg:hidden bg-white border-b overflow-hidden"
          >
            <nav className="container-main py-4">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  placeholder={t("common.searchProducts", "Search for products...")}
                  className="w-full h-12 pl-12 pr-4 bg-[#F0F0F0] rounded-full text-sm focus:outline-none"
                />
              </div>

              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.children ? (
                    <div>
                      <button
                        className="w-full flex items-center justify-between py-3 text-black font-medium"
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
                            className="ps-4 overflow-hidden"
                          >
                            {link.children.map((child) => (
                              <LocaleLink
                                key={child.label}
                                to={child.href}
                                className="block py-2 text-black/60 hover:text-black"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {child.label}
                              </LocaleLink>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <LocaleLink
                      to={link.href}
                      className="block py-3 text-black font-medium hover:text-black/60"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </LocaleLink>
                  )}
                </div>
              ))}

              {/* Mobile Auth Actions */}
              <div className="border-t mt-4 pt-4">
                {!isAuthenticated ? (
                  <>
                    <button
                      className="w-full text-start block py-3 text-black font-medium hover:text-black/60"
                      onClick={() => {
                        setIsMenuOpen(false);
                        const currentPath = location.pathname;
                        if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
                          sessionStorage.setItem("redirectAfterLogin", currentPath);
                        }
                        navigate("/login");
                      }}
                    >
                      {t("nav.login", "Sign In")}
                    </button>
                    <LocaleLink
                      to="/register"
                      className="block py-3 text-black font-medium hover:text-black/60"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t("nav.register", "Register")}
                    </LocaleLink>
                  </>
                ) : (
                  <>
                    {user?.role === "admin" ? (
                      <Link
                        to="/admin"
                        className="block py-3 text-black font-medium hover:text-black/60"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("nav.dashboard")}
                      </Link>
                    ) : (
                      <LocaleLink
                        to="/account"
                        className="block py-3 text-black font-medium hover:text-black/60"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {t("nav.account")}
                      </LocaleLink>
                    )}
                    <button
                      className="w-full text-start block py-3 text-destructive font-medium hover:text-destructive/80"
                      onClick={async () => {
                        await logout();
                        setIsMenuOpen(false);
                        navigate("/shop");
                      }}
                    >
                      {t("nav.logout")}
                    </button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

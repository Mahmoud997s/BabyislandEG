"use client";

import { useState, useMemo, useEffect } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import { usePathname, useRouter } from "next/navigation";
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
import { useLocaleNavigate } from "@/hooks/useLocaleNavigate";
import { SafeText } from "@/components/SafeText";
import { Logo } from "@/components/ui/Logo";

interface NavLink {
  id: string;
  href: string;
  label: string;
  children?: { id: string; href: string; label: string }[];
}

import { categories as allCategories } from "@/data/products";

// Helper to get translation key from category ID
const getCategoryLabel = (id: string, t: any) => {
    // Special cases or direct mapping
    if (id === 'clothing') return t('categories.clothing', 'Clothing');
    if (id === 'maternity') return t('categories.maternity', 'Maternity');
    // Default to camelCase map if needed, or simple key
    // The current keys in en.json are: babyCare, strollersGear, feeding, toys, nursery, bathing, clothing, diapering, health, maternity, gifts, travel, junior
    // We need to map kebab-case IDs to these keys if they don't match exactly.
    const keyMap: Record<string, string> = {
        'baby-care': 'babyCare',
        'strollers-gear': 'strollersGear',
        'feeding': 'feeding',
        'toys': 'toys',
        'nursery': 'nursery',
        'bathing': 'bathing',
        'clothing': 'clothing',
        'shoes': 'shoes',
        'diapering': 'diapering',
        'health': 'health',
        'maternity': 'maternity',
        'gifts': 'gifts',
        'travel': 'travel',
        'junior': 'junior'
    };
    return t(`categories.${keyMap[id] || id}`, id);
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Fix hydration mismatch
  const pathname = usePathname();
  const { getItemCount, openCart } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
  const navigate = useLocaleNavigate();
  const router = useRouter(); // Added missing router
  const itemCount = getItemCount();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navLinks: NavLink[] = useMemo(() => [
    { id: "home", href: "/", label: t("nav.home") },
    { id: "shop", href: "/shop", label: t("nav.shop") },
    {
      id: "categories",
      href: "/shop",
      label: t("nav.categories"),
      children: [
        { id: "baby-care", href: "/shop?category=baby-care", label: t("categories.babyCare") },
        { id: "strollers", href: "/shop?category=strollers-gear", label: t("categories.strollersGear") },
        { id: "feeding", href: "/shop?category=feeding", label: t("categories.feeding") },
        { id: "toys", href: "/shop?category=toys", label: t("categories.toys") },
        { id: "clothing", href: "/shop?category=clothing", label: t("categories.clothing", "Clothing") },
        { id: "maternity", href: "/shop?category=maternity", label: t("categories.maternity", "Maternity") },
        { id: "nursery", href: "/shop?category=nursery", label: t("categories.nursery") },
        { id: "bathing", href: "/shop?category=bathing", label: t("categories.bathing") },
      ],
    },
    { id: "track", href: "/track-order", label: t("nav.trackOrder") },
    { id: "about", href: "/about", label: t("nav.about") },
    { id: "contact", href: "/contact", label: t("nav.contact") },
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
      <div className="bg-black text-white text-xs sm:text-sm py-2">
        <div className="container-main flex items-center justify-center gap-2">
          <span suppressHydrationWarning>{t("header.topBar.freeShipping")}</span>
          <LocaleLink href="/shop" className="font-semibold underline">
            <span suppressHydrationWarning>{t("header.topBar.signUpNow", "Sign Up Now")}</span>
          </LocaleLink>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b sticky top-0 md:static z-50">
        <div className="container-main py-4">
          <div className="flex flex-col gap-4">
            
            {/* Row 1: Logo - Nav - Actions */}
            <div className="flex items-center justify-between gap-2 md:gap-4">
              
              {/* Mobile Menu (Hidden Desktop) */}
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
              {/* Logo */}
              <LocaleLink href="/" className="group shrink-0">
                <Logo />
              </LocaleLink>

              {/* Desktop Navigation (Moved Here) */}
              <div className="hidden lg:block flex-1 px-8">
                <nav className="flex items-center justify-center gap-6">
                {navLinks.map((link) => (
                    <div key={link.id} className="relative group">
                    {link.children ? (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                            className={cn(
                                "flex items-center gap-1 text-base font-medium py-2 transition-colors hover:text-[#F97316]",
                                pathname === link.href ? "text-[#F97316]" : "text-[#0EA5E9]"
                            )}
                            >
                            {link.label}
                            <ChevronDown className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[200px]">
                            {link.children.map((child) => (
                            <DropdownMenuItem key={child.id} asChild className="focus:bg-orange-50 focus:text-[#F97316] cursor-pointer">
                                <LocaleLink href={child.href} className="w-full py-2">
                                <span suppressHydrationWarning>{child.label}</span>
                                </LocaleLink>
                            </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <LocaleLink
                        href={link.href}
                        className={cn(
                            "text-base font-medium py-2 transition-colors hover:text-[#F97316]",
                            pathname === link.href ? "text-[#F97316]" : "text-[#0EA5E9]"
                        )}
                        >
                        <span suppressHydrationWarning>{link.label}</span>
                        </LocaleLink>
                    )}
                    </div>
                ))}
                </nav>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Search Toggle (Desktop) */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden lg:flex text-[#0EA5E9] hover:text-[#F97316]"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    aria-label="Toggle Search"
                >
                  {isSearchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" strokeWidth={2.5} />}
                </Button>

                {/* Mobile Search (Kept for mobile layout consistency if needed, checking below) */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden"
                    onClick={() => setIsSearchOpen(!isSearchOpen)} // Reuse same state for mobile drop or keep separate? 
                    // Keeping separate layout for mobile usually, but here we can reuse the drop logic if desired?
                    // User request specifically mentioned "click on search icon drop down line 2". I'll assume this applies to main functionality.
                    // But mobile already has a search field in the menu. Let's keep mobile simple as is or apply same logic.
                    // For now, I'll keep the mobile search trigger doing what it did or bind it to the new logic if appropriate.
                    // The previous code had a specific mobile layout.
                >
                  <Search className="w-5 h-5" />
                </Button>

                {/* Cart */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:text-[#F97316] hover:bg-orange-50"
                  onClick={openCart}
                  aria-label="Cart"
                >
                  <ShoppingCart className={cn("w-6 h-6", i18n.language === 'en' && "scale-x-[-1]")} />
                  {isMounted && itemCount > 0 && (
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
                    <Button variant="ghost" size="icon" aria-label={t("nav.account")} className="hover:text-[#F97316] hover:bg-orange-50">
                      <User className="w-6 h-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[160px]">
                    {!isAuthenticated ? (
                      <>
                        <DropdownMenuItem onClick={() => {
                          const currentPath = pathname;
                          if (currentPath !== "/login" && currentPath !== "/register") {
                            sessionStorage.setItem("redirectAfterLogin", currentPath);
                          }
                          navigate("/login");
                        }} className="focus:bg-orange-50 focus:text-[#F97316] cursor-pointer">
                          <span suppressHydrationWarning>{t("nav.login", "Sign In")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/register")} className="focus:bg-orange-50 focus:text-[#F97316] cursor-pointer">
                          <span suppressHydrationWarning>{t("nav.register", "Register")}</span>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => navigate(user?.role === "admin" ? "/admin" : "/account")} className="focus:bg-orange-50 focus:text-[#F97316] cursor-pointer">
                          <span suppressHydrationWarning>{user?.role === "admin" ? t("nav.dashboard") : t("nav.account")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/track-order")} className="focus:bg-orange-50 focus:text-[#F97316] cursor-pointer">
                          <span suppressHydrationWarning>{t("nav.trackOrder", "Track Order")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={async () => {
                            await logout();
                            navigate("/shop");
                          }}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                        >
                          <span suppressHydrationWarning>{t("nav.logout")}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Language Switcher */}
                <div className="hidden lg:block">
                    <LanguageSwitcher />
                </div>
              </div>
            </div>

            {/* Row 2: Search Bar Dropdown (Desktop) */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 z-40 flex justify-center pt-2 pb-4 pointer-events-none"
                    >
                        <div className="w-full max-w-3xl px-4 pointer-events-auto">
                            <div className="flex items-center w-full h-12 rounded-full overflow-hidden bg-white shadow-xl ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-[#F97316]">
                            
                  {/* Category Dropdown (Mock/Simple) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-full px-4 flex items-center gap-1 bg-gray-50 border-r border-gray-200 text-xs text-gray-700 hover:bg-gray-100 hover:text-[#F97316] transition-colors whitespace-nowrap font-medium">
                        <span suppressHydrationWarning>{t("common.all", "All")}</span>
                        <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-[#F97316]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onClick={() => navigate("/shop")} className="focus:bg-orange-50 focus:text-[#F97316] cursor-pointer">
                            {t("nav.shop")}
                        </DropdownMenuItem>
                         {navLinks.find(n => n.id === 'categories')?.children?.map(cat => (
                             <DropdownMenuItem key={cat.id} onClick={() => navigate(cat.href)} className="focus:bg-orange-50 focus:text-[#F97316] cursor-pointer">
                                 {cat.label}
                             </DropdownMenuItem>
                         ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                            {/* Input Field */}
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onKeyDown={(e) => {
                                if (e.key === "Enter" && searchQuery.trim()) {
                                    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                                    setSearchResults([]);
                                    setIsSearchOpen(false);
                                }
                                }}
                                placeholder={t("common.searchProducts", "Search Babyisland...")}
                                className="flex-1 h-full px-4 text-sm text-black border-none outline-none placeholder:text-gray-500" 
                                suppressHydrationWarning
                            />

                            {/* Search Button (Orange) */}
                            <button
                                onClick={() => {
                                    if (searchQuery.trim()) {
                                        navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                                        setSearchResults([]);
                                        setIsSearchOpen(false);
                                    }
                                }}
                                className="h-full px-6 bg-[#F97316] hover:bg-[#ea580c] transition-colors flex items-center justify-center text-white"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" strokeWidth={2.5} />
                            </button>
                            </div>
                            
                            {searchQuery && searchResults.length > 0 && (
                                <div className="absolute top-16 left-4 right-4 z-50">
                                <SearchResults
                                results={searchResults}
                                isLoading={isLoadingSearch}
                                query={searchQuery}
                                onClose={() => {
                                    setSearchResults([]);
                                    setSearchQuery("");
                                }}
                                />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                <Search className="w-5 h-5 absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 text-black/40" />
                <input
                  type="text"
                  placeholder={t("common.searchProducts", "Search for products...")}
                  className="w-full h-12 ltr:pl-12 rtl:pr-12 pr-4 bg-[#F0F0F0] rounded-full text-sm focus:outline-none" suppressHydrationWarning
                />
              </div>

              {navLinks.map((link) => (
                <div key={link.id}>
                  {link.children ? (
                    <div>
                      <button
                        className="w-full flex items-center justify-between py-3 text-[#0EA5E9] font-medium hover:text-[#F97316] transition-colors"
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
                                key={child.id}
                                href={child.href}
                                className="block py-2 text-[#0EA5E9]/80 hover:text-[#F97316] transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <span suppressHydrationWarning>{child.label}</span>
                              </LocaleLink>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <LocaleLink
                      href={link.href}
                      className="block py-3 text-[#0EA5E9] font-medium hover:text-[#F97316] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span suppressHydrationWarning>{link.label}</span>
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
                        const currentPath = pathname;
                        if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
                          sessionStorage.setItem("redirectAfterLogin", currentPath);
                        }
                        navigate("/login");
                      }}
                    >
                      <span suppressHydrationWarning>{t("nav.login", "Sign In")}</span>
                    </button>
                    <LocaleLink
                      href="/register"
                      className="block py-3 text-black font-medium hover:text-black/60"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span suppressHydrationWarning>{t("nav.register", "Register")}</span>
                    </LocaleLink>
                  </>
                ) : (
                  <>
                    {user?.role === "admin" ? (
                      <LocaleLink
                        href="/admin"
                        className="block py-3 text-black font-medium hover:text-black/60"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span suppressHydrationWarning>{t("nav.dashboard")}</span>
                      </LocaleLink>
                    ) : (
                      <LocaleLink
                        href="/account"
                        className="block py-3 text-black font-medium hover:text-black/60"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span suppressHydrationWarning>{t("nav.account")}</span>
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
                      <span suppressHydrationWarning>{t("nav.logout")}</span>
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

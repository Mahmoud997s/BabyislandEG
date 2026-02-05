import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/use-settings";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocaleLink } from "@/components/LocaleLink";

export function Footer() {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const footerLinks = {
    quickLinks: [
      { href: "/", label: t('nav.home') },
      { href: "/shop", label: t('nav.shop') },
      { href: "/about", label: t('nav.about') },
      { href: "/contact", label: t('nav.contact') },
    ],
    categories: [
      { href: "/shop?category=strollers-gear", label: t('categories.strollersGear') },
      { href: "/shop?category=feeding", label: t('categories.feeding') },
      { href: "/shop?category=toys", label: t('categories.toys') },
      { href: "/shop?category=nursery", label: t('categories.nursery') },
      { href: "/shop?category=bathing", label: t('categories.bathing') },
    ],
    customerService: [
      { href: "/track-order", label: t('nav.trackOrder') },
      { href: "/account", label: t('nav.account') },
      { href: "/contact", label: t('footer.customerSupport', 'Customer Support') },
      { href: "/shipping", label: t('footer.shippingInfo', 'Shipping Info') },
    ],
  };

  return (
    <footer className="bg-transparent">
      {/* Newsletter Section */}
      <section className="bg-black text-white py-8 lg:py-10">
        <div className="container-main">
          <div className="bg-black rounded-[20px] p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6">
            <h2 className="text-2xl lg:text-4xl font-black uppercase max-w-xl text-center lg:text-left">
              {t('footer.newsletterTitle', 'STAY UP TO DATE ABOUT OUR LATEST OFFERS')}
            </h2>

            <div className="w-full lg:w-auto flex flex-col gap-3 min-w-[350px]">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder={t('footer.emailPlaceholder', 'Enter your email address')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 pr-4 py-6 rounded-full bg-white text-black border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                className="w-full py-6 rounded-full bg-white text-black hover:bg-gray-100 font-semibold"
                onClick={() => {
                  console.log('Subscribe:', email);
                  setEmail('');
                }}
              >
                {t('footer.subscribeNewsletter', 'Subscribe to Newsletter')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <section className="bg-[#F0F0F0] pt-12 pb-6">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-8">
            {/* Logo & About */}
            <div className="lg:col-span-3">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <img
                  src="/babyisland_logo_exact.png"
                  alt="BabyislandEG"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-black leading-tight" style={{ fontFamily: "'Nexa', sans-serif" }}>
                    <span className="text-foreground">Babyisland</span>
                    <span className="text-[#F97316]">EG</span>
                  </span>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {t('footer.aboutDesc', 'Your trusted destination for all baby essentials. Quality products for your little ones.')}
              </p>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <a href="tel:+201234567890" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">+20 123 456 7890</span>
                </a>
                <a href="https://wa.me/201234567890" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('footer.whatsapp', 'WhatsApp')}</span>
                </a>
                <a href="mailto:info@babyislandeg.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>info@babyislandeg.com</span>
                </a>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {settings?.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-9 h-9 border-gray-200 hover:bg-black hover:text-white transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                  </a>
                )}
                {settings?.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-9 h-9 border-gray-200 hover:bg-black hover:text-white transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </Button>
                  </a>
                )}
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-9 h-9 border-gray-200 hover:bg-black hover:text-white transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-base uppercase tracking-wider mb-6">
                {t('footer.quickLinks', 'Quick Links')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.href}>
                    <LocaleLink
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-base uppercase tracking-wider mb-6">
                {t('nav.categories')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.categories.map((link) => (
                  <li key={link.href}>
                    <LocaleLink
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-base uppercase tracking-wider mb-6">
                {t('footer.customerService', 'Customer Service')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.customerService.map((link) => (
                  <li key={link.href}>
                    <LocaleLink
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Address */}
            <div className="lg:col-span-3">
              <h3 className="font-bold text-base uppercase tracking-wider mb-6">
                {t('footer.address', 'Address')}
              </h3>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{t('footer.fullAddress', 'Cairo, Egypt')}</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} BabyislandEG. {t('footer.allRightsReserved', 'All Rights Reserved')}
            </p>

            {/* Payment Icons */}
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-white rounded border border-gray-200">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-5 w-auto" />
              </div>
              <div className="px-2 py-1 bg-white rounded border border-gray-200">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 w-auto" />
              </div>
              <div className="px-2 py-1 bg-white rounded border border-gray-200">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 w-auto" />
              </div>
              <div className="px-2 py-1 bg-white rounded border border-gray-200">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Pay" className="h-4 w-auto" />
              </div>
              <div className="px-2 py-1 bg-white rounded border border-gray-200">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-5 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

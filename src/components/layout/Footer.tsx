"use client";

import { LocaleLink } from "@/components/LocaleLink";
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
import { Logo } from "@/components/ui/Logo";

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
    <footer className="bg-transparent mt-20">
      {/* Newsletter Section - Floating Card */}
      <div className="container-main relative z-10">
        <div className="bg-black rounded-[20px] p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex flex-col gap-4 items-center lg:items-start text-center lg:text-start">
            {/* Logo Moved Here */}
            {/* Logo Moved Here */}
            <LocaleLink href="/">
              <Logo />
            </LocaleLink>
            
            <h2 className="text-xl lg:text-3xl font-bold uppercase max-w-xl text-white">
              {t('footer.newsletterTitle', 'STAY UP TO DATE ABOUT OUR LATEST OFFERS')}
            </h2>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-3 min-w-[350px]">
            <Button 
              asChild 
              className="w-full py-6 rounded-full bg-white text-black hover:bg-gray-100 font-bold uppercase tracking-wide text-lg shadow-sm hover:scale-[1.02] transition-transform"
            >
              <LocaleLink href="/register">
                {t('nav.register', 'Register')}
              </LocaleLink>
            </Button>
            
            <Button 
              asChild 
              className="w-full py-6 rounded-full bg-[#0EA5E9] text-white hover:bg-[#0284C7] font-bold uppercase tracking-wide text-lg shadow-lg hover:scale-[1.02] transition-transform border-0"
            >
              <LocaleLink href="/login">
                {t('nav.login', 'Login')}
              </LocaleLink>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer - Overlapped Background */}
      <section className="bg-[#F0F0F0] -mt-24 pt-32 pb-6 relative z-0">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-8">
            {/* About & Contact - Adjusted Grid Span and Removed Logo */}
            <div className="lg:col-span-4">
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                {t('footer.aboutDesc', 'Your trusted destination for all baby essentials. Quality products for your little ones.')}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <a href="tel:+201062185805" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-[#0EA5E9] transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Phone className="w-4 h-4 text-[#0EA5E9]" />
                  </div>
                  <span dir="ltr" className="font-semibold">+20 106 218 5805</span>
                </a>
                <a href="https://wa.me/201062185805" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-[#25D366] transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <span className="font-semibold">{t('footer.whatsapp', 'WhatsApp')}</span>
                </a>
                <a href="mailto:info@babyislandeg.com" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-[#F97316] transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Mail className="w-4 h-4 text-[#F97316]" />
                  </div>
                  <span className="font-semibold">info@babyislandeg.com</span>
                </a>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                  <a href="https://www.facebook.com/babyislandeg" target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-10 h-10 border-gray-200 bg-white hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all shadow-sm"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </Button>
                  </a>
                  <a href="https://www.instagram.com/babyislandeg" target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-10 h-10 border-gray-200 bg-white hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F] transition-all shadow-sm"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </Button>
                  </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2 lg:col-start-6">
              <h3 className="font-bold text-base uppercase tracking-wider mb-6 text-[#1e293b]">
                {t('footer.quickLinks', 'Quick Links')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.href}>
                    <LocaleLink
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-[#0EA5E9] hover:translate-x-1 transition-all inline-block"
                    >
                      {link.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-base uppercase tracking-wider mb-6 text-[#1e293b]">
                {t('nav.categories')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.categories.map((link) => (
                  <li key={link.href}>
                    <LocaleLink
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-[#0EA5E9] hover:translate-x-1 transition-all inline-block"
                    >
                      {link.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div className="lg:col-span-2 lg:col-end-13">
              <h3 className="font-bold text-base uppercase tracking-wider mb-6 text-[#1e293b]">
                {t('footer.customerService', 'Customer Service')}
              </h3>
              <ul className="space-y-3">
                {footerLinks.customerService.map((link) => (
                  <li key={link.href}>
                    <LocaleLink
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-[#0EA5E9] hover:translate-x-1 transition-all inline-block"
                    >
                      {link.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200/60 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
               <p className="text-sm text-muted-foreground font-medium">
                © {currentYear} BabyislandEG. {t('footer.allRightsReserved', 'All Rights Reserved')}
              </p>
              <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300" />
               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-[#F97316]" />
                <span>{t('footer.fullAddress', 'Cairo, Egypt')}</span>
              </div>
            </div>

            {/* Payment Icons */}
            <div className="flex items-center gap-2 opacity-80 grayscale hover:grayscale-0 transition-all">
              <div className="px-2 py-1 bg-white rounded border border-gray-200 shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-4 w-auto" />
              </div>
              <div className="px-2 py-1 bg-white rounded border border-gray-200 shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 w-auto" />
              </div>
              <div className="px-2 py-1 bg-white rounded border border-gray-200 shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 w-auto" />
              </div>
              <div className="px-2 py-1 bg-white rounded border border-gray-200 shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Pay" className="h-3.5 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}

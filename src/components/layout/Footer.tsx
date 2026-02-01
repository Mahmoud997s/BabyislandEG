import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  quickLinks: [
    { href: "/", label: "الرئيسية" },
    { href: "/shop", label: "المتجر" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "تواصل معنا" },
  ],
  customerService: [
    { href: "/shipping", label: "الشحن والإرجاع" },
    { href: "/privacy", label: "سياسة الخصوصية" },
    { href: "/terms", label: "الشروط والأحكام" },
  ],
  categories: [
    { href: "/shop?category=lightweight", label: "خفيفة الوزن" },
    { href: "/shop?category=travel-system", label: "نظام السفر" },
    { href: "/shop?category=twin", label: "توأم" },
    { href: "/shop?category=jogger", label: "رياضية" },
    { href: "/shop?category=premium", label: "فاخرة" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container-main py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground flex items-center justify-center">
                <span className="text-primary font-bold text-lg">ب</span>
              </div>
              <span className="text-xl font-bold">بيبي ستورز</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              نحن متخصصون في توفير أفضل عربات الأطفال الفاخرة من أشهر الماركات
              العالمية. نهتم براحة طفلك وسلامته.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">خدمة العملاء</h3>
            <ul className="space-y-3">
              {footerLinks.customerService.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-primary-foreground/80">
                  القاهرة، مصر الجديدة
                  <br />
                  شارع الميرغني، عمارة 25
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 shrink-0" />
                <a
                  href="tel:+201234567890"
                  className="text-primary-foreground/80 hover:text-primary-foreground ltr"
                >
                  +20 123 456 7890
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 shrink-0" />
                <a
                  href="mailto:info@babystores.eg"
                  className="text-primary-foreground/80 hover:text-primary-foreground"
                >
                  info@babystores.eg
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container-main py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/80">
            © {new Date().getFullYear()} بيبي ستورز. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4">
            <img
              src="/placeholder.svg"
              alt="Visa"
              className="h-6 opacity-80"
            />
            <img
              src="/placeholder.svg"
              alt="Mastercard"
              className="h-6 opacity-80"
            />
            <img
              src="/placeholder.svg"
              alt="Vodafone Cash"
              className="h-6 opacity-80"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

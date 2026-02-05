import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, ShoppingBag, LogOut, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export default function AccountPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    if (!user) {
        return null; // ProtectedRoute handles redirect
    }

    return (
        <Layout>
            <section className="py-8 lg:py-12">
                <div className="container-main max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">{t("account.title")}</h1>
                                    <p className="text-muted-foreground text-sm">{t("account.welcome")}, {user.name}</p>
                                </div>
                            </div>
                            {user.role === "admin" && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link to="/admin">
                                        <Settings className="w-4 h-4 ml-2" />
                                        {t("account.adminPanel")}
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {/* Profile Card */}
                        <div className="bg-card rounded-xl p-6 mb-6">
                            <h2 className="text-lg font-semibold mb-4">{t("account.profileInfo")}</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("account.name")}</p>
                                        <p className="font-medium">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("account.email")}</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t("account.phone")}</p>
                                        <p className="font-medium">{user.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders Section */}
                        <div className="bg-card rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold">{t("account.orders")}</h2>
                            </div>

                            {(() => {
                                // Dynamic import or use useEffect in real app, but here direct import is fine as services are isomorphic
                                // However to avoid circular dependencies if any, we can do this inside component or just import at top if safe.
                                // Safe to import at top as orderService doesn't depend on components.
                                const { orderService } = require("../services/orderService");
                                const orders = orderService.getUserOrders(user.id);
                                const isRTL = i18n.language === "ar";

                                if (orders.length === 0) {
                                    return (
                                        <div className="text-center py-8">
                                            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-muted-foreground">{t("account.noOrders")}</p>
                                            <Button variant="outline" className="mt-4" asChild>
                                                <Link to="/shop">{t("account.startShopping")}</Link>
                                            </Button>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-4">
                                        {orders.map((order: any) => (
                                            <div key={order.id} className="border rounded-lg p-4">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                                    <div>
                                                        <p className="font-semibold text-sm">{order.id}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(order.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-EG')}
                                                        </p>
                                                    </div>
                                                    <div className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                        {t(`account.status.${order.status}`)}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-3">
                                                    {order.items.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">
                                                                {item.quantity}x {isRTL && item.product.nameAr ? item.product.nameAr : item.product.name}
                                                            </span>
                                                            <span>
                                                                {(item.product.price * item.quantity).toLocaleString(isRTL ? "ar-EG" : "en-EG")} {t("common.currency")}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex justify-between items-center pt-3 border-t text-sm font-semibold">
                                                    <span>{t("account.totalOrder")}</span>
                                                    <span>{order.total.toLocaleString(isRTL ? "ar-EG" : "en-EG")} {t("common.currency")}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Logout Button */}
                        <Button
                            variant="destructive"
                            className="w-full"
                            size="lg"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 ml-2" />
                            {t("account.logout")}
                        </Button>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
}

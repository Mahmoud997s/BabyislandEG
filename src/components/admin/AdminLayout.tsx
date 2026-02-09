"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LocaleLink } from "@/components/LocaleLink";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    Menu,
    X,
    BarChart3,
    Users,
    Tag,
    FileBarChart,
    MessageSquare,
    Shield,
    Zap,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    const menuGroups = [
        {
            title: "Home",
            items: [
                { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
            ]
        },
        {
            title: "Operations",
            items: [
                { label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
                { label: "Customers", icon: Users, path: "/admin/customers" },
                { label: "Reviews", icon: MessageSquare, path: "/admin/reviews" },
            ]
        },
        {
            title: "Catalog",
            items: [
                { label: "Products", icon: Package, path: "/admin/products" },
                { label: "Discounts", icon: Tag, path: "/admin/discounts" },
                { label: "Flash Sales", icon: Zap, path: "/admin/flash-sales" },
                { label: "Reclassify", icon: RefreshCw, path: "/admin/reclassify" }, // Added for convenience based on previous context
            ]
        },
        {
            title: "Analytics",
            items: [
                { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
                { label: "Reports", icon: FileBarChart, path: "/admin/reports" },
            ]
        },
        {
            title: "System",
            items: [
                { label: "Roles & Permissions", icon: Shield, path: "/admin/roles" },
                { label: "Settings", icon: Settings, path: "/admin/settings" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans" dir="ltr">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-xl transition-transform duration-300 lg:translate-x-0 lg:static lg:shrink-0 flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo Area */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <LocaleLink href="/" className="flex items-center gap-3 group">
                        <img
                            src="/babyisland_logo_exact.png"
                            alt="BabyislandEG"
                            className="w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110 shadow-sm ring-2 ring-slate-50"
                        />
                        <div className="flex flex-col items-start gap-0">
                            <span className="text-xl font-black tracking-tight leading-none text-slate-900">
                                Babyisland<span className="text-[#F97316]">.</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Control Panel
                            </span>
                        </div>
                    </LocaleLink>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 no-scrollbar">
                    {menuGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="mb-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
                                    return (
                                        <LocaleLink
                                            key={item.path}
                                            href={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                                isActive
                                                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "w-4 h-4 transition-colors",
                                                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                                            )} />
                                            <span>{item.label}</span>
                                        </LocaleLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-lg transition-all duration-200 font-medium group"
                    >
                        <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
                    <h1 className="font-bold text-slate-800 text-lg">Dashboard</h1>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="text-[#0EA5E9]">
                        <Menu className="w-6 h-6" />
                    </Button>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}

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
    Zap
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

    const menuItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        { label: "Products", icon: Package, path: "/admin/products" },
        { label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
        { label: "Customers", icon: Users, path: "/admin/customers" },
        { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
        { label: "Reports", icon: FileBarChart, path: "/admin/reports" },
        { label: "Discounts", icon: Tag, path: "/admin/discounts" },
        { label: "Flash Sales", icon: Zap, path: "/admin/flash-sales" },
        { label: "Reviews", icon: MessageSquare, path: "/admin/reviews" },
        { label: "Roles & Permissions", icon: Shield, path: "/admin/roles" },
        { label: "Settings", icon: Settings, path: "/admin/settings" },
    ];



    return (
        <div className="min-h-screen bg-slate-50 flex font-sans" dir="ltr">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-2xl shadow-slate-200/50 transition-transform duration-300 lg:translate-x-0 lg:static lg:shrink-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <LocaleLink href="/" className="flex items-center gap-3 group">
                            <img
                                src="/babyisland_logo_exact.png"
                                alt="BabyislandEG"
                                className="w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md ring-2 ring-white/50"
                            />
                            <div className="flex flex-col items-start gap-0">
                                <span className="text-xl font-black transition-all duration-300 group-hover:tracking-wide drop-shadow-sm leading-tight" style={{ fontFamily: "'Nexa', sans-serif" }}>
                                    <span className="text-[#0EA5E9]">Babyisland</span>
                                    <span className="text-[#F97316]">EG</span>
                                </span>
                                <span className="text-[9px] font-bold text-[#F97316] tracking-wider uppercase -mt-0.5" style={{ fontFamily: "'Chewy', cursive" }}>
                                    Admin Dashboard
                                </span>
                            </div>
                        </LocaleLink>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <LocaleLink
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                        isActive
                                            ? "bg-[#0EA5E9]/10 text-[#0EA5E9] font-bold shadow-sm translate-x-1"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium hover:translate-x-1"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#0EA5E9] rounded-r-full" />
                                    )}
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-[#0EA5E9]" : "text-slate-400 group-hover:text-slate-600"
                                    )} />
                                    <span>{item.label}</span>
                                </LocaleLink>
                            );
                        })}
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 w-full rounded-xl transition-all duration-200 font-bold group"
                        >
                            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <span>Logout</span>
                        </button>
                    </div>
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

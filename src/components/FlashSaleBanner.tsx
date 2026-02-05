import { useEffect, useState } from "react";
import { flashSalesService, FlashSale } from "@/services/flashSalesService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface FlashSaleBannerProps {
    productId?: number;
    category?: string;
    onDiscountChange?: (discount: number) => void;
}

export function FlashSaleBanner({ productId, category, onDiscountChange }: FlashSaleBannerProps) {
    const [activeSales, setActiveSales] = useState<FlashSale[]>([]);
    const [currentSale, setCurrentSale] = useState<FlashSale | null>(null);
    const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        loadSales();
        const interval = setInterval(loadSales, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeSales.length > 0 && productId) {
            const { discount, sale } = flashSalesService.getDiscountForProduct(activeSales, productId, category);
            setCurrentSale(sale);
            if (onDiscountChange) {
                onDiscountChange(discount);
            }
        }
    }, [activeSales, productId, category]);

    useEffect(() => {
        if (!currentSale) return;

        const updateCountdown = () => {
            const remaining = flashSalesService.calculateTimeRemaining(currentSale.ends_at);
            setTimeRemaining(remaining);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [currentSale]);

    const loadSales = async () => {
        const sales = await flashSalesService.getActiveSales();
        setActiveSales(sales);
    };

    if (!currentSale) return null;

    const isExpiringSoon = timeRemaining.days === 0 && timeRemaining.hours < 3;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
        >
            <Card className={`border-0 shadow-lg ${isExpiringSoon ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-gradient-to-r from-amber-50 to-yellow-50'}`}>
                <div className="p-4" dir="rtl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                            <Flame className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{currentSale.name}</h3>
                            {currentSale.description && (
                                <p className="text-sm text-slate-600">{currentSale.description}</p>
                            )}
                        </div>
                        <Badge className="bg-red-500 hover:bg-red-600 text-white text-lg px-3 py-1">
                            خصم {currentSale.discount_percentage}%
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-orange-600">ينتهي خلال:</span>
                        <div className="flex gap-2 font-mono font-bold">
                            {timeRemaining.days > 0 && (
                                <span className="bg-white px-2 py-1 rounded">{timeRemaining.days} يوم</span>
                            )}
                            <span className="bg-white px-2 py-1 rounded">{timeRemaining.hours.toString().padStart(2, '0')}</span>
                            <span>:</span>
                            <span className="bg-white px-2 py-1 rounded">{timeRemaining.minutes.toString().padStart(2, '0')}</span>
                            <span>:</span>
                            <span className="bg-white px-2 py-1 rounded">{timeRemaining.seconds.toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

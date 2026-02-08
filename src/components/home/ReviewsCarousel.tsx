"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Star, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

interface Review {
    id: string;
    name: string;
    nameAr: string;
    rating: number;
    text: string;
    textAr: string;
    verified: boolean;
}

// Sample reviews data - can be moved to a separate file or fetched from DB
const reviews: Review[] = [
    {
        id: "1",
        name: "Sarah Mahmoud",
        nameAr: "سارة محمود",
        rating: 5,
        text: "This is truly a masterpiece! I ordered the twin stroller and it arrived the next day. Excellent quality and very classy service. Thank you Baby Island!",
        textAr: "بجد تحفة! طلبت عربية التوائم ووصلتني تاني يوم. الخامات ممتازة والتعامل راقي جداً. شكراً بيبي ايلاند!",
        verified: true,
    },
    {
        id: "2",
        name: "Ahmed Hassan",
        nameAr: "أحمد حسن",
        rating: 5,
        text: "I bought a car seat for my child and it was excellent. The most important thing is safety, and that's what I found in your products. Customer service helped me a lot in choosing.",
        textAr: "اشتريت كارسيت لطفلي وكان ممتاز. أهم حاجة الأمان وده اللي لقيته في منتجاتكم. خدمة العملاء ساعدوني جداً في الاختيار.",
        verified: true,
    },
    {
        id: "3",
        name: "Mai Ezz El-Din",
        nameAr: "مي عز الدين",
        rating: 5,
        text: "The bag I ordered is very spacious and takes everything the baby needs. Honestly, the quality is above excellent and the price is very suitable compared to the market.",
        textAr: "الشنطة اللي طلبتها واسعة جداً وبتاخد كل حاجة البيبي. بصراحة الكواليتي فوق الممتاز والسعر مناسب جداً مقارنة بالسوق.",
        verified: true,
    },
    {
        id: "4",
        name: "Mohamed Ali",
        nameAr: "محمد علي",
        rating: 4,
        text: "I ordered a walker and a crib, the items arrived very well packaged and exactly like the pictures. An excellent buying experience and I will definitely repeat it.",
        textAr: "طلبت مشاية وسرير، الحاجة وصلت متغلفة كويس جداً ونفس الصور بالظبط. تجربة شراء ممتازة وهكررها تاني أكيد.",
        verified: true,
    },
    {
        id: "5",
        name: "Noha Karim",
        nameAr: "نهى كريم",
        rating: 5,
        text: "The stroller is very light and easy to fold, it helps me a lot when going out alone. Thank you for the credibility and speed.",
        textAr: "العربية خفيفة جداً وسهلة في الطي، بتنفعني جداً في الخروج لوحدي. شكراً على المصداقية والسرعة.",
        verified: true,
    },
    {
        id: "6",
        name: "Karim Magdy",
        nameAr: "كريم مجدي",
        rating: 5,
        text: "Thank you very much for your taste in dealing. The product arrived on time and the representative was very respectful. Good luck to you.",
        textAr: "بشكركم جداً على ذوقكم في التعامل. المنتج وصل في ميعاده والمندوب كان محترم جداً. بالتوفيق ليكم.",
        verified: true,
    }
];

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={cn(
                        "w-4 h-4 lg:w-5 lg:h-5",
                        i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                    )}
                />
            ))}
        </div>
    );
};

export const ReviewsCarousel = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";
    const direction = i18n.dir();

    return (
        <section className="py-12 lg:py-16 bg-gray-50">
            <div className="container-main">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl lg:text-4xl font-extrabold uppercase tracking-tight">
                        {t("home.happyCustomers", "OUR HAPPY CUSTOMERS")}
                    </h2>
                </div>

                {/* Carousel */}
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                        direction: direction as "rtl" | "ltr",
                    }}
                    plugins={[
                        Autoplay({ delay: 4000, stopOnInteraction: false }),
                    ]}
                    className="w-full"
                    dir={direction}
                >
                    <CarouselContent className="-ml-4">
                        {reviews.map((review) => (
                            <CarouselItem
                                key={review.id}
                                className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                            >
                                <div className="bg-white rounded-2xl p-6 h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Stars */}
                                    <StarRating rating={review.rating} />

                                    {/* Name with verified badge */}
                                    <div className="flex items-center gap-2 mt-4 mb-3">
                                        <span className="font-bold text-base lg:text-lg">
                                            {isRTL ? review.nameAr : review.name}
                                        </span>
                                        {review.verified && (
                                            <BadgeCheck className="w-5 h-5 text-green-500 fill-green-500" />
                                        )}
                                    </div>

                                    {/* Review text */}
                                    <p className="text-sm lg:text-base text-gray-600 leading-relaxed line-clamp-4">
                                        "{isRTL ? review.textAr : review.text}"
                                    </p>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Navigation Arrows */}
                    <div className="hidden md:flex items-center gap-2 absolute top-0 end-0 -translate-y-[calc(100%+2rem)]">
                        <CarouselPrevious className="relative inset-0 translate-x-0 translate-y-0 bg-white hover:bg-gray-100 border border-gray-200 h-10 w-10 rounded-full" />
                        <CarouselNext className="relative inset-0 translate-x-0 translate-y-0 bg-white hover:bg-gray-100 border border-gray-200 h-10 w-10 rounded-full" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
};

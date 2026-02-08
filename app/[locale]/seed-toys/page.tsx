"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const toys = [
    // Extracted Real Products
    {
        name: "Fisher-Price Baby's First Blocks",
        name_ar: "مكعبات بيبيز فيرست من فيشر-برايس",
        description: "Colorful blocks to help baby learn colors and shapes. Includes storage bucket.",
        description_ar: "مكعبات ملونة لتعلم الألوان والأشكال مع دلو تخزين.",
        price: 240,
        category: "toys",
        brand: "Fisher-Price",
        stock: 15,
        images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "LotFancy Montessori Sorting Toys",
        name_ar: "ألعاب مونتيسوري للفرز والتكديس - لوت فانسي",
        description: "Wooden sorting and stacking toys for toddlers. Educational and fun.",
        description_ar: "ألعاب خشبية للفرز والتكديس للأطفال الصغار.",
        price: 185,
        category: "toys",
        brand: "LotFancy",
        stock: 20,
        images: ["https://images.unsplash.com/photo-1587654780291-39c940483713?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Wooden Sorting & Stacking Toy",
        name_ar: "لعبة فرز وتكديس خشبية تعليمية",
        description: "Educational toy for color recognition and fine motor skills.",
        description_ar: "لعبة تعليمية للتعرف على الألوان والمهارات الحركية.",
        price: 135,
        category: "toys",
        brand: "Generic",
        stock: 25,
        images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Montessori 8-in-1 Educational Toy",
        name_ar: "لعبة مونتيسوري 8 في 1",
        description: "Multifunctional toy including fishing game and xylophone.",
        description_ar: "لعبة متعددة الوظائف مع صيد السمك وإكسيليفون.",
        price: 714,
        category: "toys",
        brand: "Generic",
        stock: 8,
        images: ["https://images.unsplash.com/photo-1599624765320-b38466e0172e?q=80&w=1925&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "KidsZone Wooden Shape Puzzle",
        name_ar: "أحجية خشبية للأشكال - كيدززون",
        description: "Geometric stacking puzzle with colorful blocks.",
        description_ar: "أحجية هندسية مع مكعبات ملونة.",
        price: 80,
        category: "toys",
        brand: "KidsZone",
        stock: 30,
        images: ["https://images.unsplash.com/photo-1515488042361-ee0065ab4d28?q=80&w=1924&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Giada Interactive Learning Puzzle",
        name_ar: "بازل تعليمي تفاعلي - جيادا",
        description: "Interactive puzzle with sounds for problem solving.",
        description_ar: "بازل تفاعلي بالأصوات لحل المشكلات.",
        price: 202,
        category: "toys",
        brand: "Giada",
        stock: 12,
        images: ["https://images.unsplash.com/photo-1566576912902-1d5db042537c?q=80&w=2070&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Clementoni Soft Car",
        name_ar: "سيارة كليمي ناعمة - كليمينتوني",
        description: "Soft car for safe play and movement.",
        description_ar: "سيارة ناعمة للعب الآمن والحركة.",
        price: 940,
        category: "toys",
        brand: "Clementoni",
        stock: 5,
        images: ["https://images.unsplash.com/photo-1557958947-f0d5c02b1f0c?q=80&w=2062&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "ABC Shape Sorter Bucket",
        name_ar: "دلو فرز الأشكال ABC",
        description: "Bucket with handle and alphabet blocks.",
        description_ar: "دلو بمقبض ومكعبات الحروف.",
        price: 186,
        category: "toys",
        brand: "Baby First",
        stock: 18,
        images: ["https://images.unsplash.com/photo-1533230978931-1589d892784d?q=80&w=1887&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Nilco Linking Toy",
        name_ar: "لعبة الربط التعليمية - نيلكو",
        description: "Helps children learn linking and stacking.",
        description_ar: "تساعد الأطفال على تعلم الربط والتكديس.",
        price: 105,
        category: "toys",
        brand: "Nilco",
        stock: 22,
        images: ["https://images.unsplash.com/photo-1532330393533-443990a51d10?q=80&w=2070&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Induction Mini Flyer",
        name_ar: "لعبة الطائرة الصغيرة بالحث",
        description: "Flying toy for active play.",
        description_ar: "لعبة طائرة للعب النشط.",
        price: 150,
        category: "toys",
        brand: "Generic",
        stock: 10,
        images: ["https://images.unsplash.com/photo-1530919424119-40b49cb42ce0?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Portal Shape Set",
        name_ar: "طقم تشكيل الأشكال - بورتال",
        description: "Plastic shape set for creativity.",
        description_ar: "طقم تشكيل بلاستيكي للإبداع.",
        price: 142,
        category: "toys",
        brand: "Portal",
        stock: 15,
        images: ["https://images.unsplash.com/photo-1518991658073-6388606d1e7c?q=80&w=2070&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "KidsZone Duck Ring Stacker",
        name_ar: "حلقات تكديس البطة - كيدززون",
        description: "Colorful ring stacker with duck head.",
        description_ar: "حلقات تكديس ملونة برأس بطة.",
        price: 80,
        category: "toys",
        brand: "KidsZone",
        stock: 25,
        images: ["https://images.unsplash.com/photo-1618842676088-77d919864d4b?q=80&w=2169&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Stacking Cups with Bear Head",
        name_ar: "أكواب تكديس برأس دبدوب",
        description: "Nested stacking cups for toddlers.",
        description_ar: "أكواب تكديس متداخلة للأطفال.",
        price: 150,
        category: "toys",
        brand: "KidsZone",
        stock: 30,
        images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "RB&G Safari Wooden Puzzle",
        name_ar: "بازل خشب سفاري - ار بي اند جي",
        description: "Large wooden puzzle with safari animals.",
        description_ar: "بازل خشب كبير بحيوانات السفاري.",
        price: 155,
        category: "toys",
        brand: "RB&G",
        stock: 12,
        images: ["https://images.unsplash.com/photo-1515488042361-ee0065ab4d28?q=80&w=1924&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Montessori Sensory Cube",
        name_ar: "مكعب مونتيسوري الحسي",
        description: "Sensory cube with shapes for infants.",
        description_ar: "مكعب حسي بالأشكال للرضع.",
        price: 290,
        category: "toys",
        brand: "Generic",
        stock: 10,
        images: ["https://images.unsplash.com/photo-1587654780291-39c940483713?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Egg Matching Toy",
        name_ar: "لعبة تطابق البيض",
        description: "6 piece egg matching set for color and shape.",
        description_ar: "مجموعة تطابق البيض 6 بقطع للألوان والأشكال.",
        price: 95,
        category: "toys",
        brand: "Generic",
        stock: 40,
        images: ["https://images.unsplash.com/photo-1558284852-5a2a297e6429?q=80&w=2070&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Catch Ball Racket Set",
        name_ar: "مضرب كاتش بول دائري",
        description: "Velcro catch ball game for outdoors.",
        description_ar: "لعبة مضرب الكرة اللاصقة للعب الخارجي.",
        price: 103,
        category: "toys",
        brand: "Generic",
        stock: 20,
        images: ["https://images.unsplash.com/photo-1530919424119-40b49cb42ce0?q=80&w=2070&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Wonka Wooden Connection Toy",
        name_ar: "لعبة توصيل خشبية - ونكا",
        description: "Wooden connection puzzle for fine motor skills.",
        description_ar: "بازل توصيل خشبي للمهارات الحركية.",
        price: 90,
        category: "toys",
        brand: "Wonka",
        stock: 15,
        images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Wooden Tic Tac Toe",
        name_ar: "لعبة إكس أو خشبية",
        description: "Classic Tic Tac Toe game in wood.",
        description_ar: "لعبة إكس أو الكلاسيكية من الخشب.",
        price: 76,
        category: "toys",
        brand: "Generic",
        stock: 50,
        images: ["https://images.unsplash.com/photo-1611604548018-d56bbd85d681?q=80&w=2070&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Cartoon Animal Puzzle",
        name_ar: "بازل حيوانات كرتونية",
        description: "24 piece wooden puzzle with bright colors.",
        description_ar: "بازل خشبي 24 قطعة بألوان زاهية.",
        price: 220,
        category: "toys",
        brand: "Generic",
        stock: 18,
        images: ["https://images.unsplash.com/photo-1515488042361-ee0065ab4d28?q=80&w=1924&auto=format&fit=crop"],
        isNew: true
    },

    // Generated Variations to reach 36
    {
        name: "Wooden Block Train",
        name_ar: "قطار مكعبات خشبي",
        description: "Pull-along train with stacking blocks.",
        description_ar: "قطار سحب مع مكعبات تكديس.",
        price: 180,
        category: "toys",
        brand: "Generic",
        stock: 12,
        images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Soft Building Blocks",
        name_ar: "مكعبات بناء ناعمة",
        description: "Squeezable soft blocks for babies.",
        description_ar: "مكعبات ناعمة قابلة للضغط للرضع.",
        price: 210,
        category: "toys",
        brand: "BabySafe",
        stock: 15,
        images: ["https://images.unsplash.com/photo-1587654780291-39c940483713?q=80&w=2070&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Geometric Shape Sorter",
        name_ar: "فارز الأشكال الهندسية",
        description: "Advanced shape sorter with 12 shapes.",
        description_ar: "فارز أشكال متطور بـ 12 شكل.",
        price: 165,
        category: "toys",
        brand: "Generic",
        stock: 20,
        images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Musical Stacking Rings",
        name_ar: "حلقات تكديس موسيقية",
        description: "Stacking rings that play music when stacked.",
        description_ar: "حلقات تكديس تصدر موسيقى عند التركيب.",
        price: 310,
        category: "toys",
        brand: "Fisher-Price",
        stock: 8,
        images: ["https://images.unsplash.com/photo-1618842676088-77d919864d4b?q=80&w=2169&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Wooden Abacus",
        name_ar: "عداد خشبي تعليمي",
        description: "Colorful wooden abacus for counting.",
        description_ar: "عداد خشبي ملون لتعلم العد.",
        price: 120,
        category: "toys",
        brand: "Generic",
        stock: 30,
        images: ["https://images.unsplash.com/photo-1515488042361-ee0065ab4d28?q=80&w=1924&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Rainbow Stacking Arch",
        name_ar: "قوس قزح للتكديس",
        description: "Wooden rainbow arches for creative play.",
        description_ar: "أقواس خشبية بألوان قوس قزح للعب الإبداعي.",
        price: 250,
        category: "toys",
        brand: "Grimm's Style",
        stock: 10,
        images: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Animal Shape Sorter Bus",
        name_ar: "حافلة فرز أشكال الحيوانات",
        description: "Bus toy with animal shape slots.",
        description_ar: "لعبة حافلة مع فتحات لأشكال الحيوانات.",
        price: 195,
        category: "toys",
        brand: "Generic",
        stock: 14,
        images: ["https://images.unsplash.com/photo-1557958947-f0d5c02b1f0c?q=80&w=2062&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Hammer and Peg Bench",
        name_ar: "لعبة المطرقة والأوتاد",
        description: "Wooden pounding bench with hammer.",
        description_ar: "مقعد طرق خشبي مع مطرقة.",
        price: 140,
        category: "toys",
        brand: "Generic",
        stock: 22,
        images: ["https://images.unsplash.com/photo-1587654780291-39c940483713?q=80&w=2070&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Alphabet Puzzle Mat",
        name_ar: "سجادة بازل الحروف",
        description: "Foam puzzle mat with alphabet letters.",
        description_ar: "سجادة بازل فوم بحروف الأبجدية.",
        price: 280,
        category: "toys",
        brand: "Generic",
        stock: 18,
        images: ["https://images.unsplash.com/photo-1533230978931-1589d892784d?q=80&w=1887&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Magnetic Fishing Game",
        name_ar: "لعبة صيد السمك المغناطيسية",
        description: "Wooden fishing game with magnetic rods.",
        description_ar: "لعبة صيد خشبية مع سنارات مغناطيسية.",
        price: 130,
        category: "toys",
        brand: "Generic",
        stock: 25,
        images: ["https://images.unsplash.com/photo-1599624765320-b38466e0172e?q=80&w=1925&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Shape Matching Eggs (12 Pack)",
        name_ar: "بيض تطابق الأشكال (12 قطعة)",
        description: "Large pack of shape matching eggs.",
        description_ar: "عبوة كبيرة من بيض تطابق الأشكال.",
        price: 150,
        category: "toys",
        brand: "Generic",
        stock: 20,
        images: ["https://images.unsplash.com/photo-1558284852-5a2a297e6429?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Wooden Clock Puzzle",
        name_ar: "بازل الساعة الخشبية",
        description: "Teaching clock with shape blocks for numbers.",
        description_ar: "ساعة تعليمية مع مكعبات أشكال للأرقام.",
        price: 110,
        category: "toys",
        brand: "Generic",
        stock: 28,
        images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Activity Cube 5-in-1",
        name_ar: "مكعب الأنشطة 5 في 1",
        description: "Large wooden activity cube with bead maze.",
        description_ar: "مكعب أنشطة خشبي كبير مع متاهة خرز.",
        price: 450,
        category: "toys",
        brand: "TopBright",
        stock: 6,
        images: ["https://images.unsplash.com/photo-1587654780291-39c940483713?q=80&w=2070&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Soft Cloth Book",
        name_ar: "كتاب قماشي ناعم",
        description: "Interactive soft book with textures.",
        description_ar: "كتاب ناعم تفاعلي بملمس مختلف.",
        price: 85,
        category: "toys",
        brand: "Generic",
        stock: 35,
        images: ["https://images.unsplash.com/photo-1557958947-f0d5c02b1f0c?q=80&w=2062&auto=format&fit=crop"],
        isNew: false
    },
    {
        name: "Baby Rattle Set",
        name_ar: "مجموعة خشخيشات للرضع",
        description: "Set of 5 colorful rattles and teethers.",
        description_ar: "مجموعة من 5 خشخيشات وعضاضات ملونة.",
        price: 125,
        category: "toys",
        brand: "Huanger",
        stock: 30,
        images: ["https://images.unsplash.com/photo-1515488042361-ee0065ab4d28?q=80&w=1924&auto=format&fit=crop"],
        isNew: true
    },
    {
        name: "Spinning Stacking Toy",
        name_ar: "لعبة التكديس الدوارة",
        description: "Discs spin down the corkscrew pole.",
        description_ar: "أقراص تدور وتنزل عبر العمود اللولبي.",
        price: 260,
        category: "toys",
        brand: "Fat Brain Toys",
        stock: 12,
        images: ["https://images.unsplash.com/photo-1618842676088-77d919864d4b?q=80&w=2169&auto=format&fit=crop"],
        isNew: true
    }
];

export default function SeedToysPage() {
    const [status, setStatus] = useState("Idle");

    const handleImport = async () => {
        setStatus("Importing...");
        try {
            for (const product of toys) {
                const { error } = await supabase.from('products').insert([product]);
                if (error) {
                    console.error("Error inserting", product.name, error);
                    setStatus("Error: " + error.message);
                }
            }
            setStatus("Success! Products Imported.");
        } catch (e: any) {
            setStatus("Exception: " + e.message);
        }
    };

    return (
        <div className="p-20 text-center">
            <h1 className="text-2xl mb-4">Import 36 Toys Data</h1>
            <p className="mb-4">Status: {status}</p>
            <Button onClick={handleImport}>Start Import</Button>
        </div>
    );
}

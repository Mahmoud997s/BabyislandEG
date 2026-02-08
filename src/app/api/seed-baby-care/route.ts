import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper to create product object
const createProduct = (id: number, name: string, price: number, image: string, description: string) => ({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    price,
    description,
    category: 'baby-care',
    images: [image],
    stock: 50,
    isNew: true,
    rating: 4.8,
    reviews: Math.floor(Math.random() * 100) + 10,
    features: ["Gentle on skin", "Dermatologically tested", "Hypoallergenic"],
    specs: { suitableAge: "0+" }
});

const products = [
    // Wipes
    createProduct(1, "Pampers Sensitive Wipes, 224 (4x56)", 350, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Gentle cleaning for sensitive skin. Alcohol-free and fragrance-free."),
    createProduct(2, "Pampers Sensitive Protect, 56 Wipes", 95, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Soft and strong wipes for delicate skin."),
    createProduct(3, "Pampers Sensitive Protect Baby Wipes, 56", 95, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Restores natural pH levels of the skin."),
    createProduct(4, "Pampers Sensitive Protect Baby Wipes, 336 (6-pack)", 550, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Bulk pack for extended value. Clinically proven mildness."),
    createProduct(5, "Pampers Sensitive Baby Wipes 12x56", 990, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Mega pack for ultimate convenience and savings."),
    
    // Johnson's
    createProduct(6, "JOHNSON'S Baby Shampoo, 200ml", 85, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "No More Tears formula. Gentle to eyes as pure water."),
    createProduct(7, "Johnson's Baby CottonTouch Wash & Shampoo", 120, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Blended with real cotton. Ultralight and gentle for newborn skin."),
    createProduct(8, "Johnson's Sleep Time Baby Shampoo, 200ml", 95, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "With NaturalCalm essences to help baby sleep better."),
    createProduct(9, "JOHNSON'S Kids Shampoo - No More Tangles, 200ml", 110, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Unlocks knots and tangles for soft, smooth hair."),

    // Aveeno
    createProduct(10, "Aveeno Baby Soothing Relief Emollient Cream 150ml", 350, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Soothes and relieves dry, sensitive skin for 24 hours."),
    createProduct(11, "AVEENO Baby Calming Comfort Bedtime Lotion 150ml", 320, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "With lavender and vanilla scents to help calm baby before bed."),
    createProduct(12, "Aveeno Baby Daily Care Hair & Body Wash 250ml", 280, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Gently cleanses without drying. Suitable for eczema-prone skin."),
    createProduct(13, "Aveeno Baby Daily Moisturizing Lotion", 290, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Nourishes and protects baby's sensitive skin for 24 hours."),
    createProduct(14, "Aveeno Baby Eczema Therapy Soothing Bath Treatment", 450, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Relieves dry, itchy, irritated skin due to eczema."),
    createProduct(15, "Aveeno baby Therapy Night time Balm 28g", 250, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Intense moisture for dry, itchy skin. Fragrance-free."),

    // Sanosan
    createProduct(16, "Sanosan Diaper Rash Cream (Zinc Oxide)", 180, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Protects and soothes diaper area. With Zinc Oxide."),
    createProduct(17, "Sanosan Ointment Diaper Rash 75ml", 150, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Rich ointment for skin protection and healing."),
    createProduct(18, "Sanosan Nappy Rash Cream 150ml", 220, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Effective protection against soreness and irritation."),
    createProduct(19, "Sanosan Zinc Oxide Cream", 190, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Forms a protective barrier against moisture."),
    createProduct(20, "Sanosan Baby Lotion", 200, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Gentle care for baby's delicate skin with olive oil."),
    createProduct(21, "Sanosan Baby Diaper Rash Cream 150ML", 220, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Large size for daily protection."),

    // Mustela
    createProduct(22, "Mustela Vitamin Barrier Cream 100ml", 280, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Prevents, relieves, and recovers skin from diaper rash."),
    createProduct(23, "Mustela Vitamin Barrier Cream 50ml", 160, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Travel friendly size for on-the-go protection."),
    createProduct(24, "Mustela Vitamin Barrier 123 Cream 50ml", 170, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Complete skincare for nappy area."),

    // Sebamed
    createProduct(25, "Sebamed Baby Lotion 200ml", 250, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "pH 5.5 formulation to support skin's natural barrier."),
    createProduct(26, "Sebamed Baby Cream Extra Soft 50ml", 180, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Intensive protection for delicate skin areas."),
    createProduct(27, "Sebamed Baby Bubble Bath Foam 200ml", 240, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Soap-free cleansing for delicate baby skin."),
    createProduct(28, "Sebamed Baby Lotion 200ml (Daily)", 250, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Moisturizing complex with allantoin and camomile."),

    // Cetaphil
    createProduct(29, "Cetaphil Baby Wash & Shampoo with Organic Calendula", 320, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Tear-free formula with calming organic calendula."),
    createProduct(30, "Cetaphil Baby Calendula Wash and Shampoo 400ml", 550, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Large size. Hypoallergenic and paraben-free."),
    createProduct(31, "Cetaphil Baby Daily Lotion 400ml", 480, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Nourishes baby's skin for 24 hours. With shea butter."),
    createProduct(32, "Cetaphil Baby Soothe & Protect Cream", 350, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Restores and strengthens skin barrier. With allantoin."),
    createProduct(33, "Cetaphil Baby Wash & Shampoo + Body Lotion (2-pack)", 650, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Perfect gift set for complete baby care."),
    createProduct(34, "Cetaphil Baby Bath Time Essentials Gift Set", 850, "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2067&auto=format&fit=crop", "Contains wash, shampoo, lotion, and cloth."),
    createProduct(35, "Cetaphil Baby Wash & Shampoo Pack of 2 (13.5oz)", 680, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Value pack of gentle wash and shampoo."),

    // Sudocrem
    createProduct(36, "Sudocrem Antiseptic Healing Cream 125g", 250, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "The classic antiseptic cream for nappy rash and more."),
    createProduct(37, "Sudocrem antiseptic healing cream, 125 gm (classic)", 250, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Proven formula for soothing sore skin."),
    createProduct(38, "Sudocrem 125g X 2 (Twin Pack)", 480, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Double pack for extra value."),
    createProduct(39, "Sudocrem 125g", 250, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Essential for every changing bag."),

    // Other Diaper Creams
    createProduct(40, "Besty Zinc Diaper Rash Cream 75g", 85, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Effective zinc oxide protection."),
    createProduct(41, "Skinzza Dr. Zinc Diaper Rash Cream", 90, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Antibacterial alternative for sensitive skin."),
    createProduct(42, "Penduline Diaper Rash Cream", 110, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Natural ingredients to prevent irritation."),
    createProduct(43, "Neuth France Baby Diaper Rash Caring Cream 100ml", 195, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "French formulation for delicate skin."),

    // Healthcare Kits
    createProduct(44, "10PCS Baby Healthcare Care Kit Set", 350, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Complete kit with thermometer, aspirator, and more."),
    createProduct(45, "SKEIDO 10 Piece Baby Care Kit", 320, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Practical grooming and healthcare essentials."),
    createProduct(46, "yosunl Baby Healthcare and Grooming Kit 10 PCS", 340, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Everything needed for baby's daily care."),
    createProduct(47, "Seeyo Baby Grooming Kit Set 13 PCS", 400, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Comprehensive 13-piece set for new parents."),
    createProduct(48, "7-in-1 Baby Care Kit – Newborn Grooming", 280, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Essential tools for newborn hygiene."),

    // Devices & Others
    createProduct(49, "Berrcom Digital Thermometer (Kids & Babies)", 450, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Fast and accurate temperature reading."),
    createProduct(50, "Wipe It Antibacterial Wipes", 60, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Multipurpose wipes for baby and surfaces.")
];

export async function GET() {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('products')
            .upsert(products, { onConflict: 'slug' })
            .select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${products.length} products`,
            products: data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

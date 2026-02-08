
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local manually since we're not in Next.js context
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const createProduct = (name: string, price: number, image: string, description: string, sourceUrl: string) => ({
    product: {
        name,
        price,
        description,
        category: 'baby-care',
        category_ids: ['kafh-almntjat', 'baby-care'],
        images: [image],
        stock: 50,
        isNew: true,
        rating: 4.8,
        reviews: Math.floor(Math.random() * 100) + 10,
        brand: "Generic"
    },
    config: {
        source_url: sourceUrl,
        sync_enabled: true,
        last_synced_at: new Date().toISOString()
    }
});

const products = [
    // Wipes
    createProduct("Pampers Sensitive Wipes, 224 (4x56)", 350, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Gentle cleaning for sensitive skin. Alcohol-free and fragrance-free.", "https://www.amazon.eg/-/en/Pampers-Sensitive-Wipes-Fragrance-Suitable/dp/B09GFDWPHQ"),
    createProduct("Pampers Sensitive Protect, 56 Wipes", 95, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Soft and strong wipes for delicate skin.", "https://www.amazon.eg/-/en/Pampers-Sensitive-Protect-56-Wipes/dp/B00LZO6PXQ"),
    createProduct("Pampers Sensitive Protect Baby Wipes, 56", 95, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Restores natural pH levels of the skin.", "https://www.amazon.eg/-/en/Pampers-Sensitive-Baby-Wipes-56/dp/B0C3MRQZXB"),
    createProduct("Pampers Sensitive Protect Baby Wipes, 336 (6-pack)", 550, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Bulk pack for extended value. Clinically proven mildness.", "https://www.amazon.eg/-/en/Pampers-Sensitive-Protect-Baby-Wipes/dp/B08BMB3C3H"),
    createProduct("Pampers Sensitive Baby Wipes 12x56", 990, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Mega pack for ultimate convenience and savings.", "https://www.amazon.eg/-/en/Pampers-Sensitive-Baby-Wipes-11504019/dp/B092315YPK"),
    
    // Johnson's
    createProduct("JOHNSON'S Baby Shampoo, 200ml", 85, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "No More Tears formula. Gentle to eyes as pure water.", "https://www.amazon.eg/-/en/Johnson-JOHNSONS-Baby-Shampoo-200ml/dp/B08WJSC72R"),
    createProduct("Johnson's Baby CottonTouch Wash & Shampoo", 120, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Blended with real cotton. Ultralight and gentle for newborn skin.", "https://www.amazon.eg/-/en/Johnsons-Baby-CottonTouch-Newborn-Sensitive/dp/B08PZJWZYJ"),
    createProduct("Johnson's Sleep Time Baby Shampoo, 200ml", 95, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "With NaturalCalm essences to help baby sleep better.", "https://www.amazon.eg/-/en/Johnsons-Baby-Shampoo-Sleep-200ml/dp/B09HVCJYVT"),
    createProduct("JOHNSON'S Kids Shampoo - No More Tangles, 200ml", 110, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Unlocks knots and tangles for soft, smooth hair.", "https://www.amazon.eg/-/en/JOHNSONS-Kids-Shampoo-Tangles-200ml/dp/B08WLCK9GX"),

    // Aveeno
    createProduct("Aveeno Baby Soothing Relief Emollient Cream 150ml", 350, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Soothes and relieves dry, sensitive skin for 24 hours.", "https://www.amazon.eg/-/en/Aveeno-Baby-Emollient-Moisturises-Irritation/dp/B09NF1HVHG"),
    createProduct("AVEENO Baby Calming Comfort Bedtime Lotion 150ml", 320, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "With lavender and vanilla scents to help calm baby before bed.", "https://www.amazon.eg/-/en/AVEENO-Baby-Calming-Comfort-Bedtime/dp/B09NF1ZBMP"),
    createProduct("Aveeno Baby Daily Care Hair & Body Wash 250ml", 280, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Gently cleanses without drying. Suitable for eczema-prone skin.", "https://www.amazon.eg/-/en/Aveeno-Baby-Daily-Care-Hair/dp/B09NF1SZ9B"),
    createProduct("Aveeno Baby Daily Moisturizing Lotion", 290, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Nourishes and protects baby's sensitive skin for 24 hours.", "https://www.amazon.eg/-/en/Aveeno-Lotion-Daily-Moisturizing-Sensitive/dp/B00PC5Y02M"),
    createProduct("Aveeno Baby Eczema Therapy Soothing Bath Treatment", 450, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Relieves dry, itchy, irritated skin due to eczema.", "https://www.amazon.eg/-/en/Aveeno-Baby-Therapy-Soothing-Treatment/dp/B005IHECS6"),
    createProduct("Aveeno baby Therapy Night time Balm 28g", 250, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Intense moisture for dry, itchy skin. Fragrance-free.", "https://www.amazon.eg/-/en/Aveeno-baby-Therapy-Night-time/dp/B07NFBRZY7"),

    // Sanosan
    createProduct("Sanosan Diaper Rash Cream (Zinc Oxide)", 180, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Protects and soothes diaper area. With Zinc Oxide.", "https://www.amazon.eg/-/en/Sanosan-Diaper-Cream-Protectant-Oxide/dp/B0846K2RLR"),
    createProduct("Sanosan Ointment Diaper Rash 75ml", 150, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Rich ointment for skin protection and healing.", "https://www.amazon.eg/-/en/Sanosan-Ointment-Diaper-Rash-75/dp/B07ZFS7JHG"),
    createProduct("Sanosan Nappy Rash Cream 150ml", 220, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Effective protection against soreness and irritation.", "https://www.amazon.eg/-/en/Sanosan-Nappy-Rash-Cream-Shampoo/dp/B0BHZQBCW3"),
    createProduct("Sanosan Zinc Oxide Cream", 190, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Forms a protective barrier against moisture.", "https://www.amazon.eg/-/en/Sanosan-Zinc-Oxide-Cream/dp/B096D5VSTX"),
    createProduct("Sanosan Baby Lotion", 200, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Gentle care for baby's delicate skin with olive oil.", "https://www.amazon.eg/-/en/Sanosan-44430727-Baby-Lotion/dp/B08XJQLCTH"),
    createProduct("Sanosan Baby Diaper Rash Cream 150ML", 220, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Large size for daily protection.", "https://www.amazon.eg/-/en/Sanosan-Baby-Diaper-Cream-150ML/dp/B07MVWKSMY"),

    // Mustela
    createProduct("Mustela Vitamin Barrier Cream 100ml", 280, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Prevents, relieves, and recovers skin from diaper rash.", "https://www.amazon.eg/-/en/Mustela-Vitamin-Barrier-Cream-100ml/dp/B00TQCAAQW"),
    createProduct("Mustela Vitamin Barrier Cream 50ml", 160, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Travel friendly size for on-the-go protection.", "https://www.amazon.eg/-/en/Mustela-Vitamin-Barrier-Cream-50ml/dp/B00VNTF1TC"),
    createProduct("Mustela Vitamin Barrier 123 Cream 50ml", 170, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Complete skincare for nappy area.", "https://www.amazon.eg/-/en/Mustela-Vitamin-Barrier-Cream-50ml/dp/B00L98DTDC"),

    // Sebamed
    createProduct("Sebamed Baby Lotion 200ml", 250, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "pH 5.5 formulation to support skin's natural barrier.", "https://www.amazon.eg/-/en/Sebamed-Baby-Lotion-200ml-4103040122476/dp/B07FDZN4WJ"),
    createProduct("Sebamed Baby Cream Extra Soft 50ml", 180, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Intensive protection for delicate skin areas.", "https://www.amazon.eg/-/en/Sebamed-Baby-Cream-Extra-Soft/dp/B00P17V51A"),
    createProduct("Sebamed Baby Bubble Bath Foam 200ml", 240, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Soap-free cleansing for delicate baby skin.", "https://www.amazon.eg/%D8%B1%D8%BA%D9%88%D8%A9-%D8%AD%D9%85%D8%A7%D9%85-%D9%84%D9%84%D8%A7%D8%B7%D9%81%D8%A7%D9%84-%D8%B3%D9%8A%D8%A8%D8%A7%D9%85%D9%8A%D8%AF%D8%8C-200/dp/B07D54LQHW"),
    createProduct("Sebamed Baby Lotion 200ml (Daily)", 250, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Moisturizing complex with allantoin and camomile.", "https://www.amazon.eg/-/en/Sebamed-M149205-Baby-Lotion-200ml/dp/B079VTHB18"),

    // Cetaphil
    createProduct("Cetaphil Baby Wash & Shampoo with Organic Calendula", 320, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Tear-free formula with calming organic calendula.", "https://www.amazon.eg/-/en/Cetaphil-Shampoo-Organic-Calendula-Colorant/dp/B09JL9NGMB"),
    createProduct("Cetaphil Baby Calendula Wash and Shampoo 400ml", 550, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Large size. Hypoallergenic and paraben-free.", "https://www.amazon.eg/-/en/Cetaphil-Calendula-Sensitive-Cleanses-Dermatologist/dp/B08D1BKYDC"),
    createProduct("Cetaphil Baby Daily Lotion 400ml", 480, "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2070&auto=format&fit=crop", "Nourishes baby's skin for 24 hours. With shea butter.", "https://www.amazon.eg/-/en/Cetaphil-Baby-Daily-Lotion-400ml/dp/B01N6S8SJD"),
    createProduct("Cetaphil Baby Soothe & Protect Cream", 350, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Restores and strengthens skin barrier. With allantoin.", "https://www.amazon.eg/-/en/Cetaphil-soothing-protecting-cream-children/dp/B087R28S2X"),
    createProduct("Cetaphil Baby Wash & Shampoo + Body Lotion (2-pack)", 650, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Perfect gift set for complete baby care.", "https://www.amazon.eg/-/en/Cetaphil-Essentials-Hydration-Delicate-Sensitive/dp/B09RKNVYFT"),
    createProduct("Cetaphil Baby Bath Time Essentials Gift Set", 850, "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=2067&auto=format&fit=crop", "Contains wash, shampoo, lotion, and cloth.", "https://www.amazon.eg/302993936893/dp/B07JD3WR3Q"),
    createProduct("Cetaphil Baby Wash & Shampoo Pack of 2 (13.5oz)", 680, "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop", "Value pack of gentle wash and shampoo.", "https://www.amazon.eg/0299-020015/dp/B09MVMNW5M"),

    // Sudocrem
    createProduct("Sudocrem Antiseptic Healing Cream 125g", 250, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "The classic antiseptic cream for nappy rash and more.", "https://www.amazon.eg/-/en/Sudocrem-Antiseptic-Healing-Cream-125g/dp/B01BKODTKC"),
    createProduct("Sudocrem antiseptic healing cream, 125 gm (classic)", 250, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Proven formula for soothing sore skin.", "https://www.amazon.eg/-/en/Sudocrem-antiseptic-healing-cream-125/dp/B000ZLQJHC"),
    createProduct("Sudocrem 125g X 2 (Twin Pack)", 480, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Double pack for extra value.", "https://www.amazon.eg/3P-0QA0-FU95/dp/B06Y5PYXWW"),
    createProduct("Sudocrem 125g", 250, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Essential for every changing bag.", "https://www.amazon.eg/-/en/Sudocrem-125g/dp/B09NZ388Y7"),

    // Other Diaper Creams
    createProduct("Besty Zinc Diaper Rash Cream 75g", 85, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Effective zinc oxide protection.", "https://www.amazon.eg/-/en/Besty-Zinc-Diaper-Panthenol-Formula/dp/B0C155LQMX"),
    createProduct("Skinzza Dr. Zinc Diaper Rash Cream", 90, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Antibacterial alternative for sensitive skin.", "https://www.amazon.eg/-/en/Skinzza-Dr-Zinc-antibacterial-Alternative/dp/B0FF4YDQ7Q"),
    createProduct("Penduline Diaper Rash Cream", 110, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "Natural ingredients to prevent irritation.", "https://www.amazon.eg/-/en/Penduline-Diaper-Cream-Protect-Moisturize/dp/B0BSGZVFJZ"),
    createProduct("Neuth France Baby Diaper Rash Caring Cream 100ml", 195, "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=2070&auto=format&fit=crop", "French formulation for delicate skin.", "https://www.amazon.eg/-/en/Neuth-France-Diaper-Caring-Cream/dp/B09RPFL6LW"),

    // Healthcare Kits
    createProduct("10PCS Baby Healthcare Care Kit Set", 350, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Complete kit with thermometer, aspirator, and more.", "https://www.amazon.eg/-/en/Healthcare-Aspirator-Thermometer-Toothbrush-Tweezers/dp/B091KJZ2SR"),
    createProduct("SKEIDO 10 Piece Baby Care Kit", 320, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Practical grooming and healthcare essentials.", "https://www.amazon.eg/-/en/SKEIDO-Healthcare-Thermometer-Practical-Clipper/dp/B07MVWQSX9"),
    createProduct("yosunl Baby Healthcare and Grooming Kit 10 PCS", 340, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Everything needed for baby's daily care.", "https://www.amazon.eg/-/en/yosunl-Healthcare-Grooming-Thermometer-Aspirator/dp/B09GNP2DJ2"),
    createProduct("Seeyo Baby Grooming Kit Set 13 PCS", 400, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Comprehensive 13-piece set for new parents.", "https://www.amazon.eg/-/en/Seeyo-Healthcare-Thermometer-Aspirator-Toothbrush/dp/B09FFJRXBQ"),
    createProduct("7-in-1 Baby Care Kit – Newborn Grooming", 280, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Essential tools for newborn hygiene.", "https://www.amazon.eg/-/en/Baby-Care-Kit-Healthcare-Thermometer/dp/B0FH771RRV"),

    // Devices & Others
    createProduct("Berrcom Digital Thermometer (Kids & Babies)", 450, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop", "Fast and accurate temperature reading.", "https://www.amazon.eg/-/en/Berrcom-Thermometers-Thermometer-Underarm-Flexible/dp/B09XXHT9BW"),
    createProduct("Wipe It Antibacterial Wipes", 60, "https://images.unsplash.com/photo-1628155179117-68b209d6f353?q=80&w=2070&auto=format&fit=crop", "Multipurpose wipes for baby and surfaces.", "https://www.amazon.eg/-/en/Wipe-It-Antibacterial-Wipes/dp/B0DSCK35HC")
];

async function seed() {
    console.log(`Seeding ${products.length} products...`);
    
    // products is now [{product, config}, ...]
    // We need to insert products first, get IDs, then insert configs.
    
    // We can't bulk insert efficiently because we need to map returned IDs to specific configs.
    // But since the array order is preserved, we can try.
    
    const productsPayload = products.map(p => p.product);
    
    // Insert Products
    const { data: insertedProducts, error } = await supabase
        .from('products')
        .insert(productsPayload)
        .select('id');
        
    if (error || !insertedProducts) {
        console.error('Error inserting products:', error);
        return;
    }
    
    console.log(`Inserted ${insertedProducts.length} core products. Inserting configs...`);
    
    // Prepare Configs
    // Assuming insertedProducts order matches input products order. 
    // This is generally true for Postgres INSERT ... RETURNING but not guaranteed by SQL standard.
    // However, for this script it's likely fine.
    
    const configsPayload = insertedProducts.map((p, index) => ({
        product_id: p.id,
        ...products[index].config
    }));
    
    // Insert Configs
    const { error: configError } = await supabase
        .from('product_sync_config')
        .insert(configsPayload);
        
    if (configError) {
        console.error('Error inserting configs:', configError);
    } else {
        console.log('✅ Configurations saved.');
    }
}

async function run() {
    console.log('Cleaning up old Baby Care products (without sync)...');
    
    // Delete by category 'baby-care'
    // This ensures we don't duplicate
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('category', 'baby-care');
        
    if (deleteError) {
        console.error('Error deleting old products:', deleteError);
        return;
    }
    
    await seed();
}

run();

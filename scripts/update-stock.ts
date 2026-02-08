
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
    "products_top200_cat_strollers-gear.json",
    "products_top200_cat_feeding.json",
    "products_top200_cat_toys.json",
    "products_top200_cat_nursery.json",
    "products_top200_cat_bathing.json"
];

const dataDir = path.join(__dirname, '../public/data');

const normalize = (str: any) => String(str).split("?")[0];

if (!fs.existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir}`);
    process.exit(1);
}

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    console.log(`Processing ${file}...`);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return;
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        let products = JSON.parse(content);

        if (!Array.isArray(products)) {
            console.error(`Invalid JSON in ${file}: expected array`);
            return;
        }

        products = products.map((p: any) => {
            // Normalize IDs and Slugs
            if (p.product_id) p.product_id = normalize(p.product_id);
            if (p.slug) p.slug = normalize(p.slug);

            // Set stock
            p.stock_qty = 5;

            // Ensure stock_status reflects quantity
            p.stock_status = p.stock_qty > 0 ? "in_stock" : "out_of_stock";

            return p;
        });

        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        console.log(`Updated ${file}: ${products.length} products processed.`);
    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
});

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

const normalize = (str) => String(str).split("?")[0];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    console.log(`Processing ${file}...`);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    let products = JSON.parse(content);

    products = products.map(p => {
        // Normalize IDs
        p.product_id = normalize(p.product_id);
        if (p.slug) p.slug = normalize(p.slug);

        // Set stock
        p.stock_qty = 5;

        // Ensure stock_status reflects quantity
        if (p.stock_qty > 0) p.stock_status = "in_stock";

        return p;
    });

    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    console.log(`Updated ${file}: ${products.length} products processed.`);
});

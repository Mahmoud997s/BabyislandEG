
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../public/data');
const files = [
    'products_top200_cat_strollers-gear.json',
    'products_top200_cat_feeding.json',
    'products_top200_cat_toys.json',
    'products_top200_cat_nursery.json',
    'products_top200_cat_bathing.json'
];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`Processing ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        try {
            let data = JSON.parse(content);
            if (Array.isArray(data)) {
                data = data.map(item => {
                    item.stock_qty = 5;
                    if (item.product_id && typeof item.product_id === 'string') {
                        item.product_id = item.product_id.split('?')[0];
                    }
                    if (item.slug && typeof item.slug === 'string') {
                        item.slug = item.slug.split('?')[0];
                    }
                    return item;
                });
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                console.log(`Updated ${file}`);
            }
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    } else {
        console.warn(`File not found: ${filePath}`);
    }
});

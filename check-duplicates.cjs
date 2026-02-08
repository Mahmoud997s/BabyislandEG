const fs = require('fs');

const FILES = [
  'public/data/products.cleaned.json',
  'public/data/products_top200.cleaned.json',
  'public/data/products_remaining.cleaned.json'
];

function checkDuplicates() {
    let allProducts = [];
    
    // Load all files
    FILES.forEach(file => {
        if (fs.existsSync(file)) {
            try {
                const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                if (Array.isArray(data)) {
                     allProducts = [...allProducts, ...data];
                }
            } catch (e) {
                console.error(`Error reading ${file}:`, e.message);
            }
        }
    });

    const total = allProducts.length;
    console.log(`\n📊 Total Products Loaded: ${total}`);

    // Check for Duplicates by Slug
    const slugCounts = {};
    const uniqueProducts = [];
    const seenSlugs = new Set();

    allProducts.forEach(p => {
        const name = p.name_en || p.name_ar || p.name || 'Unknown';
        const slug = p.slug;

        // Count for report
        slugCounts[slug] = (slugCounts[slug] || 0) + 1;

        // Dedup for clean list
        if (!seenSlugs.has(slug)) {
            seenSlugs.add(slug);
            uniqueProducts.push(p);
        }
    });

    const duplicateSlugs = Object.entries(slugCounts).filter(([_, count]) => count > 1);

    console.log(`\n🔍 Duplicates Report:`);
    console.log(`- Original Count: ${total}`);
    console.log(`- Unique Count:   ${uniqueProducts.length}`);
    console.log(`- Duplicates Found: ${total - uniqueProducts.length}`);

    if (duplicateSlugs.length > 0) {
        console.log('\nExample Duplicates Removed:');
        duplicateSlugs.slice(0, 5).forEach(([slug, count]) => {
            console.log(`  - "${slug}": ${count} copies`);
        });
    }

    // Save Clean File
    const outputPath = 'public/data/products.unique.json';
    fs.writeFileSync(outputPath, JSON.stringify(uniqueProducts, null, 2));
    console.log(`\n✅ Cleaned data saved (1 copy per product) to: ${outputPath}`);
}

checkDuplicates();


const fs = require('fs');
const path = require('path');

const brands = [
    { name: "chicco", color: "#0069B4" },       // Blue
    { name: "joie", color: "#F58025" },         // Orange
    { name: "kinderkraft", color: "#8CB81B" },  // Greenish
    { name: "kidilo", color: "#00BCD4" },       // Cyan
    { name: "belecoo", color: "#D4AF37" },      // Gold
    { name: "umbrella", color: "#FF0000" },     // Red
    { name: "true-baby", color: "#2196F3" },    // Blue
    { name: "safari-baby", color: "#4CAF50" },  // Green
    { name: "canpol-babies", color: "#E3000F" },// Red
    { name: "philips-avent", color: "#451C5C" },// Purple
    { name: "mastela", color: "#FF4081" },      // Pink
    { name: "junior", color: "#3F51B5" },       // Indigo
    { name: "le-queen", color: "#FFC107" },     // Amber
    { name: "lovi", color: "#E53935" },         // Red
    { name: "graco", color: "#183153" }         // Dark Blue
];

const outDir = path.join(__dirname, 'public', 'brands');

brands.forEach(brand => {
    // Generate a simple text-based SVG
    const displayName = brand.name.replace(/-/g, ' ').toUpperCase();

    // Improved Layout to prevent overlap:
    // ViewBox: 200x60
    // Circle (Dot): Center at x=15, y=30, r=6 (Smaller dot, further left)
    // Text: Start at x=35 (Clear gap), centered vertically
    // Alignment: text-anchor="start"

    const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
  <rect width="200" height="60" fill="transparent"/>
  <circle cx="15" cy="30" r="6" fill="${brand.color}"/>
  <text x="35" y="52%" dominant-baseline="middle" text-anchor="start" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="${brand.color}">${displayName}</text>
</svg>`;

    fs.writeFileSync(path.join(outDir, `${brand.name}.svg`), content);
});

console.log('Fixed SVGs generated (v2)');

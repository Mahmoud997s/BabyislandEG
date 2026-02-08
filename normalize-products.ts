
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_CATEGORIES = [
  'baby-care',
  'strollers-gear',
  'feeding',
  'toys',
  'nursery',
  'bathing',
  // Deprecated but valid as source
  'clothing',
  'maternity'
];

// Map specific messy values to valid ones if possible
const CATEGORY_MAP: Record<string, string> = {
  'strollers': 'strollers-gear',
  'gear': 'strollers-gear',
  'baby': 'baby-care',
  'care': 'baby-care',
  'feed': 'feeding',
  'food': 'feeding',
  'toy': 'toys',
  'bath': 'bathing',
  'clothes': 'clothing',
  'mum': 'maternity',
  'mom': 'maternity'
};

const FILES = [
  'products.json',
  'products_top200.json',
  'products_remaining.json'
];

const DIR = path.join(__dirname, 'public', 'data');
const REPORT_FILE = path.join(DIR, 'cleanup.report.json');

let stats: {
  totalProcessed: number;
  idsFixed: number;
  slugsFixed: number;
  categoryFixes: number;
  issues: Record<string, number>;
} = {
  totalProcessed: 0,
  idsFixed: 0,
  slugsFixed: 0,
  categoryFixes: 0,
  issues: {}
};

let report: any[] = [];

function cleanString(str: string | null | undefined) {
  if (!str) return str;
  return str.split('?')[0].trim();
}

function normalizeCategory(cats: string | string[]) {
  let primary = null;
  
  // If array, look for valid slug
  if (Array.isArray(cats)) {
    for (const c of cats) {
      if (c === 'kafh-almntjat') continue;
      if (VALID_CATEGORIES.includes(c)) {
        primary = c;
        break;
      }
      // Try mapping
      if (CATEGORY_MAP[c]) {
        primary = CATEGORY_MAP[c];
        break;
      }
    }
  } else if (typeof cats === 'string') {
    if (VALID_CATEGORIES.includes(cats)) primary = cats;
    else if (CATEGORY_MAP[cats]) primary = CATEGORY_MAP[cats];
  }

  // Fallback
  let needsReview = false;
  let reason = '';
  
  if (!primary) {
    primary = 'baby-care'; // Default per instructions
    needsReview = true;
    reason = 'Unknown/Empty category, set to baby-care';
  }

  return {
    category_ids: ['kafh-almntjat', primary],
    primary,
    needsReview,
    reason
  };
}

async function processFiles() {
    for (const file of FILES) {
      const filePath = path.join(DIR, file);
      if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - not found`);
        continue;
      }
    
      console.log(`Processing ${file}...`);
      const raw = fs.readFileSync(filePath, 'utf8');
      let products;
      try {
        products = JSON.parse(raw);
      } catch (e) {
        console.error(`Error parsing ${file}:`, e);
        continue;
      }
    
      const cleanedProducts = products.map((p: any) => {
        stats.totalProcessed++;
        let changed = false;
        let log: { product_id: any; old_slug: any; changes: string[] } = { product_id: p.product_id, old_slug: p.slug, changes: [] };
    
        // 1. Clean ID
        const newId = cleanString(p.product_id);
        if (newId !== p.product_id) {
          p.product_id = newId;
          stats.idsFixed++;
          changed = true;
          log.changes.push('id_cleaned');
        }
    
        // 2. Clean Slug
        const newSlug = cleanString(p.slug);
        if (newSlug !== p.slug) {
          p.slug = newSlug;
          stats.slugsFixed++;
          changed = true;
          log.changes.push('slug_cleaned');
        }
    
        // 3. Normalize Category
        const catResult = normalizeCategory(p.category_ids);
        const newCatsJson = JSON.stringify(catResult.category_ids);
        const oldCatsJson = JSON.stringify(p.category_ids);
    
        if (newCatsJson !== oldCatsJson) {
          // If the only change is adding kafh-almntjat to an already correct single category, maybe don't count it as a "fix" in stats if we want strictly "fixes", but instruction says "Ensure... ALWAYS". So it is a fix.
          p.category_ids = catResult.category_ids;
          stats.categoryFixes++;
          changed = true;
          // log.changes.push(`category_fixed: ${oldCatsJson} -> ${newCatsJson}`);
          
          if (catResult.reason) {
             const key = catResult.reason;
             stats.issues[key] = (stats.issues[key] || 0) + 1;
          }
        }
    
        if (catResult.needsReview) {
          p.needsReview = true;
        }
    
        if (changed) {
          // report.push(log); // Too verbose to log every single change if huge
        }
        
        return p;
      });
    
      // Write cleaned file
      const cleanedFile = file.replace('.json', '.cleaned.json');
      fs.writeFileSync(path.join(DIR, cleanedFile), JSON.stringify(cleanedProducts, null, 2));
      console.log(`Saved ${cleanedFile}`);
    }
    
    // Write report
    fs.writeFileSync(REPORT_FILE, JSON.stringify({ stats }, null, 2));
    
    console.log('Done!');
    console.log(JSON.stringify(stats, null, 2));
}

processFiles();

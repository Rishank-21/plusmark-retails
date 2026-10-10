/**
 * Debug script to check A+ image data
 */
import { aplusLines, getProductAplus } from '../data/aplus.ts';

console.log('='.repeat(60));
console.log('DEBUGGING A+ IMAGES');
console.log('='.repeat(60));

// Check a few products
const testProducts = [
  'metallic-premium-chalk-board',
  'eco-premium-both-side-board',
  'metallic-premium-notice-board',
  'eco-premium-notice-board'
];

for (const productSlug of testProducts) {
  console.log(`\n📦 ${productSlug}`);
  const sets = getProductAplus(productSlug);
  
  if (sets.length === 0) {
    console.log('  ⚠️  No A+ sets found');
    continue;
  }
  
  for (const [setIndex, productSet] of sets.entries()) {
    if (sets.length > 1) {
      console.log(`\n  Variant: ${productSet.variant || 'Default'}`);
    }
    console.log(`  Set ID: ${productSet.set.id}`);
    console.log(`  Images (${productSet.set.images.length}):`);
    
    productSet.set.images.forEach((img, i) => {
      console.log(`    ${i + 1}. [${img.label}] ${img.src}`);
    });
  }
}

console.log('\n' + '='.repeat(60));
console.log('CHECKING FOR DUPLICATES');
console.log('='.repeat(60));

for (const productSlug of testProducts) {
  const sets = getProductAplus(productSlug);
  
  for (const productSet of sets) {
    const images = productSet.set.images;
    const urls = images.map(img => img.src);
    const uniqueUrls = [...new Set(urls)];
    
    if (urls.length !== uniqueUrls.length) {
      console.log(`\n❌ DUPLICATES FOUND in ${productSlug} (${productSet.set.id}):`);
      
      // Find duplicates
      const urlCounts = {};
      urls.forEach(url => {
        urlCounts[url] = (urlCounts[url] || 0) + 1;
      });
      
      Object.entries(urlCounts).forEach(([url, count]) => {
        if (count > 1) {
          console.log(`   ${url} appears ${count} times`);
          // Show which indices have this URL
          const indices = urls.map((u, i) => u === url ? i + 1 : null).filter(x => x !== null);
          console.log(`   At positions: ${indices.join(', ')}`);
        }
      });
    } else {
      console.log(`\n✅ No duplicates in ${productSlug} (${productSet.set.id})`);
    }
  }
}

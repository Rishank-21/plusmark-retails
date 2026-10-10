/**
 * Remove A+ listing images from gallery.ts
 * Gallery should only contain product photos, not A+ banners
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const galleryPath = join(projectRoot, 'plusmark/data/gallery.ts');

console.log('🧹 Cleaning A+ images from gallery.ts...\n');

let content = readFileSync(galleryPath, 'utf-8');

// Split into lines
const lines = content.split('\n');
const cleanedLines = [];
let removedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if this line contains an A+ image URL
  if (line.includes('/aplus/')) {
    removedCount++;
    console.log(`  ❌ Removing: ${line.trim()}`);
    continue; // Skip this line
  }
  
  cleanedLines.push(line);
}

// Join back
content = cleanedLines.join('\n');

// Write back
writeFileSync(galleryPath, content, 'utf-8');

console.log(`\n✅ Removed ${removedCount} A+ image URLs from gallery.ts`);
console.log('💾 File saved!\n');

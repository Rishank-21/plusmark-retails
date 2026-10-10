/**
 * Fix Cloudinary URLs to match actual uploaded public_id format
 * Uploaded format: plusmark/products/... (without /images/)
 * Current URLs: plusmark/images/products/... (with /images/)
 * This script removes /images/ from all Cloudinary URLs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Files to fix
const filesToFix = [
  'plusmark/data/gallery.ts',
  'plusmark/data/sizes.ts'
];

function fixCloudinaryUrls(content) {
  // Replace plusmark/images/ with plusmark/ in all Cloudinary URLs
  return content.replace(
    /https:\/\/res\.cloudinary\.com\/drt0rpkn2\/image\/upload\/([^\/]+)\/plusmark\/images\//g,
    'https://res.cloudinary.com/drt0rpkn2/image/upload/$1/plusmark/'
  );
}

for (const file of filesToFix) {
  const filePath = join(projectRoot, file);
  console.log(`Fixing: ${file}`);
  
  let content = readFileSync(filePath, 'utf-8');
  const originalLength = content.length;
  
  content = fixCloudinaryUrls(content);
  
  writeFileSync(filePath, content, 'utf-8');
  
  if (content.length !== originalLength) {
    console.log(`  ✓ Fixed URLs in ${file}`);
  } else {
    console.log(`  ⚠ No changes needed in ${file}`);
  }
}

console.log('\n✨ All files fixed!');

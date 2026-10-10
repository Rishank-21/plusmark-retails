/**
 * Update sizes.ts to use Cloudinary URLs instead of local paths
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const CLOUDINARY_CLOUD_NAME = 'drt0rpkn2';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

function convertPathToCloudinary(localPath) {
  // Remove leading slash and .webp extension, remove query params
  const pathWithoutSlash = localPath.replace(/^\//, '');
  const pathWithoutQuery = pathWithoutSlash.split('?')[0];
  const pathWithoutExt = pathWithoutQuery.replace(/\.webp$/, '').replace(/\.png$/, '');
  
  // Convert to Cloudinary public_id: images/products/slug -> plusmark/images/products/slug
  const publicId = `plusmark/${pathWithoutExt}`;
  
  // Return Cloudinary URL with f_auto,q_auto transformations
  return `${CLOUDINARY_BASE_URL}/f_auto,q_auto/${publicId}`;
}

// Read sizes.ts
const sizesPath = join(projectRoot, 'plusmark/data/sizes.ts');
let content = readFileSync(sizesPath, 'utf-8');

// Find all image paths and replace them
content = content.replace(/image: ["']\/images\/[^"']+["']/g, (match) => {
  const localPath = match.match(/["'](\/images\/[^"']+)["']/)[1];
  const cloudinaryUrl = convertPathToCloudinary(localPath);
  return `image: "${cloudinaryUrl}"`;
});

// Write back
writeFileSync(sizesPath, content, 'utf-8');
console.log('✓ Updated sizes.ts with Cloudinary URLs');

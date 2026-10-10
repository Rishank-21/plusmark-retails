#!/usr/bin/env node
/**
 * Migrate all images from public/images to Cloudinary
 * Generates a mapping file for updating data files
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Read .env.local manually for Node.js compatibility
async function loadEnv() {
  try {
    const envContent = await fs.readFile(path.join(projectRoot, '.env.local'), 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !line.startsWith('#')) {
        const [, key, value] = match;
        process.env[key.trim()] = value.trim();
      }
    }
  } catch (error) {
    console.error('Could not load .env.local:', error.message);
  }
}

await loadEnv();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGES_DIR = path.join(projectRoot, 'public', 'images');
const MAPPING_FILE = path.join(projectRoot, 'scripts', 'cloudinary-mapping.json');

// Track uploaded images
const urlMapping = {};
const errors = [];
let uploadedCount = 0;
let skippedCount = 0;

/**
 * Get all image files recursively
 */
async function getAllImages(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return getAllImages(fullPath, baseDir);
      } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(entry.name)) {
        return { fullPath, relativePath: path.relative(baseDir, fullPath).replace(/\\/g, '/') };
      }
      return null;
    })
  );
  return files.flat().filter(Boolean);
}

/**
 * Generate Cloudinary public_id from file path
 */
function getPublicId(relativePath) {
  const withoutExt = relativePath.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
  return `plusmark/${withoutExt}`;
}

/**
 * Generate optimized Cloudinary URL
 */
function getCloudinaryUrl(publicId) {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
}

/**
 * Upload single image to Cloudinary
 */
async function uploadImage(imagePath, publicId, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(imagePath, {
        public_id: publicId,
        resource_type: 'image',
        overwrite: false,
        unique_filename: false,
      });
      
      return result;
    } catch (error) {
      if (error.error?.http_code === 409 || error.message?.includes('already exists')) {
        // Already exists, return mock result
        return { public_id: publicId, existing: true };
      }
      
      if (attempt === retries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * Upload images in smaller batches with progress updates
 */
async function uploadBatch(images, batchSize = 3) {
  const total = images.length;
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async ({ fullPath, relativePath }) => {
        const publicId = getPublicId(relativePath);
        const localPath = `/images/${relativePath}`;
        
        try {
          const result = await uploadImage(fullPath, publicId);
          const cloudinaryUrl = getCloudinaryUrl(result.public_id);
          
          urlMapping[localPath] = {
            cloudinaryUrl,
            publicId: result.public_id,
            existing: result.existing || false,
          };
          
          if (result.existing) {
            skippedCount++;
          } else {
            uploadedCount++;
          }
        } catch (error) {
          errors.push({ path: localPath, error: error.message });
          console.error(`Failed: ${localPath} - ${error.message}`);
        }
      })
    );
    
    // Progress
    const processed = Math.min(i + batchSize, total);
    console.log(`Progress: ${processed}/${total} (${Math.round(processed/total*100)}%)`);
    
    // Save intermediate results every 50 images
    if (processed % 50 === 0 || processed === total) {
      await fs.writeFile(MAPPING_FILE, JSON.stringify(urlMapping, null, 2));
      console.log('Saved intermediate mapping');
    }
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('Starting Cloudinary migration...\n');
  console.log(`Cloud: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}\n`);
  
  try {
    const images = await getAllImages(IMAGES_DIR);
    console.log(`Found ${images.length} images\n`);
    
    await uploadBatch(images, 3);
    
    await fs.writeFile(MAPPING_FILE, JSON.stringify(urlMapping, null, 2));
    
    console.log('\n' + '='.repeat(50));
    console.log('Summary:');
    console.log('='.repeat(50));
    console.log(`Uploaded: ${uploadedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Failed: ${errors.length}`);
    console.log(`Total: ${uploadedCount + skippedCount + errors.length}/${images.length}`);
    console.log('='.repeat(50));
    
    process.exit(errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('\nMigration failed:', error.message);
    process.exit(1);
  }
}

if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  console.error('Missing Cloudinary credentials');
  process.exit(1);
}

migrate();

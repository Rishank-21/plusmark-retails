/**
 * Improved Cloudinary upload script with:
 * - Resume capability from mapping file
 * - Better error handling
 * - Actual file type detection
 * - Smaller batch sizes
 * - Progress tracking
 */
import { v2 as cloudinary } from 'cloudinary';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables
function loadEnv() {
  const envPath = join(projectRoot, '.env.local');
  if (!existsSync(envPath)) {
    throw new Error('.env.local not found');
  }
  
  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value.trim();
    }
  });
}

loadEnv();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const MAPPING_FILE = join(__dirname, 'cloudinary-mapping.json');
const PUBLIC_DIR = join(projectRoot, 'public');
const IMAGES_DIR = join(PUBLIC_DIR, 'images');

// Detect actual file type by reading magic bytes
function detectFileType(filePath) {
  const buffer = readFileSync(filePath);
  const header = buffer.slice(0, 12);
  
  // JPEG: FF D8 FF
  if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
    return 'jpg';
  }
  
  // WebP: RIFF....WEBP
  if (header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
      header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) {
    return 'webp';
  }
  
  // PNG: 89 50 4E 47
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
    return 'png';
  }
  
  // GIF: 47 49 46
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
    return 'gif';
  }
  
  return null;
}

// Get all image files
function getAllImages(dir, baseDir = dir) {
  const results = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      results.push(...getAllImages(fullPath, baseDir));
    } else if (stat.isFile() && /\.(jpg|jpeg|png|webp|gif)$/i.test(item)) {
      const relativePath = fullPath.replace(PUBLIC_DIR, '').replace(/\\/g, '/');
      results.push({
        localPath: relativePath,
        fullPath: fullPath,
        size: stat.size
      });
    }
  }
  
  return results;
}

// Load existing mapping
function loadMapping() {
  if (existsSync(MAPPING_FILE)) {
    const content = readFileSync(MAPPING_FILE, 'utf-8');
    return JSON.parse(content);
  }
  return {};
}

// Save mapping
function saveMapping(mapping) {
  writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
}

// Upload single image with retry
async function uploadImage(image, mapping, retries = 3) {
  const { localPath, fullPath } = image;
  
  // Skip if already uploaded
  if (mapping[localPath]?.existing) {
    return { success: true, skipped: true, path: localPath };
  }
  
  try {
    // Detect actual file type
    const actualType = detectFileType(fullPath);
    if (!actualType) {
      console.warn(`⚠️  Unknown file type: ${localPath}`);
      return { success: false, path: localPath, error: 'Unknown file type' };
    }
    
    // Remove /images/ prefix and file extension for public_id
    const pathWithoutImages = localPath.replace(/^\/images\//, '');
    const pathWithoutExt = pathWithoutImages.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
    const publicId = `plusmark/${pathWithoutExt}`;
    
    // Upload with actual format
    const result = await cloudinary.uploader.upload(fullPath, {
      public_id: publicId,
      resource_type: 'image',
      format: actualType, // Use detected format
      overwrite: false,
      invalidate: true,
      folder: '', // Empty because publicId already has path
    });
    
    // Save to mapping
    mapping[localPath] = {
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      existing: true,
      uploadedAt: new Date().toISOString()
    };
    
    return { success: true, path: localPath, url: result.secure_url };
    
  } catch (error) {
    if (retries > 0 && !error.message.includes('already exists')) {
      console.log(`  Retry ${4 - retries}/3 for ${localPath}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      return uploadImage(image, mapping, retries - 1);
    }
    
    return { 
      success: false, 
      path: localPath, 
      error: error.message,
      http_code: error.http_code 
    };
  }
}

// Upload batch with progress
async function uploadBatch(images, mapping, batchSize = 3) {
  const results = {
    total: images.length,
    uploaded: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, Math.min(i + batchSize, images.length));
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(images.length / batchSize);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, images.length)}/${images.length})`);
    
    const promises = batch.map(img => uploadImage(img, mapping));
    const batchResults = await Promise.all(promises);
    
    for (const result of batchResults) {
      if (result.skipped) {
        results.skipped++;
        console.log(`  ⏭️  Skipped: ${result.path}`);
      } else if (result.success) {
        results.uploaded++;
        console.log(`  ✅ Uploaded: ${result.path}`);
      } else {
        results.failed++;
        results.errors.push(result);
        console.log(`  ❌ Failed: ${result.path} - ${result.error}`);
      }
    }
    
    // Save progress after each batch
    saveMapping(mapping);
    console.log(`  💾 Progress saved (${results.uploaded} uploaded, ${results.skipped} skipped, ${results.failed} failed)`);
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < images.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// Main execution
async function main() {
  console.log('🚀 Starting Cloudinary upload v2...\n');
  
  // Load existing mapping
  const mapping = loadMapping();
  const existingCount = Object.keys(mapping).length;
  console.log(`📋 Loaded mapping with ${existingCount} existing entries\n`);
  
  // Get all images
  console.log('🔍 Scanning for images...');
  const allImages = getAllImages(IMAGES_DIR);
  const totalSize = allImages.reduce((sum, img) => sum + img.size, 0);
  console.log(`📸 Found ${allImages.length} images (${(totalSize / 1024 / 1024).toFixed(2)} MB)\n`);
  
  // Filter out already uploaded
  const toUpload = allImages.filter(img => !mapping[img.localPath]?.existing);
  console.log(`⬆️  Need to upload: ${toUpload.length} images`);
  console.log(`✓  Already uploaded: ${allImages.length - toUpload.length} images\n`);
  
  if (toUpload.length === 0) {
    console.log('✨ All images already uploaded!');
    return;
  }
  
  // Upload in batches
  const startTime = Date.now();
  const results = await uploadBatch(toUpload, mapping, 3); // 3 concurrent uploads
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total images:     ${results.total}`);
  console.log(`✅ Uploaded:      ${results.uploaded}`);
  console.log(`⏭️  Skipped:       ${results.skipped}`);
  console.log(`❌ Failed:        ${results.failed}`);
  console.log(`⏱️  Duration:      ${duration}s`);
  console.log(`💾 Mapping saved: ${MAPPING_FILE}`);
  
  if (results.failed > 0) {
    console.log('\n⚠️  Failed uploads:');
    results.errors.forEach(err => {
      console.log(`  - ${err.path}: ${err.error}`);
    });
  }
  
  console.log('\n✨ Upload complete!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

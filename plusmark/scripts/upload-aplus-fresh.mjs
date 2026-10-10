/**
 * Upload fresh A+ images from source folder to Cloudinary
 * Source: C:\Users\Rishank\Downloads\A+-20261001T064232Z-1-001\A+
 * Format: Numbered files (2.jpg, 3.jpg, etc.) → 01.webp, 02.webp, etc.
 */
import { v2 as cloudinary } from 'cloudinary';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
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

const SOURCE_DIR = 'C:\\Users\\Rishank\\Downloads\\A+-20261001T064232Z-1-001\\A+';

// Folder mapping: source folder name → Cloudinary folder ID
const folderMapping = {
  // ECO
  'ECO/Non. Mag. WB': 'eco-premium-white-board',
  'ECO/Non. Mag. CB': 'eco-premium-chalk-board',
  'ECO/Notice Board': 'eco-premium-notice-board',
  'ECO/Mag. WB': 'eco-regular-magnetic-board',
  'ECO/Mag. CB': 'eco-magnetic-chalk-board',
  'ECO/Non. Both side': 'eco-premium-both-side-board',
  
  // Metallic
  'metallic/Non. Mag. WB': 'metallic-premium-white-board',
  'metallic/Non. Mag. CB': 'metallic-premium-chalk-board',
  'metallic/Notice Board': 'metallic-premium-notice-board',
  'metallic/Metallic  Mag. WB': 'metallic-magnetic-white-board',
  'metallic/Metallic  Mag. CB': 'metallic-magnetic-chalk-board',
  'metallic/Metallic Ceramic  WB': 'metallic-ceramic-white-board',
  'metallic/Metallic Ceramic  CB': 'metallic-ceramic-chalk-board',
};

// Get numbered A+ files (2.jpg to 9.jpg, excluding size files)
function getAplusFiles(folderPath) {
  const files = readdirSync(folderPath);
  const aplusFiles = files
    .filter(f => /^\d+\.jpg$/i.test(f)) // Only numbered .jpg files
    .filter(f => !f.startsWith('1_')) // Exclude size files (1_1x1 Feet.jpg)
    .sort((a, b) => {
      const numA = parseInt(a.match(/^(\d+)/)[1]);
      const numB = parseInt(b.match(/^(\d+)/)[1]);
      return numA - numB;
    });
  
  return aplusFiles;
}

// Upload single A+ image
async function uploadAplusImage(sourcePath, cloudinaryId, imageNumber) {
  try {
    const publicId = `plusmark/aplus/${cloudinaryId}/${String(imageNumber).padStart(2, '0')}`;
    
    const result = await cloudinary.uploader.upload(sourcePath, {
      public_id: publicId,
      resource_type: 'image',
      format: 'jpg',
      overwrite: true, // Overwrite existing
      invalidate: true,
    });
    
    return { success: true, url: result.secure_url, publicId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting fresh A+ images upload to Cloudinary...\n');
  
  const results = {
    total: 0,
    uploaded: 0,
    failed: 0,
    errors: []
  };
  
  for (const [sourceFolder, cloudinaryId] of Object.entries(folderMapping)) {
    const folderPath = join(SOURCE_DIR, sourceFolder);
    
    if (!existsSync(folderPath)) {
      console.log(`⚠️  Skipping ${sourceFolder} - folder not found`);
      continue;
    }
    
    const aplusFiles = getAplusFiles(folderPath);
    
    if (aplusFiles.length === 0) {
      console.log(`⚠️  No A+ files found in ${sourceFolder}`);
      continue;
    }
    
    console.log(`\n📁 ${sourceFolder} → ${cloudinaryId}`);
    console.log(`   Found ${aplusFiles.length} A+ images: ${aplusFiles.join(', ')}`);
    
    for (let i = 0; i < aplusFiles.length; i++) {
      const file = aplusFiles[i];
      const sourcePath = join(folderPath, file);
      
      // Map: 1.jpg → 01, 2.jpg → 02, etc. (keep same number)
      const sourceNum = parseInt(file.match(/^(\d+)/)[1]);
      const targetNum = sourceNum; // 1→1, 2→2, etc.
      
      results.total++;
      
      const result = await uploadAplusImage(sourcePath, cloudinaryId, targetNum);
      
      if (result.success) {
        results.uploaded++;
        console.log(`   ✅ ${file} → ${String(targetNum).padStart(2, '0')}.jpg`);
      } else {
        results.failed++;
        results.errors.push({ folder: sourceFolder, file, error: result.error });
        console.log(`   ❌ ${file} - ${result.error}`);
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total images:     ${results.total}`);
  console.log(`✅ Uploaded:      ${results.uploaded}`);
  console.log(`❌ Failed:        ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\n⚠️  Failed uploads:');
    results.errors.forEach(err => {
      console.log(`  - ${err.folder}/${err.file}: ${err.error}`);
    });
  }
  
  console.log('\n✨ Upload complete!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

import { v2 as cloudinary } from 'cloudinary';
import { readFileSync } from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'drt0rpkn2',
  api_key: '828927481674484',
  api_secret: '7RdeLQEkjEBB2llyZGg-UPFRG9g',
});

// Map local folders to Cloudinary product IDs
const replacements = [
  {
    localFolder: 'C:\\Users\\Rishank\\Downloads\\A+-20261001T064232Z-1-001\\A+\\metallic\\Metallic Ceramic  CB\\600x450',
    cloudinaryId: 'metallic-ceramic-chalk-board',
    files: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg']
  },
  {
    localFolder: 'C:\\Users\\Rishank\\Downloads\\A+-20261001T064232Z-1-001\\A+\\metallic\\Metallic Ceramic  WB\\600x450',
    cloudinaryId: 'metallic-ceramic-white-board',
    files: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg']
  },
  {
    localFolder: 'C:\\Users\\Rishank\\Downloads\\A+-20261001T064232Z-1-001\\A+\\ECO\\Non. Mag. CB\\600x450',
    cloudinaryId: 'deluxe-standard-ceramic-chalk-board',
    files: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg']
  },
];

async function replaceImages() {
  console.log('🔄 Starting image replacement...\n');

  for (const { localFolder, cloudinaryId, files } of replacements) {
    console.log(`📁 Processing: ${cloudinaryId}`);
    
    for (const filename of files) {
      const localPath = path.join(localFolder, filename);
      const imageNumber = filename.split('.')[0].padStart(2, '0');
      const publicId = `plusmark/aplus/${cloudinaryId}/${imageNumber}`;
      
      try {
        console.log(`   Uploading ${filename} → ${publicId}`);
        
        const result = await cloudinary.uploader.upload(localPath, {
          public_id: publicId,
          overwrite: true, // Replace existing image
          invalidate: true, // Clear CDN cache
          resource_type: 'image',
        });
        
        console.log(`   ✅ Success: ${result.secure_url}\n`);
      } catch (error) {
        console.error(`   ❌ Failed ${filename}:`, error.message, '\n');
      }
    }
  }
  
  console.log('✨ Replacement complete!');
}

replaceImages();

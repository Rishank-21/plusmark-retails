#!/usr/bin/env node
/**
 * Check what's already on Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkStatus() {
  try {
    console.log('Checking Cloudinary status...\n');
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'plusmark/',
      max_results: 500,
    });
    
    console.log(`Total assets in plusmark/ folder: ${result.resources.length}`);
    console.log(`\nFirst 10 assets:`);
    result.resources.slice(0, 10).forEach((resource) => {
      console.log(`  ${resource.public_id}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkStatus();

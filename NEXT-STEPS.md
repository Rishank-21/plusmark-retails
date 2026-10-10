# Next Steps - Cloudinary Migration

## Immediate Actions (Before Testing)

### 1. Upload Remaining Images to Cloudinary
**Priority: HIGH** - Many images are referenced but not yet uploaded

#### Option A: Manual Upload via Cloudinary Dashboard
1. Go to https://console.cloudinary.com/
2. Navigate to Media Library
3. Create folder structure: `plusmark/images/`
4. Upload folders:
   - `products/` (priority - product pages need these)
   - `clients/` (priority - homepage trusted by section)
   - `industries/` (priority - industries page)
   - `aplus/` (A+ listing banners)
5. Ensure public_id matches: `plusmark/images/{folder}/{filename-without-extension}`

#### Option B: Fix and Re-run Upload Script
1. Fix the JPG/WebP extension issue in A+ images:
   ```powershell
   cd C:\Users\Rishank\Downloads\A+-20261001T064232Z-1-001
   # Check actual file types and rename correctly
   ```

2. Update upload script with better error handling and resume capability

3. Re-run: `node scripts/migrate-to-cloudinary.mjs`

### 2. Test in Development Mode
```powershell
cd plusmark
npm run dev
```

Visit and verify:
- ✅ Homepage (`/`) - check client logos load
- ✅ Products page (`/products`) - check product cards
- ✅ Individual product pages (`/products/eco-premium-white-board`) - check gallery
- ✅ Industries page (`/industries`) - check industry scene photos
- ✅ About/Experience pages - check all images

### 3. Check Browser Console
Open browser dev tools (F12) and check for:
- ❌ 404 errors on image URLs
- ❌ CORS errors from Cloudinary
- ⚠️ Slow image loading times

## Before Production Deployment

### 4. Verify Image URLs
Create a test script to check all Cloudinary URLs resolve:
```javascript
// Check a sample of each image type
const testUrls = [
  'https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto/plusmark/images/plusmark-logo',
  'https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto,c_fill,g_auto/plusmark/images/products/eco-premium-white-board',
  'https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto/plusmark/images/aplus/eco-premium-white-board/01',
  'https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto,c_scale/plusmark/images/clients/delhi-public-school'
];

// Test each URL
```

### 5. Performance Testing
1. Run Lighthouse audit on key pages
2. Check WebPageTest results
3. Compare before/after metrics:
   - Page load time
   - Total page size
   - Image format (should be WebP/AVIF)
   - Largest Contentful Paint (LCP)

### 6. Cross-Browser Testing
Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### 7. Build and Deploy
```powershell
cd plusmark
npm run build
# Check build output for errors
# Deploy to staging/preview first
```

## After Production Deployment

### 8. Monitor Cloudinary Usage
1. Check Cloudinary dashboard for:
   - Bandwidth usage
   - Transformation credits
   - Storage quota
2. Set up usage alerts if near limits

### 9. Optimize Further (Optional)
Consider adding:
- Lazy loading for below-fold images
- Responsive image srcsets
- Blur-up placeholders (LQIP)
- WebP fallback for older browsers

### 10. Clean Up Local Files
**Only after confirming everything works!**
```powershell
# Backup first!
cd plusmark/public
# Create backup
Compress-Archive -Path images -DestinationPath ..\..\backups\images-backup-$(Get-Date -Format 'yyyyMMdd').zip

# Then delete
Remove-Item -Recurse -Force images\products
Remove-Item -Recurse -Force images\aplus
Remove-Item -Recurse -Force images\clients
Remove-Item -Recurse -Force images\industries
# Keep: images\*.svg, videos, 3D models
```

## Troubleshooting

### If Images Don't Load
1. Check Cloudinary public_id matches expected format
2. Verify NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local
3. Check remotePatterns in next.config.ts
4. Inspect browser network tab for actual URL being requested

### If Images are Slow
1. Check if f_auto,q_auto transformations are applied
2. Consider adding width/height parameters
3. Enable responsive images with srcset
4. Check Cloudinary CDN is being used (not origin server)

### If Build Fails
1. Check TypeScript errors in data files
2. Verify all imports resolve correctly
3. Check helper function signatures match usage

## Current Status

✅ **Completed**:
- Next.js configuration updated
- Helper library created
- All data files updated
- Build passes (117/117 pages)
- 72/310 images uploaded

⏳ **Pending**:
- Upload remaining 238 images
- Development testing
- Production deployment
- Local file cleanup

🚨 **Blockers**:
- Many A+ images need format fix (JPG files with .webp extension)
- Upload script timed out, needs completion

## Quick Commands

```powershell
# Development
cd plusmark
npm run dev

# Build
npm run build

# Upload images (after fixing script)
node scripts/migrate-to-cloudinary.mjs

# Check Cloudinary status
node scripts/check-cloudinary-status.mjs

# Update gallery/sizes if needed
node scripts/update-gallery-cloudinary.mjs
node scripts/update-sizes-cloudinary.mjs
```

---

**Last Updated**: October 10, 2026
**Status**: Code complete, ready for image upload and testing

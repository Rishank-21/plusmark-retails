# Fix 3D Model Logo Issue

## Problem
The Plusmark logo on 3D model frames appears bigger/different than the actual product frames in photos.

## Correct Logo
The correct logo is at `/public/images/plusmark-logo.png` (the one shown on actual product photos and website header).

Correct logo specifications:
- Style: "plusmark" text with orange "mark" portion
- Size: Should match the proportion seen in actual product photos
- Placement: Bottom-right corner of the board frame

## Files That Need Update
All `.glb` model files in this directory have the logo texture baked into them:
- metallic-premium-white-board.glb
- eco-premium-white-board.glb
- metallic-premium-chalk-board.glb
- eco-premium-chalk-board.glb
- metallic-premium-notice-board.glb
- eco-premium-notice-board.glb
- deluxe-standard-white-board.glb
- deluxe-standard-chalk-board.glb
- deluxe-standard-notice-board.glb
- eco-regular-white-board.glb
- eco-regular-chalk-board.glb
- eco-regular-notice-board.glb
- metallic-premium-magnetic-board.glb
- deluxe-standard-magnetic-board.glb
- eco-regular-magnetic-board.glb
- metallic-premium-ceramic-board.glb
- deluxe-standard-ceramic-board.glb
- combination-board.glb
- cork-notice-board.glb
- fabric-notice-board.glb
- All ADC notice board models
- clipboard models (if they have logo)

## How to Fix

### Option 1: Re-export from Blender/3D Software
1. Open each `.glb` model in Blender (or original 3D software)
2. Find the logo texture/material
3. Replace with the correct logo from `/public/images/plusmark-logo.png`
4. Ensure the logo size matches the proportion in actual product photos
5. Re-export as `.glb` with Draco compression
6. Replace the file in this directory

### Option 2: Using glTF Transform CLI
```bash
# Install gltf-transform
npm install -g @gltf-transform/cli

# For each model, you'll need to:
1. Extract textures: gltf-transform inspect metallic-premium-white-board.glb
2. Manually replace logo texture in image editing software
3. Re-pack the model with new texture
```

### Option 3: Batch Update Script
If you have the original 3D source files (.blend, .fbx, etc.):
1. Create a script to batch-replace logo textures
2. Re-export all models
3. Use `gltf-transform` to optimize and compress

## Verification
After fixing, verify by:
1. Loading the model on product detail page
2. Comparing logo size and appearance with product photos
3. Checking logo clarity in both close-up and far views

## Notes
- The logo should be crisp and not pixelated
- Size ratio should match actual product frames
- Color should match: blue "plus" + orange "mark"
- Position: Bottom-right corner of frame, consistent across all models

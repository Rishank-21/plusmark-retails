"""
Fix rounded corner images and re-upload to Cloudinary
This script flattens images that have transparent rounded corners
"""
import os
import sys
from pathlib import Path

try:
    from PIL import Image
    import cloudinary
    import cloudinary.uploader
except ImportError:
    print("Installing required packages...")
    os.system("pip install Pillow cloudinary")
    from PIL import Image
    import cloudinary
    import cloudinary.uploader

# Load environment variables
def load_env():
    env_path = Path(__file__).parent.parent / 'plusmark' / '.env.local'
    if not env_path.exists():
        raise FileNotFoundError('.env.local not found')
    
    env_vars = {}
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                if '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip().strip('"\'')
    
    return env_vars

env_vars = load_env()

# Configure Cloudinary
cloudinary.config(
    cloud_name=env_vars.get('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
    api_key=env_vars.get('CLOUDINARY_API_KEY'),
    api_secret=env_vars.get('CLOUDINARY_API_SECRET'),
    secure=True
)

def flatten_image(input_path, output_path):
    """
    Flatten image by removing transparency and rounded corners
    Converts to white background
    """
    print(f"  Processing: {os.path.basename(input_path)}")
    
    # Open image
    img = Image.open(input_path)
    
    # If image has transparency, flatten it
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        # Create white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        
        # Convert to RGBA if needed
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Paste image on white background
        background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
        img = background
    else:
        # Convert to RGB
        img = img.convert('RGB')
    
    # Save as JPEG (no transparency)
    img.save(output_path, 'JPEG', quality=95, optimize=True)
    print(f"    ✓ Flattened and saved")
    
    return output_path

def upload_to_cloudinary(file_path, cloudinary_id, image_number):
    """Upload image to Cloudinary"""
    public_id = f"plusmark/aplus/{cloudinary_id}/{str(image_number).zfill(2)}"
    
    print(f"  Uploading to Cloudinary: {public_id}")
    
    result = cloudinary.uploader.upload(
        file_path,
        public_id=public_id,
        resource_type='image',
        format='jpg',
        overwrite=True,
        invalidate=True
    )
    
    print(f"    ✓ Uploaded: {result['secure_url']}")
    return result

def main():
    print("=" * 60)
    print("FIX ROUNDED CORNER IMAGES - ALL 8 IMAGES")
    print("=" * 60)
    
    # Products to fix: (source_folder, cloudinary_id)
    products = [
        (
            r"C:\Users\Rishank\Downloads\A+-20261001T064232Z-1-001\A+\metallic\Metallic Ceramic  CB",
            "metallic-ceramic-chalk-board"
        ),
        (
            r"C:\Users\Rishank\Downloads\A+-20261001T064232Z-1-001\A+\metallic\Metallic Ceramic  WB",
            "metallic-ceramic-white-board"
        ),
        (
            r"C:\Users\Rishank\Downloads\A+-20261001T064232Z-1-001\A+\ECO\Non. Mag. CB",
            "deluxe-standard-ceramic-chalk-board"
        ),
    ]
    
    # Images to fix (all 8 images)
    images_to_fix = [
        (1, "01"),
        (2, "02"),
        (3, "03"),
        (4, "04"),
        (5, "05"),
        (6, "06"),
        (7, "07"),
        (8, "08"),
    ]
    
    temp_dir = Path(__file__).parent / 'temp_fixed'
    temp_dir.mkdir(exist_ok=True)
    
    for source_dir, cloudinary_id in products:
        print(f"\n{'='*60}")
        print(f"📦 Product: {cloudinary_id}")
        print(f"{'='*60}")
        
        for source_num, target_num in images_to_fix:
            # Special handling for ECO folder - use All size.jpg for image 1
            if cloudinary_id == "deluxe-standard-ceramic-chalk-board" and source_num == 1:
                source_file = Path(source_dir) / "All size.jpg"
            else:
                source_file = Path(source_dir) / f"{source_num}.jpg"
            
            if not source_file.exists():
                print(f"⚠️  Source file not found: {source_file}")
                continue
            
            print(f"\n📸 Processing {source_file.name} → {target_num}.jpg")
            
            # Flatten image
            temp_file = temp_dir / f"fixed_{cloudinary_id}_{target_num}.jpg"
            flatten_image(str(source_file), str(temp_file))
            
            # Upload to Cloudinary
            try:
                upload_to_cloudinary(str(temp_file), cloudinary_id, target_num)
                print(f"  ✅ Successfully fixed and uploaded!")
            except Exception as e:
                print(f"  ❌ Upload failed: {e}")
            
            # Clean up temp file
            if temp_file.exists():
                temp_file.unlink()
    
    # Clean up temp directory
    if temp_dir.exists() and not list(temp_dir.iterdir()):
        temp_dir.rmdir()
    
    print("\n" + "=" * 60)
    print("✨ Complete! Refresh browser with Ctrl+Shift+F5")
    print("=" * 60)

if __name__ == '__main__':
    main()

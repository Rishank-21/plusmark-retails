/**
 * Cloudinary image URL helper
 * Converts local /images/ paths to optimized Cloudinary URLs
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'drt0rpkn2';
const BASE_PATH = 'plusmark';

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}

/**
 * Convert local image path to Cloudinary URL with optimizations
 * @param localPath - Local path like "/images/products/board.webp"
 * @param options - Cloudinary transformation options
 */
export function getCloudinaryUrl(localPath: string, options: CloudinaryOptions = {}): string {
  // Remove leading slash, /images/ prefix, and file extension
  const path = localPath.replace(/^\//, '').replace(/^images\//, '').replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
  
  // Build public_id (without 'images' in path to match upload format)
  const publicId = `${BASE_PATH}/${path}`;
  
  // Build transformation string
  const transforms: string[] = [];
  
  // Always use auto format and quality for optimization
  transforms.push(`f_${options.format || 'auto'}`);
  transforms.push(`q_${options.quality || 'auto'}`);
  
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  if (options.gravity) transforms.push(`g_${options.gravity}`);
  
  const transformStr = transforms.join(',');
  
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${publicId}`;
}

/**
 * Get responsive srcset for an image
 */
export function getCloudinarySrcSet(localPath: string, widths: number[] = [640, 750, 828, 1080, 1200, 1920]): string {
  return widths
    .map((w) => `${getCloudinaryUrl(localPath, { width: w })} ${w}w`)
    .join(', ');
}

/**
 * Product image URL (optimized for product cards)
 */
export function getProductImageUrl(slug: string, width?: number): string {
  return getCloudinaryUrl(`/images/products/${slug}.webp`, {
    width,
    crop: 'fill',
    gravity: 'auto',
  });
}

/**
 * A+ listing image URL
 */
export function getAplusImageUrl(setId: string, imageNumber: number | string): string {
  const num = typeof imageNumber === 'number' ? String(imageNumber).padStart(2, '0') : imageNumber;
  const fileName = num ? `/${num}.webp` : '.webp';
  return getCloudinaryUrl(`/images/aplus/${setId}${fileName}`);
}

/**
 * Client logo URL (optimized for height-based scaling)
 */
export function getClientLogoUrl(clientId: string, height?: number): string {
  return getCloudinaryUrl(`/images/clients/${clientId}.png`, {
    height,
    crop: 'scale',
  });
}

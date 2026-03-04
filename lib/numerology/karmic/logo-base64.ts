/**
 * Logo & background images as base64 data URIs for PDF embedding.
 * Source: public/images/ (copied from original Numerologie assets)
 *
 * Images are lazy-loaded and cached on first access to avoid crashes
 * if the module is imported before files are available (e.g. during build).
 */
import * as fs from 'fs';
import * as path from 'path';

const cache = new Map<string, string>();

function toDataUri(filePath: string): string {
  const cached = cache.get(filePath);
  if (cached) return cached;

  const abs = path.join(process.cwd(), 'public', 'images', filePath);
  try {
    const buf = fs.readFileSync(abs);
    const ext = path.extname(filePath).slice(1).replace('jpg', 'jpeg');
    const uri = `data:image/${ext};base64,${buf.toString('base64')}`;
    cache.set(filePath, uri);
    return uri;
  } catch (err) {
    console.error(`[PDF Assets] Failed to load image: ${abs}`, (err as Error).message);
    // Return a 1px transparent PNG as fallback so PDF still generates (without images)
    const fallback = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualHQAAAABJRU5ErkJggg==';
    cache.set(filePath, fallback);
    return fallback;
  }
}

// Page background: dark teal gradient with mandala flower bottom-right (94 KB)
export const PDF_BACKGROUND = toDataUri('pdf-background.jpeg');

// Round logo with mandala frame (for cover page)
export const LOGO_FINAL = toDataUri('logo-final.jpg');

// Circle monogram only (for compact headers)
export const LOGO_CIRCLE = toDataUri('logo-circle.png');

// Banner with "НУМЕРОЛОГИЯ PRO Swetlana Wagner"
export const LOGO_BANNER_RU = toDataUri('logo-banner-ru.png');

// Swetlana Wagner portrait (for thank-you page)
export const SWETLANA_PHOTO = toDataUri('swetlana-about.jpg');

// Cover photo (Swetlana at café with tablet — for premium cover page)
export const COVER_PHOTO = toDataUri('cover-photo.jpg');

// Swetlana portrait (square, for about/thank-you sections)
export const SWETLANA_PORTRAIT = toDataUri('swetlana-portrait.png');

// Arcana card images (Rider-Waite-Smith, Public Domain)
export function getArcanaImage(num: number): string {
  const padded = num.toString().padStart(2, '0');
  return toDataUri(`arcana/arcana-${padded}.jpg`);
}

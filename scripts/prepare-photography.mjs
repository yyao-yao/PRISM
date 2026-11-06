import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'smol-toml';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = path.join(root, 'photography/sources');
const outputRoot = path.join(root, 'public/photography');
const temporaryRoot = path.join(root, 'public/.photography-preparing');
const config = parse(await fs.readFile(path.join(root, 'content/photography.toml'), 'utf8'));
const optionalFields = ['title', 'description', 'location', 'date', 'camera', 'collection', 'credit', 'license'];
const requireText = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a nonempty string.`);
  return value;
};
requireText(config.title, 'Gallery title');
if (config.description !== undefined) requireText(config.description, 'Gallery description');
if (!Array.isArray(config.photos)) throw new Error('photography.toml must contain a photos array.');
const ids = new Set();
const sources = [];
for (const photo of config.photos) {
  requireText(photo.id, 'Photo id');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(photo.id) || ids.has(photo.id)) throw new Error(`Invalid or duplicate photo id: ${photo.id}`);
  ids.add(photo.id);
  requireText(photo.src, `${photo.id} source`);
  requireText(photo.alt, `${photo.id} alt text`);
  const source = path.resolve(sourceRoot, photo.src);
  const relative = path.relative(sourceRoot, source);
  if (relative.startsWith('..') || path.isAbsolute(relative) || !/\.(jpe?g|png|webp)$/i.test(source)) throw new Error(`Invalid source path for ${photo.id}`);
  for (const field of optionalFields) if (photo[field] !== undefined) requireText(photo[field], `${photo.id} ${field}`);
  if (photo.sample !== undefined && typeof photo.sample !== 'boolean') throw new Error(`${photo.id} sample must be true or false.`);
  if (photo.source_url !== undefined && !/^https:\/\//.test(requireText(photo.source_url, `${photo.id} source_url`))) throw new Error(`${photo.id} source_url must use HTTPS.`);
  if (photo.sample && (!photo.credit || !photo.source_url || !photo.license)) throw new Error(`Sample ${photo.id} needs credit, source_url and license.`);
  const metadata = await sharp(source, { failOn: 'error' }).metadata();
  if (!metadata.width || !metadata.height || (metadata.pages || 1) > 1) throw new Error(`Unsupported image for ${photo.id}`);
  // Dimensions describe the visually oriented source, not the EXIF storage axes.
  const swapped = [5, 6, 7, 8].includes(metadata.orientation);
  sources.push({ photo, source, width: swapped ? metadata.height : metadata.width, height: swapped ? metadata.width : metadata.height });
}
await fs.rm(temporaryRoot, { recursive: true, force: true });
await fs.mkdir(temporaryRoot, { recursive: true });
try {
  const photos = [];
  for (const { photo, source, width, height } of sources) {
    const largestWidth = Math.min(width, Math.round(2400 * width / Math.max(width, height)));
    const widths = [...new Set([640, 1280, largestWidth].filter(w => w <= largestWidth))].sort((a, b) => a - b);
    const assets = { jpeg: [], webp: [] };
    for (const variantWidth of widths) {
      for (const format of ['jpeg', 'webp']) {
        const filename = `${photo.id}-${variantWidth}.${format === 'jpeg' ? 'jpg' : 'webp'}`;
        const image = sharp(source).rotate().resize({ width: variantWidth, withoutEnlargement: true });
        const result = await image[format](format === 'jpeg' ? { quality: 86, mozjpeg: true } : { quality: 84 }).toFile(path.join(temporaryRoot, filename));
        assets[format].push({ src: `/photography/${filename}`, width: result.width, height: result.height });
      }
    }
    const record = { id: photo.id, src: photo.src, alt: photo.alt, sample: photo.sample === true, width, height, assets };
    for (const field of optionalFields) if (photo[field] !== undefined) record[field] = photo[field];
    if (photo.source_url) record.sourceUrl = photo.source_url;
    photos.push(record);
  }
  await fs.writeFile(path.join(temporaryRoot, 'manifest.json'), JSON.stringify({ title: config.title, description: config.description, photos }, null, 2) + '\n');
  // Publish only a complete, validated set; stale assets disappear on removal/reorder.
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.rename(temporaryRoot, outputRoot);
  console.log(`Prepared ${photos.length} photographs with responsive JPEG/WebP assets.`);
} catch (error) {
  await fs.rm(temporaryRoot, { recursive: true, force: true });
  throw error;
}

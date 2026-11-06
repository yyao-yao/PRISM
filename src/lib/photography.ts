import fs from 'node:fs';
import path from 'node:path';
import type { PhotographyData } from '@/types/photography';

/** Server-only consumer of the validated, build-time image manifest. */
export function getPhotography(): PhotographyData {
  const filename = path.join(process.cwd(), 'public/photography/manifest.json');
  if (!fs.existsSync(filename)) {
    throw new Error('Photography assets are missing. Run npm run photos:prepare before Next.js.');
  }
  return JSON.parse(fs.readFileSync(filename, 'utf8')) as PhotographyData;
}

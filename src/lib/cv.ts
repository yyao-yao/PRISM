import fs from 'fs';
import path from 'path';

/** Evaluated at build time for the static export. Never publish a sample CV. */
export function hasOfficialCv(): boolean {
  try {
    const file = path.join(process.cwd(), 'public', 'cv.pdf');
    const header = Buffer.alloc(5);
    const fd = fs.openSync(file, 'r');
    try {
      return fs.readSync(fd, header, 0, 5, 0) === 5 && header.toString() === '%PDF-';
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return false;
  }
}

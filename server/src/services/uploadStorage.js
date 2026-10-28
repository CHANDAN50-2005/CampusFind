import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const uploadDirectory = fileURLToPath(new URL('../../uploads/', import.meta.url));
const supportedExtensions = new Set(['jpg', 'png', 'webp']);

export async function saveImage(file) {
  if (!file) return null;
  const extension = file.detectedExtension;
  if (!supportedExtensions.has(extension)) throw new Error('Unsupported image type.');
  await mkdir(uploadDirectory, { recursive: true });
  const filename = randomUUID() + '.' + extension;
  await writeFile(path.join(uploadDirectory, filename), file.buffer, { flag: 'wx' });
  return '/uploads/' + filename;
}

export async function removeImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;
  const filename = path.basename(imageUrl);
  if (filename !== imageUrl.slice('/uploads/'.length)) return;
  await unlink(path.join(uploadDirectory, filename)).catch(() => {});
}

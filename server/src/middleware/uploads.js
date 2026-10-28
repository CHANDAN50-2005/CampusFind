import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';

const allowedExtensions = new Set(['jpg', 'png', 'webp']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_request, file, callback) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new Error('Upload a JPG, PNG, or WebP image (maximum 5 MB).'));
      return;
    }
    callback(null, true);
  },
});

export const receiveItemImage = upload.single('image');

export async function verifyItemImage(request, response, next) {
  if (!request.file) return next();
  try {
    const fileType = await fileTypeFromBuffer(request.file.buffer);
    if (!fileType || !allowedExtensions.has(fileType.ext)) {
      return response.status(400).json({ message: 'The uploaded file is not a supported image.' });
    }
    request.file.detectedExtension = fileType.ext;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function uploadErrorHandler(error, _request, response, next) {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : 'Only one image can be uploaded per report.';
    return response.status(400).json({ message });
  }
  if (error) return response.status(400).json({ message: error.message || 'Image upload failed.' });
  return next();
}

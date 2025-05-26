import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Универсальная функция для создания хранилища
export function createMulterUpload({
  folder = 'uploads',
  allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  maxFileSize = 5 * 1024 * 1024 // 5 MB по умолчанию
}) {
  const uploadPath = path.resolve(folder);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadPath),
    filename: (_, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
      cb(null, uniqueName);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла'));
    }
  };

  return multer({
    storage,
    limits: { fileSize: maxFileSize },
    fileFilter
  });
}

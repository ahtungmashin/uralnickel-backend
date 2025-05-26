import multer from 'multer';

export default function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Ошибка загрузки файла: ${err.message}` });
  }

  if (err.message === 'Недопустимый тип файла') {
    return res.status(400).json({ message: err.message });
  }

  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Ошибка сервера'
  });
}

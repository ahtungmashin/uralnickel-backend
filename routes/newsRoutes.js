import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const router = express.Router();

// Для использования __dirname в ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../uploads/news');
const newsFilePath = path.join(__dirname, '../data/news.json');

// Гарантируем наличие директорий и файла
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(newsFilePath)) fs.writeFileSync(newsFilePath, '[]');

// Multer — обработка изображений
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Получить все новости
router.get('/', (req, res) => {
  const news = JSON.parse(fs.readFileSync(newsFilePath));
  res.json(news);
});

// Добавить новость
router.post('/', upload.single('image'), (req, res) => {
  const news = JSON.parse(fs.readFileSync(newsFilePath));
  const { title, description, date } = req.body;

  const newItem = {
    id: Date.now(),
    title,
    description,
    date,
    image: req.file ? `/uploads/news/${req.file.filename}` : null
  };

  news.unshift(newItem);
  fs.writeFileSync(newsFilePath, JSON.stringify(news, null, 2));
  res.status(201).json(newItem);
});

// Удалить новость
router.delete('/:id', (req, res) => {
  let news = JSON.parse(fs.readFileSync(newsFilePath));
  const id = parseInt(req.params.id);
  const item = news.find(n => n.id === id);

  if (!item) return res.status(404).json({ error: 'Новость не найдена' });

  if (item.image) {
    const imgPath = path.join(__dirname, '../', item.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  news = news.filter(n => n.id !== id);
  fs.writeFileSync(newsFilePath, JSON.stringify(news, null, 2));
  res.status(204).end();
});

export default router;

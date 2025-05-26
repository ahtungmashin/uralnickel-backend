import express from 'express';
import db from '../models/index.js';
import auth from '../middleware/authMiddleware.js';
import { createMulterUpload } from '../utils/multerConfig.js';

const { User } = db;
const router = express.Router();

// 📦 Upload профиля: фото до 2MB, только изображения
const upload = createMulterUpload({
  folder: 'uploads/profiles',
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 2 * 1024 * 1024 // 2MB
});

// 🔐 Получить всех пользователей (id + name)
router.get('/', auth, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name']
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// 🔐 Получить текущего пользователя
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      const err = new Error('Пользователь не найден');
      err.status = 404;
      return next(err);
    }

    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
});

// 🔐 Загрузить фотографию пользователя
router.post('/photo', auth, upload.single('photo'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      const err = new Error('Пользователь не найден');
      err.status = 404;
      return next(err);
    }

    user.photo = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({ photo: user.photo });
  } catch (err) {
    next(err);
  }
});

export default router;

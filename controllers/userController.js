import { User } from '../models';
import path from 'path';
import fs from 'fs/promises';

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      const err = new Error('Все поля обязательны');
      err.status = 400;
      return next(err);
    }

    const newUser = await User.create({ name, email, password });
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      const err = new Error('Пользователь не найден');
      err.status = 404;
      return next(err);
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      department: user.department,
      position: user.position,
      skills: user.skills,
      birthdate: user.birthdate,
      gender: user.gender,
      experience: user.experience,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      const err = new Error('Пользователь не найден');
      err.status = 404;
      return next(err);
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUserPhoto = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      const err = new Error('Пользователь не найден');
      err.status = 404;
      return next(err);
    }

    if (!req.file) {
      const err = new Error('Фотография не загружена');
      err.status = 400;
      return next(err);
    }

    if (!req.file.mimetype.startsWith('image/')) {
      const err = new Error('Можно загружать только изображения');
      err.status = 400;
      return next(err);
    }

    // Удаление старой фотографии, если она есть
    if (user.photo) {
      const oldPhotoPath = path.join(process.cwd(), user.photo);
      try {
        await fs.access(oldPhotoPath);
        await fs.unlink(oldPhotoPath);
        console.log(`Старая фотография пользователя ${userId} удалена: ${user.photo}`);
      } catch (err) {
        console.warn('Ошибка при удалении старой фотографии:', err.message);
      }
    }

    const photoPath = `/uploads/${req.file.filename}`;
    user.photo = photoPath;
    await user.save();

    console.log(`Фотография пользователя ${userId} обновлена: ${photoPath}`);
    res.json({ message: 'Фотография успешно загружена', photo: photoPath });
  } catch (err) {
    console.error('[PHOTO ERROR]', err);
    next(err);
  }
};

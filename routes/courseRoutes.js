import express from 'express';
import db from '../models/index.js';

import adminOnly from '../middleware/checkAdmin.js';
import auth from '../middleware/authMiddleware.js';
import { validateCourse } from '../middleware/validateCourse.js';
import { validationResult } from 'express-validator';
import { notifyUser, notifyRoles } from '../utils/notify.js';
import { createMulterUpload } from '../utils/multerConfig.js'; // ✅

const { Request, User, Course } = db;
const router = express.Router();

// 🧩 Upload с ограничением
const upload = createMulterUpload({
  folder: 'uploads/courses',
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 5 * 1024 * 1024 // 5 MB
});

// 🔍 Получить список курсов (администратор)
router.get('/all', auth, adminOnly, async (req, res, next) => {
  try {
    const allCourses = await Course.findAll();
    res.json(allCourses);
  } catch (err) {
    next(err);
  }
});

// 🔍 Получить список курсов (фильтрация по дате окончания)
router.get('/', auth, async (req, res, next) => {
  try {
    const user = req.user;
    const allCourses = await Course.findAll();

    if (user.role === 'admin') return res.json(allCourses);

    const now = new Date();
    const filtered = allCourses.filter(course => {
      const isOngoing = !course.end_date || new Date(course.end_date) >= now;
      return isOngoing;
    });

    res.json(filtered);
  } catch (err) {
    next(err);
  }
});

// 📨 Подать заявку на курс
router.post('/:id/apply', auth, async (req, res, next) => {
  const userId = req.user.userId;
  const courseId = req.params.id;

  try {
    const existing = await Request.findOne({ where: { user_id: userId, course_id: courseId } });
    if (existing) {
      const err = new Error('Вы уже подали заявку на этот курс.');
      err.status = 400;
      return next(err);
    }

    await Request.create({ user_id: userId, course_id: courseId, status: 'pending' });

    const user = await User.findByPk(userId);
    const course = await Course.findByPk(courseId);

    await notifyUser(userId, `Вы успешно подали заявку на курс "${course.title}". Статус: на рассмотрении.`, 'Заявка на курс');
    await notifyRoles({
      role: 'manager',
      department: user.department,
      message: `Сотрудник ${user.name} подал заявку на курс "${course.title}". Подтвердите участие.`
    });

    res.json({ message: 'Заявка подана успешно.' });
  } catch (err) {
    next(err);
  }
});

// ➕ Добавить курс
router.post('/', auth, adminOnly, upload.single('photo'), validateCourse, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Ошибка валидации');
    err.status = 400;
    err.details = errors.array();
    return next(err);
  }

  try {
    const {
      title,
      description,
      cost,
      start_date,
      end_date,
      department,
      competencies = '[]',
      link
    } = req.body;

    const photo = req.file ? `/uploads/courses/${req.file.filename}` : null;

    const course = await Course.create({
      title,
      description,
      cost,
      start_date,
      end_date,
      department,
      competencies: JSON.parse(competencies),
      photo,
      link
    });

    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
});

// ✏️ Обновить курс
router.put('/:id', auth, adminOnly, upload.single('photo'), async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      const err = new Error('Курс не найден');
      err.status = 404;
      return next(err);
    }

    const {
      title,
      description,
      cost,
      start_date,
      end_date,
      department,
      competencies,
      link
    } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (cost) course.cost = cost;
    if (start_date) course.start_date = start_date;
    if (end_date) course.end_date = end_date;
    if (department) course.department = department;
    if (competencies) course.competencies = JSON.parse(competencies);
    if (link) course.link = link;
    if (req.file) course.photo = `/uploads/courses/${req.file.filename}`;

    await course.save();
    res.json(course);
  } catch (err) {
    next(err);
  }
});

// ❌ Удалить курс
router.delete('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      const err = new Error('Курс не найден');
      err.status = 404;
      return next(err);
    }

    await course.destroy();
    res.json({ message: 'Курс удалён' });
  } catch (err) {
    next(err);
  }
});

export default router;

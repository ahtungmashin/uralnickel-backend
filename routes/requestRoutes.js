import express from 'express';
import { Request, User, Course } from '../models/index.js';
import auth from '../middleware/authMiddleware.js';
import currentUser from '../middleware/currentUser.js';
import { notifyUser } from '../utils/notify.js';

const router = express.Router();

// 🔐 Заявки, доступные руководителю отдела
router.get('/', auth, currentUser, async (req, res, next) => {
  try {
    const current = req.currentUser;

    if (current.role !== 'manager') {
      const err = new Error('Доступ запрещён');
      err.status = 403;
      return next(err);
    }

    const requests = await Request.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'department'], as: 'user' },
        { model: Course, attributes: ['id', 'title'], as: 'course' }
      ],
      order: [['createdAt', 'DESC']]
    });

    const filtered = requests.filter(r => r.user?.department === current.department);
    res.json(filtered);
  } catch (err) {
    next(err);
  }
});

// ✅ Подтверждение заявки
router.patch('/:id/approve', auth, currentUser, async (req, res, next) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user' },
        { model: Course, as: 'course' }
      ]
    });

    if (!request) {
      const err = new Error('Заявка не найдена');
      err.status = 404;
      return next(err);
    }

    request.status = 'approved';
    await request.save();

    const { user, course } = request;
    const link = course?.link || '';

    await notifyUser(
      user.id,
      `Ваша заявка на курс "${course.title}" была подтверждена.`,
      'Заявка подтверждена',
      link
    );

    res.json({ message: 'Заявка подтверждена' });
  } catch (err) {
    next(err);
  }
});

// ❌ Отклонение заявки
router.patch('/:id/reject', auth, currentUser, async (req, res, next) => {
  try {
    const request = await Request.findByPk(req.params.id, {
      include: [{ model: User, as: 'user' }, { model: Course, as: 'course' }]
    });

    if (!request) {
      const err = new Error('Заявка не найдена');
      err.status = 404;
      return next(err);
    }

    request.status = 'rejected';
    await request.save();

    const { user, course } = request;

    await notifyUser(
      user.id,
      `Ваша заявка на курс "${course?.title}" была отклонена.`,
      'Заявка отклонена'
    );

    res.json({ message: 'Заявка отклонена' });
  } catch (err) {
    next(err);
  }
});

export default router;

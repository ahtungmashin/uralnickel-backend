import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { ProjectRequest, Project, User } from '../models/index.js';
import { notifyUser } from '../utils/notify.js';
import currentUser from '../middleware/currentUser.js';

const router = express.Router();

// 📥 Заявки на проекты для руководителя отдела
router.get('/', auth, currentUser, async (req, res, next) => {
  try {
    const current = req.currentUser;

    if (current.role !== 'manager') {
      const err = new Error('Доступ запрещён');
      err.status = 403;
      return next(err);
    }

    const requests = await ProjectRequest.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'department'] },
        { model: Project, as: 'project', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const filtered = requests.filter(r => r.user?.department === current.department);
    res.json(filtered);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/request', auth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      const err = new Error('Проект не найден');
      err.status = 404;
      return next(err);
    }

    const raw = user.competencies;
    const userComps = Array.isArray(raw) ? raw : JSON.parse(raw || '[]');
    const required = project.competencies_required || [];

    const missing = Object.values(required)
      .flat()
      .filter(r => !userComps.includes(r));

    if (missing.length) {
      const err = new Error(`Отказ: не хватает компетенций: ${missing.join(', ')}`);
      err.status = 400;
      return next(err);
    }

    const existing = await ProjectRequest.findOne({
      where: { user_id: user.id, project_id: project.id }
    });

    if (existing) {
      const err = new Error('Вы уже подали заявку на этот проект.');
      err.status = 409;
      return next(err);
    }

    const request = await ProjectRequest.create({
      user_id: user.id,
      project_id: project.id,
      status: 'pending'
    });

    await notifyUser(user.id, `Вы подали заявку на участие в проекте: "${project.title}"`);

    if (project.managerId) {
      const manager = await User.findByPk(project.managerId);
      const messageManager = `Сотрудник ${user.name} подал заявку на проект "${project.title}"`;
      await notifyUser(manager.id, messageManager);
    }

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/approve', auth, async (req, res, next) => {
  try {
    const request = await ProjectRequest.findByPk(req.params.id);
    if (!request) {
      const err = new Error('Заявка не найдена');
      err.status = 404;
      return next(err);
    }

    const project = await Project.findByPk(request.project_id);
    if (!project) {
      const err = new Error('Проект не найден');
      err.status = 404;
      return next(err);
    }

    request.status = 'approved';
    await request.save();

    const message = `✅ Ваша заявка на проект "${project.title}" была подтверждена.`;
    await notifyUser(request.user_id, message);

    res.json({ message: 'Заявка подтверждена и уведомление отправлено' });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/reject', auth, async (req, res, next) => {
  try {
    const request = await ProjectRequest.findByPk(req.params.id);
    if (!request) {
      const err = new Error('Заявка не найдена');
      err.status = 404;
      return next(err);
    }

    const project = await Project.findByPk(request.project_id);

    request.status = 'rejected';
    await request.save();

    const message = `❌ Ваша заявка на проект "${project.title}" была отклонена.`;
    await notifyUser(request.user_id, message);

    res.json({ message: 'Заявка отклонена' });
  } catch (err) {
    next(err);
  }
});

export default router;

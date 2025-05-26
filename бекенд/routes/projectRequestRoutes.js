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
      return res.status(403).json({ message: 'Доступ запрещён' });
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

// 📨 Подать заявку на проект
router.post('/:id/request', auth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    // 1. Проверка: уже есть заявка?
    const existing = await ProjectRequest.findOne({
      where: { user_id: user.id, project_id: project.id }
    });

    if (existing) {
      return res.status(409).json({ message: 'Вы уже подали заявку на этот проект.' });
    }

    // 2. Проверка: должность пользователя входит в открытые роли
    const userComps = Array.isArray(user.competencies)
      ? user.competencies
      : JSON.parse(user.competencies || '[]');

    const userPosition = user.position;
    const requiredComps = project.competencies_required || {};

    if (!Object.keys(requiredComps).includes(userPosition)) {
      return res.status(400).json({
        message: `Для вашей должности "${userPosition}" нет открытых ролей в проекте.`
      });
    }

    // 3. Проверка: компетенции только по этой должности
    const needed = requiredComps[userPosition] || [];
    const missing = needed.filter(c => !userComps.includes(c));

    if (missing.length) {
      return res.status(400).json({
        message: `Отказ: не хватает компетенций для вашей должности: ${missing.join(', ')}`
      });
    }

    // 4. Создание заявки
    const request = await ProjectRequest.create({
      user_id: user.id,
      project_id: project.id,
      status: 'pending'
    });

    await notifyUser(user.id, `Вы подали заявку на участие в проекте: "${project.title}"`);

    if (project.managerId) {
      const manager = await User.findByPk(project.managerId);
      await notifyUser(manager.id, `Сотрудник ${user.name} подал заявку на проект "${project.title}"`);
    }

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

// ✅ Подтвердить заявку
router.patch('/:id/approve', auth, currentUser, async (req, res, next) => {
  try {
    const request = await ProjectRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const project = await Project.findByPk(request.project_id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const current = req.currentUser;

    if (project.managerId !== current.id) {
      return res.status(403).json({ message: 'Вы не являетесь руководителем проекта' });
    }

    request.status = 'approved';
    await request.save();

    await notifyUser(request.user_id, `✅ Ваша заявка на проект "${project.title}" была подтверждена.`);

    res.json({ message: 'Заявка подтверждена и уведомление отправлено' });
  } catch (err) {
    next(err);
  }
});

// ❌ Отклонить заявку
router.patch('/:id/reject', auth, currentUser, async (req, res, next) => {
  try {
    const request = await ProjectRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }

    const project = await Project.findByPk(request.project_id);
    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const current = req.currentUser;

    if (project.managerId !== current.id) {
      return res.status(403).json({ message: 'Вы не являетесь руководителем проекта' });
    }

    request.status = 'rejected';
    await request.save();

    await notifyUser(request.user_id, `❌ Ваша заявка на проект "${project.title}" была отклонена.`);

    res.json({ message: 'Заявка отклонена и уведомление отправлено' });
  } catch (err) {
    next(err);
  }
});

export default router;

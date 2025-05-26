import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { validationResult } from 'express-validator';

import auth from '../middleware/authMiddleware.js';
import currentUser from '../middleware/currentUser.js';
import adminOnly from '../middleware/checkAdmin.js';
import { validateProject } from '../middleware/validateProject.js';

import { Project, User, ProjectRequest } from '../models/index.js';

const router = express.Router();

// Создание директории uploads/projects
const projectDir = path.join(path.resolve(), 'uploads/projects');
if (!fs.existsSync(projectDir)) {
  fs.mkdirSync(projectDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, projectDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`)
});
const upload = multer({ storage });

// ➕ Создание проекта
router.post(
  '/',
  auth,
  currentUser,
  adminOnly,
  upload.single('photo'),
  validateProject,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Ошибка валидации');
      err.status = 400;
      err.details = errors.array();
      return next(err);
    }

    try {
      const photo = req.file ? `/uploads/projects/${req.file.filename}` : null;
      const managerId = parseInt(req.body.managerId);
      const manager = await User.findByPk(managerId);

      const data = {
        ...req.body,
        photo,
        managerId: manager?.id || null,
        positions_required: JSON.parse(req.body.positions_required || '{}'),
        competencies_required: JSON.parse(req.body.competencies_required || '{}'),
        departments: JSON.parse(req.body.departments || '[]'),
        startDate: req.body.startDate
      };

      const created = await Project.create(data);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }
);

// 🔄 Обновление проекта
router.put('/:id', auth, adminOnly, upload.single('photo'), async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      const err = new Error('Проект не найден');
      err.status = 404;
      return next(err);
    }

    const {
      title,
      description,
      startDate,
      departments,
      managerId,
      positions_required,
      competencies_required
    } = req.body;

    project.title = title;
    project.description = description;
    project.startDate = startDate;
    project.departments = JSON.parse(departments);
    project.managerId = managerId;
    project.positions_required = JSON.parse(positions_required);
    project.competencies_required = JSON.parse(competencies_required);

    if (req.file) {
      project.photo = `/uploads/projects/${req.file.filename}`;
    }

    await project.save();
    res.json({ message: 'Проект обновлён', project });
  } catch (err) {
    next(err);
  }
});

// 📦 Получение проектов
router.get('/', auth, currentUser, async (req, res, next) => {
  const user = req.currentUser;
  const now = new Date();

  try {
    const allProjects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'name']
        },
        {
          model: ProjectRequest,
          as: 'requests',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'department', 'position', 'competencies']
            }
          ]
        }
      ],
      order: [['startDate', 'ASC']]
    });

    if (user.role === 'admin') {
      return res.json(allProjects);
    }

    if (user.role === 'manager') {
      const managed = allProjects.filter(p => p.managerId === user.id);
      return res.json(managed);
    }

    // простой сотрудник
    const filtered = allProjects.filter(p => {
      const departments = Array.isArray(p.departments)
        ? p.departments
        : JSON.parse(p.departments || '[]');

      const positions = typeof p.positions_required === 'object'
        ? Object.keys(p.positions_required || {})
        : Object.keys(JSON.parse(p.positions_required || '{}'));

      const start = new Date(p.startDate);

      return (
        start > now &&
        departments.includes(user.department) &&
        positions.includes(user.position)
      );
    });

    res.json(filtered);
  } catch (err) {
    console.error('[GET /projects]', err);
    next(err);
  }
});

// ❌ Удаление проекта
router.delete('/:id', auth, adminOnly, async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      const err = new Error('Проект не найден');
      err.status = 404;
      return next(err);
    }

    await project.destroy();
    res.json({ message: 'Проект удалён' });
  } catch (err) {
    next(err);
  }
});

export default router;

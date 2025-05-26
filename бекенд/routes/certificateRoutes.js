import express from 'express';
import db from '../models/index.js';
import { notifyUser, notifyRoles } from '../utils/notify.js';
import checkManagerOrAdmin from '../middleware/checkAdmin.js';
import { createMulterUpload } from '../utils/multerConfig.js';

const { Certificate, User, Course } = db;
const router = express.Router();

// 🧩 Upload для PDF, max 10MB
const upload = createMulterUpload({
  folder: 'uploads/certificates',
  allowedMimeTypes: ['application/pdf'],
  maxFileSize: 10 * 1024 * 1024 // 10MB
});

// 🔍 Все неподтверждённые сертификаты
router.get('/', checkManagerOrAdmin, async (req, res, next) => {
  try {
    const certificates = await Certificate.findAll({
      where: { is_verified: false },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'department'] }]
    });
    res.json(certificates);
  } catch (err) {
    next(err);
  }
});

// 🔍 Сертификаты текущего пользователя
router.get('/my', async (req, res, next) => {
  try {
    const certificates = await Certificate.findAll({
      where: { user_id: req.currentUser.id }
    });
    res.json(certificates);
  } catch (err) {
    next(err);
  }
});

// ⬆️ Загрузка сертификата
router.post('/', upload.single('certificate'), async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('Файл не прикреплён или неверный формат (только PDF)');
      err.status = 400;
      return next(err);
    }

    const file_path = `/uploads/certificates/${req.file.filename}`;

    const cert = await Certificate.create({
      user_id: req.currentUser.id,
      file_path,
      is_verified: false
    });

    await notifyUser(req.currentUser.id, `Вы загрузили сертификат. Он будет проверен менеджером.`);
    await notifyRoles({
      role: 'manager',
      department: req.currentUser.department,
      message: `${req.currentUser.name} загрузил новый сертификат для проверки.`
    });

    res.status(201).json(cert);
  } catch (err) {
    next(err);
  }
});

// ✅ Подтверждение сертификата и привязка курса
router.patch('/:id/verify', async (req, res, next) => {
  try {
    const cert = await Certificate.findByPk(req.params.id);
    if (!cert) {
      return res.status(404).json({ message: 'Сертификат не найден' });
    }

    const user = await User.findByPk(cert.user_id);
    const manager = req.currentUser;

    if (manager.role !== 'admin' && manager.department !== user.department) {
      return res.status(403).json({ message: 'Нет доступа к подтверждению' });
    }

    const courseId = req.body.course_id;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(400).json({ message: 'Курс не найден' });
    }

    // ✅ Сохраняем курс в сертификат
    cert.course_id = courseId;
    cert.is_verified = true;
    await cert.save();

    // ✅ Безопасный парсинг компетенций пользователя
    let userCompetencies = [];
    try {
      const parsed = JSON.parse(user.competencies || '[]');
      userCompetencies = Array.isArray(parsed) ? parsed : [];
    } catch {
      userCompetencies = [];
    }

    const compSet = new Set(userCompetencies);
    const courseCompetencies = course.competencies || [];
    courseCompetencies.forEach(c => compSet.add(c));

    user.competencies = [...compSet];
    await user.save();

    await notifyUser(user.id, `✅ Ваш сертификат подтверждён. Компетенции добавлены из курса "${course.title}".`);

    res.json({ message: 'Сертификат подтверждён и компетенции обновлены' });
  } catch (err) {
    next(err);
  }
});


export default router;

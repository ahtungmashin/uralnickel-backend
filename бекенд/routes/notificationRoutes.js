import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { Notification } from '../models/index.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    console.log('[NOTIFICATIONS] userId:', req.user?.userId);
    const notes = await Notification.findAll({
      where: { user_id: req.user.userId },
      order: [['createdAt', 'DESC']]
    });
    console.log('[NOTIFICATIONS] Result:', notes);
    res.json(notes); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/read', auth, async (req, res) => {
  try {
    const note = await Notification.findByPk(req.params.id);
    if (!note || note.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Нет доступа к уведомлению' });
    }

    note.read = true;
    await note.save();
    res.json({ message: 'Уведомление прочитано' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

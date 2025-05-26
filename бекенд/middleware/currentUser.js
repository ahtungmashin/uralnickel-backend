import { User } from '../models/index.js';

export default async function currentUser(req, res, next) {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(401).json({ message: 'Пользователь не найден' });

    req.currentUser = user;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}

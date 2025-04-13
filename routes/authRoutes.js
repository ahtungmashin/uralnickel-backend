import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { parseCompetencies } from '../utils/parse.js';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      const error = new Error('Неверные данные (пользователь не найден)');
      error.status = 401;
      return next(error);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Неверные данные (пароль не совпадает)');
      error.status = 401;
      return next(error);
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        competencies: parseCompetencies(user.competencies)
      }
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    next(err); // передаём в centralized error handler
  }
});

export default router;

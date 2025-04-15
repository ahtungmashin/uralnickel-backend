import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import { sequelize } from './models/index.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import projectRequestRoutes from './routes/projectRequestRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import newsRoutes from './routes/newsRoutes.js';

import auth from './middleware/authMiddleware.js';
import currentUser from './middleware/currentUser.js';
import errorHandler from './middleware/errorHandler.js';
import corsMiddleware from './middleware/CORSmiddleware.js'; // ✅

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS middleware
app.use(corsMiddleware);

// 📁 Статические файлы
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// 🔧 Базовые middleware
app.use(express.json());

// 🔓 Публичные маршруты
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);

// 🔐 Защищённые маршруты
app.use(auth, currentUser);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/project-requests', projectRequestRoutes);
app.use('/api/notifications', notificationRoutes);

// 💡 Проверка доступности сервера
app.get('/', (req, res) => {
  res.send('API is running');
});

// 🔌 Socket.IO с CORS
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      const allowlist = [
        'http://localhost:5173',
        'https://uralnickel-frontend.vercel.app'
      ];
      if (!origin) return callback(null, true);
      const isVercelPreview = origin.endsWith('.vercel.app');
      if (allowlist.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        console.warn('⛔ [Socket.IO] Запрещённый origin:', origin);
        callback(new Error('Not allowed by Socket.IO CORS'));
      }
    },
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized: no token'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId || decoded.id;
    next();
  } catch (err) {
    next(new Error('Unauthorized: invalid token'));
  }
});

io.on('connection', (socket) => {
  const room = `notification-${socket.userId}`;
  socket.join(room);
  console.log(`📡 Пользователь ${socket.userId} подключён к комнате ${room}`);
});

global.io = io;

// 🚀 Запуск сервера
sequelize.sync().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Ошибка подключения к базе данных:', err);
});

// 🧯 Обработка ошибок
app.use(errorHandler);

import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

import UserModel from './User.js';
import CourseModel from './Course.js';
import CertificateModel from './Certificate.js';
import RequestModel from './Request.js';
import ProjectModel from './Project.js';
import ProjectRequestModel from './ProjectRequest.js';
import NotificationModel from './Notification.js';
import NewsModel from './News.js';

// __dirname в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка переменных окружения
dotenv.config();

// Подключение через переменные окружения
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

// Инициализация моделей
const User = UserModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const Certificate = CertificateModel(sequelize, DataTypes);
const Request = RequestModel(sequelize, DataTypes);
const Project = ProjectModel(sequelize, DataTypes);
const ProjectRequest = ProjectRequestModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const News = NewsModel(sequelize, DataTypes);

// Ассоциации, если есть
Object.values(sequelize.models).forEach((model) => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

// Экспорт
export {
  sequelize,
  Sequelize,
  User,
  Course,
  Certificate,
  Request,
  Project,
  ProjectRequest,
  Notification,
  News
};

export default {
  sequelize,
  Sequelize,
  User,
  Course,
  Certificate,
  Request,
  Project,
  ProjectRequest,
  Notification,
  News
};

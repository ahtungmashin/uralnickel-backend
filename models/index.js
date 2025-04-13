import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from 'url';

// Модели
import UserModel from './User.js';
import CourseModel from './Course.js';
import CertificateModel from './Certificate.js';
import RequestModel from './Request.js';
import ProjectModel from './Project.js';
import ProjectRequestModel from './ProjectRequest.js';
import NotificationModel from './Notification.js';
import NewsModel from './News.js';

// Для __dirname в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Конфигурация подключения
const configPath = path.join(__dirname, '../config/config.json');
const configJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const config = configJson['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

// Инициализация моделей
const User = UserModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const Certificate = CertificateModel(sequelize, DataTypes);
const Request = RequestModel(sequelize, DataTypes);
const Project = ProjectModel(sequelize, DataTypes);
const ProjectRequest = ProjectRequestModel(sequelize, DataTypes);
const Notification = NotificationModel(sequelize, DataTypes);
const News = NewsModel(sequelize, DataTypes);

// Ассоциации, если есть associate в модели
Object.values(sequelize.models).forEach(model => {
  if (model.associate) {
    model.associate(sequelize.models);
  }
});

// Экспорт моделей и sequelize
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

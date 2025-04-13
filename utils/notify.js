import db from '../models/index.js';
import sendNotification from './sendNotification.js';

const { User } = db;

/**
 * Отправить уведомление одному пользователю
 * @param {number} userId - ID пользователя
 * @param {string} message - Текст уведомления
 * @param {string} [title] - Заголовок (необязательный)
 * @param {string} [link] - Ссылка (необязательная)
 */
export async function notifyUser(userId, message, title = '', link = '') {
  try {
    const finalTitle = title || 'Уведомление';
    const notification = await sendNotification(userId, message, finalTitle, link);

    const channel = `notification-${userId}`;
    if (global.io) {
      global.io.to(channel).emit(channel, {
        id: notification.id,
        title: finalTitle,
        message,
        link
      });
      console.log(`📨 Отправлено уведомление в канал ${channel}`);
    }
  } catch (err) {
    console.error(`❌ Ошибка при отправке уведомления пользователю (ID ${userId}):`, err);
  }
}

/**
 * Отправить уведомления всем пользователям по роли и отделу
 * @param {object} options
 * @param {string} options.role - Роль получателя
 * @param {string} [options.department] - Отдел (необязательный)
 * @param {string} options.message - Сообщение
 * @param {string} [options.title] - Заголовок (необязательный)
 * @param {string} [options.link] - Ссылка (необязательная)
 */
export async function notifyRoles({ role, department, message, title = '', link = '' }) {
  try {
    const where = department ? { role, department } : { role };
    const users = await User.findAll({ where });
    const finalTitle = title || 'Уведомление';

    for (const user of users) {
      const notification = await sendNotification(user.id, message, finalTitle, link);
      const channel = `notification-${user.id}`;

      if (global.io) {
        global.io.to(channel).emit(channel, {
          id: notification.id,
          title: finalTitle,
          message,
          link
        });
        console.log(`📨 Уведомление отправлено пользователю ${user.id} в канал ${channel}`);
      }
    }
  } catch (err) {
    console.error(`❌ Ошибка при массовой отправке уведомлений для роли "${role}":`, err);
  }
}

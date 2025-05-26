import db from '../models/index.js';

const { Notification } = db;

/**
 * Создаёт и сохраняет новое уведомление в базе данных
 * @param {number} userId - ID получателя
 * @param {string} message - Основной текст уведомления
 * @param {string} [title] - Заголовок (по умолчанию: ' Уведомление')
 * @param {string} [link] - Ссылка для перехода (опционально)
 * @returns {Promise<Notification>} - Сохранённое уведомление
 */
export default async function sendNotification(userId, message, title = 'Уведомление', link = '') {
  try {
    const notification = await Notification.create({
      user_id: userId,
      message,
      title: title || 'Уведомление',
      link: link || null,
      read: false
    });

    console.log(`✅ Уведомление сохранено для userId=${userId}, id=${notification.id}`);
    return notification;
  } catch (err) {
    console.error(`❌ Ошибка при создании уведомления для userId=${userId}:`, err);
    throw err;
  }
}

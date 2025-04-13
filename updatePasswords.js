const { sequelize, User } = require('./models'); // Импортируем модели
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function updateUserPasswords() {
  try {
    // Подключение к базе данных
    await sequelize.authenticate();  // Проверяем соединение с БД
    console.log('Соединение с базой данных успешно установлено');

    // Получаем всех пользователей
    const users = await User.findAll();
    console.log(`Найдено ${users.length} пользователей для обновления`);

    for (const user of users) {
      if (user.password) {
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashedPassword;
        // Сохраняем обновлённого пользователя в базе данных
        await user.save();
        console.log(`Пароль пользователя ${user.email} обновлён`);
      }
    }
    console.log('Пароли обновлены!');
  } catch (error) {
    console.error('Ошибка при обновлении паролей:', error);
  }
}

// Запуск функции обновления паролей
updateUserPasswords();

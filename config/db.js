const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('uralnickel', 'root', 'admin', {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = sequelize;

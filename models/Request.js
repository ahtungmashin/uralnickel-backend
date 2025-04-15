// models/Request.js
export default (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    user_id: DataTypes.INTEGER,
    course_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    }
  }, {
    tableName: 'requests', // 👈 обязательно!
  });

  Request.associate = models => {
    Request.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Request.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
  };

  return Request;
  
};

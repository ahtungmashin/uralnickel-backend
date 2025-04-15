export default (sequelize, DataTypes) => {
  return sequelize.define('Notification', {
    user_id: DataTypes.INTEGER,
    message: DataTypes.STRING,
    title: DataTypes.STRING,
    link: DataTypes.STRING,
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true,
    tableName: 'notifications', // 👈 обязательно!
  });
};

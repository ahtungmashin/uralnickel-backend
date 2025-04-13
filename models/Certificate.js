export default (sequelize, DataTypes) => {
  const Certificate = sequelize.define('Certificate', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true // Важно для createdAt
  });

  // 🔗 Ассоциации
  Certificate.associate = (models) => {
    Certificate.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' });
    Certificate.belongsTo(models.Course, { foreignKey: 'course_id' });
  };

  return Certificate;
};

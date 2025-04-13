export default (sequelize, DataTypes) => {
  const ProjectRequest = sequelize.define('ProjectRequest', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    }
  });

  // Добавляем ассоциации
  ProjectRequest.associate = (models) => {
    ProjectRequest.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    ProjectRequest.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
  };

  return ProjectRequest;
};

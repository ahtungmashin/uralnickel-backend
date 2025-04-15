export default (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    departments: {
      type: DataTypes.JSON, // Пример: ['Отдел 1', 'Отдел 2']
      allowNull: false
    },
    positions_required: {
      type: DataTypes.JSON, // Пример: { "Инженер": 2 }
      allowNull: false
    },
    competencies_required: {
      type: DataTypes.JSON, // Пример: { "Инженер": ["AutoCAD"] }
      allowNull: false
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true,
    tableName: 'projects', // 👈 обязательно!
  });
    Project.associate = (models) => {
    Project.belongsTo(models.User, { foreignKey: 'managerId', as: 'manager' });
  };
  return Project;
};

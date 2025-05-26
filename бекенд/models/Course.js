import { parseCompetencies } from '../utils/parse.js';

export default (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    departments: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const raw = this.getDataValue('departments');
        try {
          return JSON.parse(raw);
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue('departments', JSON.stringify(value));
      }
    },
    competencies: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const raw = this.getDataValue('competencies');
        return parseCompetencies(raw);
      },
      set(value) {
        this.setDataValue('competencies', JSON.stringify(value));
      }
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'courses'
  });

  //Добавляем ассоциацию с каскадным удалением заявок
  Course.associate = models => {
    Course.hasMany(models.Request, {
      foreignKey: 'course_id',
      as: 'requests',
      onDelete: 'CASCADE',
      hooks: true
    });
  };

  return Course;
};

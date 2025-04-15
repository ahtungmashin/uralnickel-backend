import { parseCompetencies } from '../utils/parse.js';

export default (sequelize, DataTypes) => {
  return sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    department: DataTypes.STRING,
    position: DataTypes.STRING,
    photo: DataTypes.STRING,
    skills: DataTypes.TEXT,
    competencies: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const raw = this.getDataValue('competencies');
        return parseCompetencies(raw);
      },
      set(value) {
        // ✅ Защита от двойной сериализации
        if (typeof value === 'string') {
          this.setDataValue('competencies', value);
        } else {
          this.setDataValue('competencies', JSON.stringify(value));
        }
      }
    }
    ,
    birthdate: DataTypes.DATEONLY,
    gender: DataTypes.ENUM('male', 'female', 'other'),
    experience: DataTypes.INTEGER
  }, {
    timestamps: true
  }, {
    tableName: 'users', // 👈 обязательно!
  });
};

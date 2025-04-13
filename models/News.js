// models/News.js
export default (sequelize, DataTypes) => {
  return sequelize.define('News', {
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    date: DataTypes.DATEONLY
  });
};

module.exports = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "uralnickel",
  host: process.env.DB_HOST || "localhost",
  dialect: "mysql",
};

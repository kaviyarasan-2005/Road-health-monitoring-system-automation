const mysql = require("mysql2");
const env = require("./env");

const db = mysql.createConnection({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    console.error("Host:", env.DB_HOST);
    console.error("User:", env.DB_USER);
    console.error("Database:", env.DB_NAME);
    setTimeout(() => db.connect(), 5000);
  } else {
    console.log("✅ Database connected successfully");
  }
});

db.on('error', (err) => {
  console.error("Database error:", err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    db.connect();
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    db.connect();
  }
  if (err.code === 'ER_AUTHENTICATION_PLUGIN_ERROR') {
    db.connect();
  }
});

module.exports = db;
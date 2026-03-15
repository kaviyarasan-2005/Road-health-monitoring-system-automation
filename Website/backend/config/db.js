const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Kavi@2005",
  database: "road_monitor"
});

module.exports = db;
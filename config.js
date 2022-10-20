const mysql = require("mysql");
const config = {
  host: "localhost",
  user: "root",
  password: "1001",
  database: "sud_kurs",
  multipleStatements: true,
};
const code = "190631"

const pool = mysql.createPool(config);

module.exports = pool;

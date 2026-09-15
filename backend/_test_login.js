const sql = require('mssql');
require('dotenv').config();
const cfg = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  options: { encrypt: true, trustServerCertificate: true, connectTimeout: 8000 }
};
console.log('Attempting with PW=', JSON.stringify(process.env.DB_PASSWORD), 'len=', process.env.DB_PASSWORD.length);
sql.connect(cfg).then(pool => {
  return pool.request().query("SELECT name, create_date, modify_date, is_disabled FROM sys.sql_logins WHERE name = 'sa'");
}).then(r => { console.log('RESULT:', JSON.stringify(r.recordset, null, 2)); sql.close(); }).catch(e => { console.error('FAIL:', e.code, e.originalError ? e.originalError.message : e.message); });

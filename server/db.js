const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
// Load .env from the server directory explicitly
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Database Config Debug:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('Port:', process.env.DB_PORT);

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
        rejectUnauthorized: false
    }
};

const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the database.');
        connection.release();
    })
    .catch(error => {
        console.error('Database connection failed:', error);
    });

module.exports = pool;

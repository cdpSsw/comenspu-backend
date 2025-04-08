const mysql = require('mysql2/promise');
require('dotenv').config();

const initMYSQL = async () => {
    try{
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: process.env.DB_PORT,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            connectTimeout: 10000,  // เพิ่มเวลา timeout
            connectionLimit: 10,  // ปรับตามความเหมาะสม
            queueLimit: 0
        });
        console.log('Connected to MySQL successfully!');
        return conn;
    } catch (err) {
        console.error('Error connecting to MySQL: ', err);
        throw err;
    }
};

module.exports = initMYSQL; 
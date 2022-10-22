module.exports = function ({ host, port, password, user, database }) {
    const mysql = require('mysql2');

    const pool = mysql.createConnection({
        host,
        password,
        user,
        port,
        database
    });

    return pool;
} 
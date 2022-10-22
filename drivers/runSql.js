module.exports = function ({ user, password, port, host, database: databases, sql, message }) {

    return new Promise((resolve, reject) => {
        const mysql2Pool = require('./mysql2')({ user, password, port, host, database: databases })

        mysql2Pool.query(sql, function (err, rows, fields) {
            if (err) {
                console.log(message)
                reject(err);
            }

            mysql2Pool.end()

            console.log(message)
            resolve(message)
        })
    })

}
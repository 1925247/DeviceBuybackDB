const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('buyback.db', (err) => {
    if (err) {
        console.error('Error opening database ', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const initializeTable = () => {
    const sql = `CREATE TABLE IF NOT EXISTS devices (` +
        `id INTEGER PRIMARY KEY AUTOINCREMENT,` +
        `device_name TEXT NOT NULL,` +
        `buyback_price REAL NOT NULL,` +
        `condition TEXT NOT NULL` +
        `);`;

    db.run(sql, (err) => {
        if (err) {
            console.error('Error creating table: ', err.message);
        } else {
            console.log('Devices table initialized.');
        }
    });
};

initializeTable();

module.exports = db;

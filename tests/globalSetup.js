
const fs = require('fs');

const config = require(__dirname + `/../config-test`);
const mysql = require('mysql2/promise');

module.exports = async function() {
  console.log(`Connecting to database...`);
  const connection = await mysql.createConnection({
    multipleStatements: true,
    host     : config.db.host,
    port     : config.db.port,
    user     : config.db.username,
    password : config.db.password
  })

  console.log(`Initializing test database...`);

  await connection.query(`DROP DATABASE IF EXISTS \`${config.db.name}\``);

  let query;
  query = fs.readFileSync(__dirname + `/../docker/teachagogo-db-schema.sql`).toString();
  query = query.replace(/teachagogo_dev/gm, config.db.name);
  await connection.query(query)

  query = fs.readFileSync(__dirname + `/../docker/teachagogo-db-default-data.sql`).toString();
  query = query.replace(/teachagogo_dev/gm, config.db.name);
  query = query.replace(/DELIMITER ((\$\$)|(;))/gm, '');
  query = query.replace(/\$\$/gm, ';');
  await connection.query(query)

  console.log(`Test database initialized!`);
}


module.exports = (sequelize) => {
  const UserIp = require(__dirname + '/definitions/users_ips')(sequelize);

  return UserIp;
}


module.exports = (sequelize) => {
  const UserPermission = require(__dirname + '/definitions/users_permissions')(sequelize);

  return UserPermission;
}

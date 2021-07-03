
module.exports = (sequelize) => {
  const UserFavorite = require(__dirname + '/definitions/users_favorites')(sequelize);

  return UserFavorite;
}

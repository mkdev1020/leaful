
module.exports = (sequelize) => {
  const UserFollowing = require(__dirname + '/definitions/users_following')(sequelize);

  // const User = require(__dirname + '/user')(sequelize);

  // UserFollowing.hasOne(User, {
  //   foreignKey: 'users_id_following',
  // });

  // UserFollowing.findAllForUserId = async function(userId) {
  //   return await UserFollowing.findAll(
  //     {
  //       where: { users_id: userId },
  //       include: User,
  //     }
  //   );
  // };

  return UserFollowing;
}

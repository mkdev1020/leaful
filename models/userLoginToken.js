
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const UserLoginToken = require(__dirname + '/definitions/users_login_tokens')(sequelize);
  const config = require(__dirname + '/../config-for-env');

  UserLoginToken.procureTokenForUser = async function(user) {
    await UserLoginToken.destroy({
      where: {
        users_id: user.id,
      },
    });

    return await UserLoginToken.create({
      token: UserLoginToken.makeToken(),
      users_id: user.id,
    });
  };

  UserLoginToken.makeToken = function () {
    return uuidv4();
  };

  UserLoginToken.findByToken = async function (token) {
    return await UserLoginToken.findOne({
      where: {
        token,
      },
    });
  };

  UserLoginToken.destroyToken = async function (token) {
    await UserLoginToken.destroy({
      where: {
        token,
      },
    });
  };

  UserLoginToken.prototype.getUrl = function() {
    return `${config.host}/token-login/${this.token}`;
  };

  return UserLoginToken;
}

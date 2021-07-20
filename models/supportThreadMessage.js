
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const SupportThreadMessage = require(__dirname + '/definitions/support_thread_messages')(sequelize);

  const User = require(__dirname + '/user')(sequelize);

  SupportThreadMessage.createEmailProxyThreadForUser = async function(user) {
    const EmailProxyThread = require(__dirname + '/emailProxyThread')(sequelize);

    return await EmailProxyThread.createNew({
      is_support_thread: true,
      users_id_a: user.id,
      users_id_b: User.ADMIN_ACCOUNT_ID,
    });
  };

  return SupportThreadMessage;
}

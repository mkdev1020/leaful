
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const UserTransaction = require(__dirname + '/definitions/users_transactions')(sequelize);

  async function beforeCreate(transaction, options) {
    if (transaction.fingerprint === null) {
      transaction.fingerprint = UserTransaction.makeFingerprint();
    }
    return transaction;
  }

  UserTransaction.addHook('beforeCreate', beforeCreate);

  UserTransaction.addHook('beforeBulkCreate', (transactions, options) => {
    return Promise.all(
      transactions.map((transaction) => beforeCreate(transaction, options))
    );
  });

  UserTransaction.makeFingerprint = function () {
    return uuidv4();
  };

  return UserTransaction;
}


const { Op } = require("sequelize");
const { DateTime, Interval } = require('luxon');

module.exports = (sequelize) => {
  const PurgedAccount = require(__dirname + '/definitions/purged_accounts')(sequelize);

  PurgedAccount.destroyAllExpired = async function() {
    return await PurgedAccount.destroy({
      where: {
        purge_date : { [Op.lte]: DateTime.now().toUTC().minus({ months: 6 }).toISO() },
      },
    });
  };

  return PurgedAccount;
}

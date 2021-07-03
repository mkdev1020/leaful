
const { Op } = require("sequelize");
const { DateTime } = require('luxon');

module.exports = (sequelize) => {
  const Referral = require(__dirname + '/definitions/referrals')(sequelize);

  Referral.findByCode = async function(code) {
    return await Referral.findOne({ where: { code } });
  };

  Referral.destroyAllExpired = async function() {
    return await Referral.destroy({
      where: {
        expiration_date : { [Op.lte]: DateTime.now().toUTC().toISO() },
      },
    });
  };

  // TODO: use in API (and test)
  Referral.prototype.renew = async function() {
    return await Referral.update(
      { expiration_date: DateTime.now().toUTC().plus({ days: 60 }).toISO() },
      { where: { id: this.id } }
    );
  };

  return Referral;
}

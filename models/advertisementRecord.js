
module.exports = (sequelize) => {
  const AdvertisementRecord = require(__dirname + '/definitions/advertisements_records')(sequelize);

  return AdvertisementRecord;
}

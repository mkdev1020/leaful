
module.exports = (sequelize) => {
  const AdvertisementTargetGrade = require(__dirname + '/definitions/advertisements_target_grades')(sequelize);

  return AdvertisementTargetGrade;
}

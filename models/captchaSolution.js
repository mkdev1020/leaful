
module.exports = (sequelize) => {
  const CaptchaSolution = require(__dirname + '/definitions/captcha_solutions')(sequelize);

  CaptchaSolution.getRandom = async function() {
    return await CaptchaSolution.findOne({ order: sequelize.literal('rand()'), limit: 1 });
  };

  return CaptchaSolution;
}

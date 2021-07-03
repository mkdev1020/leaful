
module.exports = (sequelize) => {
  const SiteSetting = require(__dirname + '/definitions/site_settings')(sequelize);

  SiteSetting.getValueByName = async function(name, defaultValue=null) {
    const setting = await SiteSetting.findOne({ where: { name }});
    if (setting) {
      return setting.value;
    }
    return defaultValue;
  };

  SiteSetting.set = async function(name, value) {
    const existingSetting = await SiteSetting.findOne({ where: { name }});
    if (existingSetting) {
      return await SiteSetting.update({ name, value }, { where: { name }});
    }

    return await SiteSetting.create({
      title: name,
      name,
      value,
    });
  };

  return SiteSetting;
}

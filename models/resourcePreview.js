
module.exports = (sequelize) => {
  const ResourcePreview = require(__dirname + '/definitions/resources_previews')(sequelize);

  return ResourcePreview;
}

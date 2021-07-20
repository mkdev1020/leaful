
module.exports = (sequelize) => {
  const ResourceFile = require(__dirname + '/definitions/resources_files')(sequelize);

  return ResourceFile;
}

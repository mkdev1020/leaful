
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const EmailOptOutLink = require(__dirname + '/definitions/email_opt_out_links')(sequelize);

  EmailOptOutLink.procureForUser = async function(userId) {
    const existingLink = await EmailOptOutLink.findOne({ where: { users_id: userId } });
    if (existingLink) {
      return existingLink;
    }
    return await EmailOptOutLink.create({
      users_id: userId,
      code: uuidv4(),
    });
  };

  EmailOptOutLink.prototype.setOptInStatus = async function (enabled) {
    return await sequelize.query(
      `
      UPDATE \`users\` u
      SET u.marketing_email_enabled = :enabled
      WHERE u.id = :userId
      `,
      {
        replacements: {
          enabled,
          userId: this.users_id,
        },
      }
    );
  };

  return EmailOptOutLink;
}

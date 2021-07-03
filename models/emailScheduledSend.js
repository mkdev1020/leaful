
const { Op } = require('sequelize');
const { DateTime } = require('luxon');

module.exports = (sequelize) => {
  const EmailScheduledSend = require(__dirname + '/definitions/email_scheduled_sends')(sequelize);

  const EmailTemplate = require(__dirname + '/emailTemplate')(sequelize);

  EmailScheduledSend.sendAllReady = async function() {
    const scheduledSends = await EmailScheduledSend.findAll({ where: {
      send_at_date : { [Op.lte]: DateTime.now().toUTC().toISO() },
    } });
    return await Promise.all(scheduledSends.map(send => send.send()));
  };

  // intended for testing purposes
  EmailScheduledSend.sendAllImmediately = async function() {
    const scheduledSends = await EmailScheduledSend.findAll({ where: {} });
    return await Promise.all(scheduledSends.map(send => send.send()));
  };

  EmailScheduledSend.prototype.send = async function() {
    const result = sequelize.query(
      `SELECT u.email FROM \`users\` u WHERE u.id = :userId`,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { userId: this.users_id },
        plan: true,
      }
    );
    if (!result) {
      throw new Error(`User with id "${this.users_id}" does not exist!`);
    }

    const userEmail = result.email;

    const template = await EmailTemplate.findByPk(this.email_templates_id);

    const email = EmailTemplate.newEmail();
    email.setEmailAddress(userEmail);
    await email.setTemplate(template.slug);
    email.setValues(this.email_values);
    await email.send();

    await this.destroy();
  };

  return EmailScheduledSend;
}

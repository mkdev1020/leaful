
const mailer = require('../lib/mailer');

module.exports = (sequelize) => {
  const EmailTemplate = require(__dirname + '/definitions/email_templates')(sequelize);

  EmailTemplate.newEmail = function() {
    const email = new mailer.Email();
    email.setEmailTemplateModel(EmailTemplate);
    return email;
  };

  EmailTemplate.findBySlug = async function(slug) {
    return await EmailTemplate.findOne({ where: { slug } });
  };

  EmailTemplate.bulkSendToUsers = async function(options) {
    const email = EmailTemplate.newEmail();
    await email.setTemplate(options.template);
    for (const user of options.users) {
      email.setEmailAddress(user.email);
      email.setValues({
        name: user.first_name,
      });
      await email.send();
    }
  };

  return EmailTemplate;
}

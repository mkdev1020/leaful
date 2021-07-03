
const configFile = process.env.NODE_ENV === 'test' ? 'config-test' : 'config';
const config = require(__dirname + `/../${configFile}`);

const mustache = require('mustache');
const nodemailer = require('nodemailer');

let testInbox = [];

module.exports.loggingEnabled = false;

class SmtpConnection {

  constructor() {
    this.client = null;

    this.mockTransport = {
      async sendMail(mail) {
        if (module.exports.loggingEnabled) {
          console.log("SENT MAIL:", mail);
        }
        testInbox.push(mail);
      },
    };
  }

  createNewClient() {
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'dev') {
      return this.mockTransport;
    }

    const client = nodemailer.createTransport(config.nodemailer);

    return client;
  }

  async getInstance() {
    if (!this.client) {
      this.client = this.createNewClient();
      return this.client;
    }
    return this.client;
  }

}
module.exports.SmtpConnection = SmtpConnection;

class Email {

  constructor() {
    this.template = null;
    this.address = null;
    this.from    = config.email.defaultFromAddress;
    this.replyTo = config.email.defaultFromAddress;
    this.subject = null;
    this.values = {};

    this.templateHtml = ``;
    this.templateText = ``;

    this.smtp = new SmtpConnection();
    this.emailTemplateModel = null;
    this.emailTemplateInstance = null;
  }

  setEmailTemplateModel(model) {
    this.emailTemplateModel = model;
  }

  async setTemplate(name) {
    if (this.emailTemplateModel) {
      const templateInstance = await this.emailTemplateModel.findBySlug(name);
      this.emailTemplateInstance = templateInstance;
      if (templateInstance) {
        this.templateHtml = templateInstance.html_content;
        this.templateText = templateInstance.text_content;
        this.setSubject(templateInstance.subject);
      }
    }
    this.template = name;
  }

  setSubject(subject) {
    this.subject = subject;
  }

  setFromEmailAddress(address) {
    this.from = address;
    this.replyTo = address;
  }

  setEmailAddress(address) {
    this.address = address;
  }

  setValues(values) {
    this.values = values;
  }

  async send() {
    const mailer = await this.smtp.getInstance();

    let textTemplate = '';
    try { textTemplate = mustache.render(this.templateText, this.values); }
    catch (e) {}

    let htmlTemplate = '';
    try { htmlTemplate = mustache.render(this.templateHtml, this.values); }
    catch (e) {}

    const details = {
      from    : this.from,
      replyTo : this.from,
      to      : this.address,
      subject : this.subject,
      text: textTemplate,
      html: htmlTemplate,
      emailObject: this,
    };

    return await mailer.sendMail(details);
  }
}
module.exports.Email = Email;

function checkTestInbox () {
  return testInbox;
}
module.exports.checkTestInbox = checkTestInbox;

function clearTestInbox () {
  testInbox.splice(0, testInbox.length);
}
module.exports.clearTestInbox = clearTestInbox;


const configFile = process.env.NODE_ENV === 'test' ? 'config-test' : 'config';
const config = require(__dirname + `/../${configFile}`);

const { v4: uuidv4 } = require('uuid');
const { ImapFlow } = require('imapflow');
const { DateTime } = require('luxon');
const simpleParser = require('mailparser').simpleParser;

const EMAIL_USER = 'testing';
const EMAIL_DOMAIN = 'teachagogo.com';

class ImapConnection {

  constructor() {
    this.client = null;
  }

  createNewClient() {
    const client = new ImapFlow(config.imapFlow);

    const doNothing = () => {};

    client.log = {
      trace : doNothing,
      debug : doNothing,
      info  : doNothing,
      warn  : doNothing,
      error : doNothing,
      fatal : doNothing,
    };

    return client;
  }

  async getInstance() {
    if (!this.client) {
      this.client = this.createNewClient();
      return this.client;
    }
    if (!this.client.usable) {
      await this.client.connect();
      return this.client;
    }
    return this.client;
  }

}

module.exports = (sequelize) => {
  const EmailProxyThread = require(__dirname + '/definitions/email_proxy_threads')(sequelize);

  const User          = require(__dirname + '/user')(sequelize);
  const EmailTemplate = require(__dirname + '/emailTemplate')(sequelize);

  const imapConnection = new ImapConnection();

  EmailProxyThread.createNew = async function(thread) {
    const id = uuidv4().replace(/-/g, '').slice(0, 16);
    return await EmailProxyThread.create(Object.assign({}, { id }, thread));
  }

  EmailProxyThread.parseThreadIdFromProxyAddress = function (address) {
    const re = new RegExp(`${EMAIL_USER}\\+(\\w+)@${EMAIL_DOMAIN}`);
    const matches = re.exec(address);
    if (!matches || matches.length < 2) {
      return null;
    }
    return matches[1];
  }

  EmailProxyThread.parseEmailResponse = function (text) {
    const re = /([\S|\s]*)(On[\S|\s]+:)$/gm;
    const matches = re.exec(text);
    if (!matches || matches.length < 2) {
      return text;
    }
    return matches[1].trim();
  }

  EmailProxyThread.forwardMessage = async function (message) {
    const email = await simpleParser(message.source);
    const proxyEmailAddress = email.to.value[0].address;
    const fromEmailAddress = email.from.value[0].address;
    const threadId = EmailProxyThread.parseThreadIdFromProxyAddress(proxyEmailAddress);
    const thread = await EmailProxyThread.findByPk(threadId);

    if (!thread) {
      await EmailProxyThread.flagMessage(message);
      return;
    }

    const isValid = await thread.isEmailValidParticipant(fromEmailAddress);
    if (!isValid) {
      await EmailProxyThread.flagMessage(message);
      return;
    }

    const directTo = await thread.getEmailDirectDestination(fromEmailAddress);
    const responseText = EmailProxyThread.parseEmailResponse(email.text);
    const proxyAddress = thread.getProxyAddress();

    const responseEmail = EmailTemplate.newEmail();
    responseEmail.setFromEmailAddress(proxyAddress);
    responseEmail.setEmailAddress(directTo);
    await responseEmail.setTemplate('forwarded-message');

    const { recipientName, senderName } = await thread.getParticipantDisplayNames(fromEmailAddress);

    responseEmail.setValues({
      recipientName,
      senderName,
      response: responseText,
    });
    await responseEmail.send();

    await EmailProxyThread.flagMessage(message);

    await EmailProxyThread.update(
      { last_activity: DateTime.now().toUTC().toISO() },
      { where: { id: thread.id } },
    );
  }

  EmailProxyThread.flagMessage = async function (message) {
    await (await imapConnection.getInstance()).messageFlagsAdd(message.uid, ['\\Flagged'], { uid: true });
  }

  EmailProxyThread.getAllUnflaggedMessages = async function () {
    const messageGen = await (await imapConnection.getInstance()).fetch(
      { flagged: false },
      { source: true, uid: true, flags: true }
    );
    const messages = [];
    for await (const message of messageGen) {
      if (message) {
        messages.push(message);
      }
    }
    return messages;
  }

  EmailProxyThread.forwardMessages = async function (messages) {
    for (const message of messages) {
      await EmailProxyThread.forwardMessage(message);
    }
  }

  EmailProxyThread.deleteAllFlaggedMessages = async function () {
    await (await imapConnection.getInstance()).messageDelete({ flagged: true });
  }

  EmailProxyThread.forwardMailboxMessages = async function (mailboxPath) {
    const lock = await (await imapConnection.getInstance()).getMailboxLock(mailboxPath);

    try {
      const messages = await EmailProxyThread.getAllUnflaggedMessages();
      await EmailProxyThread.forwardMessages(messages);
      await EmailProxyThread.deleteAllFlaggedMessages();
    }
    finally {
      lock.release();
    }
  }

  EmailProxyThread.forwardInboxMail = async function () {
    const imapInstance = await imapConnection.getInstance();

    try {
      const mailboxPath = 'INBOX';
      await EmailProxyThread.forwardMailboxMessages(mailboxPath);
    }
    catch (e) {
      console.error(e);
    }
    finally {
      await imapInstance.logout();
    }
  };

  EmailProxyThread.prototype.getParticipantDisplayNames = async function(fromEmailAddress) {
    const [userADetails, userBDetails] = await Promise.all([
      User.findOne({
        where: { id: this.users_id_a },
        attributes: ['first_name', 'last_name', 'email'],
      }),
      User.findOne({
        where: { id: this.users_id_b },
        attributes: ['first_name', 'last_name', 'email'],
      }),
    ]);

    let recipientName, senderName;
    if (userADetails.email === fromEmailAddress) {
      senderName    = `${userADetails.first_name} ${userADetails.last_name}`;
      recipientName = `${userBDetails.first_name}`;
    } else {
      senderName    = `${userBDetails.first_name} ${userBDetails.last_name}`;
      recipientName = `${userADetails.first_name}`;
    }

    return {
      senderName,
      recipientName,
    };
  };

  EmailProxyThread.prototype.getProxyAddress = function () {
    return `${EMAIL_USER}+${this.id}@${EMAIL_DOMAIN}`;
  }

  EmailProxyThread.prototype.getParticipantEmails = async function() {
    const results = await sequelize.query(
      `
      SELECT ua.email AS \`users_email_a\`, ub.email AS \`users_email_b\`
      FROM \`email_proxy_threads\` t
        JOIN \`users\` ua ON ua.id = t.users_id_a
        JOIN \`users\` ub ON ub.id = t.users_id_b
      WHERE t.id = :id
      `,
      {
        replacements: { id: this.id },
        plain: true,
      }
    );
    if (!results) {
      return [];
    }
    return Object.values(results);
  }

  EmailProxyThread.prototype.isEmailValidParticipant = async function (email) {
    const validEmails = new Set(await this.getParticipantEmails());
    if (validEmails.has(email)) {
      return true;
    }
    return false;
  }

  EmailProxyThread.prototype.getEmailDirectDestination = async function (email) {
    const participantEmails = await this.getParticipantEmails();

    if (email === participantEmails[0]) {
      return participantEmails[1];
    }
    if (email === participantEmails[1]) {
      return participantEmails[0];
    }
    throw new Error(`The email "from" address does not match any valid addresses in the thread!`);
  }

  return EmailProxyThread;
}

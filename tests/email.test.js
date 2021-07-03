
const { DateTime } = require('luxon');

const utilities = require('./utilities');
const models = require('../models');

const mailer = require('../lib/mailer');

models.sequelize.options.logging = false;

beforeEach(async () => {
  await utilities.clearDatabase();
});

test(`forwarding system`, async () => {
  const userA = await utilities.createTestUser({ email: 'testA@example.com' });
  const userB = await utilities.createTestUser({ email: 'testB@example.com' });

  const thread = await models.EmailProxyThread.createNew({
    users_id_a: userA.id,
    users_id_b: userB.id,
  });

  let isValid;
  isValid = await thread.isEmailValidParticipant('testA@example.com');
  expect(isValid).toBe(true);
  isValid = await thread.isEmailValidParticipant('testB@example.com');
  expect(isValid).toBe(true);
  isValid = await thread.isEmailValidParticipant('testC@example.com');
  expect(isValid).toBe(false);
});

// test(`forwarding real emails`, async () => {
//   const userA = await utilities.createTestUser({
//     email: 'testing+a@teachagogo.com',
//     first_name: 'ay',
//     last_name: 'alast',
//   });
//   const userB = await utilities.createTestUser({
//     email: 'testing+b@teachagogo.com',
//     first_name: 'bee',
//     last_name: 'blast',
//   });
//   await models.EmailProxyThread.create({
//     id: 'asdf',
//     users_id_a: userA.id,
//     users_id_b: userB.id,
//     last_activity: DateTime.now().toUTC().minus({ days: 150 }).toISO(),
//   });
//   await models.EmailTemplate.create({
//     slug: 'forwarded-message',
//     subject: 'Yay! Forwarded Message!',
//     text_content: `Hello {{ recipientName }}! You received a response from {{ senderName }}:\n{{ response }}`,
//     html_content: `Hello {{ recipientName }}! You received a response from <b>{{ senderName }}</b>:
//       <br>
//       <i>{{ response }}</i>`,
//   });
//   await models.EmailProxyThread.forwardInboxMail();
//   console.log(mailer.checkTestInbox());
// });


const jwt = require('njwt');
const { DateTime } = require('luxon');

const utilities = require('./utilities');
const models = require('../models');
const mailer = require('../lib/mailer');

models.sequelize.options.logging = false;

beforeEach(async () => {
  await utilities.clearDatabase();
});

test(`test captcha system`, async () => {
  await models.CaptchaSolution.destroy({ where: {} });

  await models.CaptchaSolution.create({
    clue: `When you see smoke, there's...`,
    solution: 'fire',
  });

  //
  // verify failure works as expected
  //

  let challenge, codes, numChallenges;
  challenge = await models.CaptchaChallenge.generate();
  numChallenges = (await models.CaptchaChallenge.findAll({ where: {} })).length;
  expect(numChallenges).toEqual(1);
  codes = await challenge.getInputCodes();

  let valid;
  valid = await models.CaptchaChallenge.validateAndDestroy(challenge.id, codes.map(c => c.code));
  expect(valid).toEqual(false);
  // should have been deleted
  numChallenges = (await models.CaptchaChallenge.findAll({ where: {} })).length;
  expect(numChallenges).toEqual(0);

  //
  // get new challenge, solve it correctly
  //

  challenge = await models.CaptchaChallenge.generate();
  codes = await challenge.getInputCodes();

  const letterToCode = {};
  for (const code of codes) {
    const letter = code.image.trim();
    letterToCode[letter] = code.code;
  }

  valid = await models.CaptchaChallenge.validateAndDestroy(
    challenge.id,
    [ letterToCode['f'], letterToCode['i'], letterToCode['r'], letterToCode['e'] ]
  );
  expect(valid).toEqual(true);
  // should have been deleted
  numChallenges = (await models.CaptchaChallenge.findAll({ where: {} })).length;
  expect(numChallenges).toEqual(0);
});

test(`test token heartbeat system`, async () => {
  const user = await utilities.createTestUser();

  const token = jwt.create({ sub: user.id }, 'test-secret').compact();

  const heartbeat = await models.TokenHeartbeat.refresh(token);

  let isFresh = await models.TokenHeartbeat.isFresh(token);
  expect(isFresh).toBeTruthy();

  await models.TokenHeartbeat.update(
    { last_heartbeat: DateTime.now().toUTC().minus({ minutes: 11 }).toISO() },
    { where: { id: heartbeat.id } }
  );

  isFresh = await models.TokenHeartbeat.isFresh(token);
  expect(isFresh).toBeFalsy();

  //
  // refresh the heartbeat; should be valid again
  //

  await models.TokenHeartbeat.refresh(token);
  isFresh = await models.TokenHeartbeat.isFresh(token);
  expect(isFresh).toBeTruthy();
});

test(`test pattern lock system`, async () => {
  const user = await utilities.createTestUser();
  const passwordFull   = '01-02-03-04-05-10-15-20-25';
  const passwordUnlock = '01-02-03-04';

  const user2fa = await models.User2fa.create({
    users_id: user.id,
    email: 'test@example.com',
    email_mobile: 'test+mobile@example.com',
    password        : models.User2fa.hashPassword(passwordFull),
    password_unlock : models.User2fa.hashPassword(passwordUnlock),
  });

  // stale/uninitialized for session: require lock pattern
  let isFresh = user2fa.isFresh();
  expect(isFresh).toBeFalsy();

  let state = await user2fa.verify(passwordFull);
  expect(state).toEqual(models.User2fa.ACCESS_GRANTED);

  // fresh for session: require no lock pattern
  await user2fa.reload();
  isFresh = user2fa.isFresh();
  expect(isFresh).toBeTruthy();

  // the verification should become stale with the passage of time
  await models.User2fa.update(
    { last_verification: DateTime.now().toUTC().minus({ minutes: 11 }).toISO() },
    { where: { id: user2fa.id } }
  );

  await user2fa.reload();
  isFresh = user2fa.isFresh();
  expect(isFresh).toBeFalsy();

  // too many retries will lock the module
  for (let i = 0; i < 3; i++) {
    await user2fa.reload();
    state = await user2fa.verify('incorrect!!!!!!');
    expect(state).toEqual(models.User2fa.ACCESS_DENIED);
  }

  let emails;
  emails = mailer.checkTestInbox();
  expect(emails.length).toBe(0);

  // now it should be disabled. MUST use admin refresh
  await user2fa.reload();
  state = await user2fa.verify('incorrect!!!!!!');
  expect(state).toEqual(models.User2fa.ACCESS_LOCKED);

  emails = mailer.checkTestInbox();
  expect(emails.length).toBe(2);

  //
  // locked: must use first-4 to unlock
  //

  // make sure we can't just use the new password before unlocking
  const newPassword = emails[0].emailObject.values.password;
  const newPasswordUnlock = emails[0].emailObject.values.password.split('-').slice(0, 4).join('-');
  await user2fa.reload();
  state = await user2fa.verify(newPassword);
  expect(state).toEqual(models.User2fa.ACCESS_LOCKED);

  // now unlock the module
  const success = await user2fa.unlock(newPasswordUnlock);
  expect(success).toBeTruthy();

  // access should be granted!
  await user2fa.reload();
  state = await user2fa.verify(newPassword);
  expect(state).toEqual(models.User2fa.ACCESS_GRANTED);
});


const { DateTime } = require('luxon');

const utilities = require('./utilities');
const models = require('../models');
const mailer = require('../lib/mailer');

models.sequelize.options.logging = false;

beforeEach(async () => {
  await utilities.clearDatabase();
});

test(`base system`, async () => {
  let ready;
  ready = await models.ScheduledJob.findAllReady();
  expect(ready.length).toBe(0);

  let job = await models.ScheduledJob.create({
    name: 'test',
    minute       : '*',
    hour         : '*',
    day_of_month : '10',
    month        : '*',
    day_of_week  : '?',
    enabled: true,
  });

  // shouldn't fire on the 9th
  ready = await models.ScheduledJob.findAllReady(DateTime.fromISO('2021-04-09T00:00:00.000Z'));
  expect(ready.length).toBe(0);

  // should properly fire on the 10th
  ready = await models.ScheduledJob.findAllReady(DateTime.fromISO('2021-04-10T00:00:00.000Z'));
  expect(ready.length).toBe(1);

  // but... the job shouldn't be recognized yet since we didn't register it
  await ready[0].run();
  let logs;
  logs = await models.ScheduledJobLog.findAll({ where: {} });
  expect(logs.length).toBe(1);
  expect(logs[0].success).toBeFalsy();

  models.ScheduledJob.registerJobFunction('test', async () => {
    return 'testinfo!';
  });

  await ready[0].run();
  logs = await models.ScheduledJobLog.findAll({ where: {} });
  expect(logs.length).toBe(2);
  expect(logs[1].success).toBeTruthy();
  expect(logs[1].info).toBe('testinfo!');

  //
  // make sure errors are handled gracefully
  //
  models.ScheduledJob.registerJobFunction('test', async () => {
    throw new Error("GOTCHA!");
  });

  await ready[0].run();
  logs = await models.ScheduledJobLog.findAll({ where: {} });
  expect(logs.length).toBe(3);
  expect(logs[2].success).toBeFalsy();
});

async function setupScheduledJobs() {
  await models.ScheduledJob.create({ name: 'send non-creator purge warning emails', enabled: true });
  await models.ScheduledJob.create({ name: 'purge inactive non-creators', enabled: true });

  await models.ScheduledJob.create({ name: 'send creator dormancy warning emails', enabled: true });
  await models.ScheduledJob.create({ name: 'set dormant inactive creators', enabled: true });

  await models.ScheduledJob.create({ name: 'send creator purge warning emails', enabled: true });
  await models.ScheduledJob.create({ name: 'purge inactive creators', enabled: true });

  await models.ScheduledJob.create({ name: 'forfeit excess funds', enabled: true });

  await models.ScheduledJob.create({ name: 'send new resources email', enabled: true });

  await models.ScheduledJob.create({ name: 'destroy expired referrals', enabled: true });
  await models.ScheduledJob.create({ name: 'destroy old purged accounts', enabled: true });
  await models.ScheduledJob.create({ name: 'auto distribute revenue share', enabled: true });
}

test(`accounts without resources should be warned then purged`, async () => {
  /*
  user with no materials:
    6 months of no login:
      email the user 7 days beforehand, warning them that their account will be
      deleted

      if the user signs in, then reset the clock to 6 months

      if the user does NOT sign in, then:
        - send all balance to teachagogo
        - move email address to `purged_accounts` table
        - DELETE user account and data
  */

  await setupScheduledJobs();

  //
  // inactive + 173 days: non-creators should be warned of purge
  //

  const userWithoutResources = await utilities.createTestUser({
    // last_sign_in_date: DateTime.now().toUTC().toISO(),
    last_sign_in_date: DateTime.now().toUTC().minus({ days: 173 }).toISO(),
  });

  expect(mailer.checkTestInbox().length).toBe(0);

  await models.ScheduledJob.runAllReady();

  let mail;
  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(1);
  expect(mail[0].emailObject.template).toEqual('purge-warning-non-creator');

  let purgedAccounts;
  purgedAccounts = await models.PurgedAccount.findAll({ where: { } });
  expect(purgedAccounts.length).toBe(0);

  //
  // inactive + 180 days: account should be purged
  //

  await models.User.update(
    { last_sign_in_date: DateTime.now().toUTC().minus({ days: 180 }).toISO() },
    { where: { id: userWithoutResources.id } }
  );

  await models.ScheduledJob.runAllReady();
  purgedAccounts = await models.PurgedAccount.findAll({ where: { } });
  expect(purgedAccounts.length).toBe(1);
  expect(purgedAccounts[0].email).toBe(userWithoutResources.email);

});

test(`accounts WITH resources should be marked dormant then purged`, async () => {
  /*
  user with materials:
    6 months of no login:
      email the user 7 days beforehand, telling that the account will be marked
      as dormant and will no longer earn income

      if the user signs in, then reset the clock to 6 months

      if the user does NOT sign in, then:
        - mark the account as dormant
        - send all balance to teachagogo

        after 6 MORE months of inactivity:
          - move email address to `purged_accounts` table
          - all published resources should be re-assigned to the Teachagogo account
          - DELETE user account and data
  */

  await setupScheduledJobs();

  //
  // inactive + 173 days: creators should be warned of auto-dormancy
  //

  const userWithResources = await utilities.createTestUser({
    last_sign_in_date: DateTime.now().toUTC().minus({ days: 173 }).toISO(),
  });
  const resource = await models.Resource.create({ users_id: userWithResources.id, title: 'test', subtitle: 'test subtitle', grade: '5' });

  await userWithResources.transactBalanceAdjustment({ amount: 1000 });

  expect(mailer.checkTestInbox().length).toBe(0);

  await models.ScheduledJob.runAllReady();

  let mail;
  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(1);
  expect(mail[0].emailObject.template).toEqual('dormancy-warning-creator');
  mailer.clearTestInbox();

  await userWithResources.reload();
  expect(userWithResources.is_dormant).toBe(0);

  let balance;
  balance = await userWithResources.calculateBalance();
  expect(balance).toBe(1000);

  // user should still be receiving tips
  const tipperUser1 = await utilities.createTestUser();
  await tipperUser1.transactBalanceAdjustment({ amount: 10000 });
  await tipperUser1.tipUserWithId(userWithResources.id, 1000);
  balance = await userWithResources.calculateBalance();
  expect(balance).toBe(1750);

  //
  // inactive + 180 days: creator account should be marked dormant
  //

  await models.User.update(
    { last_sign_in_date: DateTime.now().toUTC().minus({ days: 180 }).toISO() },
    { where: { id: userWithResources.id } }
  );

  await models.ScheduledJob.runAllReady();

  // should NOT have been purged yet!
  purgedAccounts = await models.PurgedAccount.findAll({ where: { } });
  expect(purgedAccounts.length).toBe(0);

  // should now be dormant
  await userWithResources.reload();
  expect(userWithResources.is_dormant).toBe(1);

  // balance should have been cleared
  balance = await userWithResources.calculateBalance();
  expect(balance).toBe(0);

  // user should NO LONGER be receiving tips
  const tipperUser2 = await utilities.createTestUser();
  await tipperUser2.transactBalanceAdjustment({ amount: 10000 });
  await tipperUser2.tipUserWithId(userWithResources.id, 1000);
  balance = await userWithResources.calculateBalance();
  expect(balance).toBe(0);

  //
  // signing in should reset the clock (in this case, since we can't easily
  // simulate signing in, we just test the `clearDormancy` function directly)
  //

  await userWithResources.clearDormancy();

  // user should be receiving tips again!
  const tipperUser3 = await utilities.createTestUser();
  await tipperUser3.transactBalanceAdjustment({ amount: 10000 });
  await tipperUser3.tipUserWithId(userWithResources.id, 1000);
  balance = await userWithResources.calculateBalance();
  expect(balance).toBe(750);

  //
  // warn the user of account deletion after 1 year minus 7 days
  //

  await models.User.update(
    { last_sign_in_date: DateTime.now().toUTC().minus({ days: 365 - 7 }).toISO() },
    { where: { id: userWithResources.id } }
  );

  await models.ScheduledJob.runAllReady();

  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(1);
  expect(mail[0].emailObject.template).toEqual('purge-warning-creator');
  mailer.clearTestInbox();

  // should still own resource
  await resource.reload();
  expect(resource.users_id).toBe(userWithResources.id);

  //
  // dormancy at the 1-year mark should cause the user to be purged
  //

  await models.User.update(
    { last_sign_in_date: DateTime.now().toUTC().minus({ days: 365 }).toISO() },
    { where: { id: userWithResources.id } }
  );

  await models.ScheduledJob.runAllReady();

  purgedAccounts = await models.PurgedAccount.findAll({ where: { } });
  expect(purgedAccounts.length).toBe(1);
  expect(purgedAccounts[0].email).toBe(userWithResources.email);

  // all resources should be transfered to "Teachagogo" user account
  await resource.reload();
  expect(resource.users_id).not.toBe(userWithResources.id);

});

test(`dormancy due to too much funds`, async () => {
  /*
    accumulates >= $9,999 worth of funds:
      email them IMMEDIATELY, telling that the account was marked as dormant
      and will no longer earn income, and that they must sign in, AND request
      a payout in order to get back to normal

      if the user signs in AND requests a payout, then reset the regular
      clock to 6 months

      if the user does NOT request a payout, then, 7 days later:
        - send all balance to teachagogo

        after 6 months of inactivity:
          - move email address to `purged_accounts` table
          - all published resources should be re-assigned to the Teachagogo account
          - DELETE user account and data
  */
  await setupScheduledJobs();

  const creatorUser = await utilities.createTestUser();

  await creatorUser.sendRevenueShare(999000);
  await creatorUser.reload();
  expect(creatorUser.is_dormant).toBeFalsy();
  let balance = await creatorUser.calculateBalance();
  expect(balance).toEqual(999000);

  let mail;
  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(0);
  mailer.clearTestInbox();

  await creatorUser.sendRevenueShare(1500);
  await creatorUser.reload();
  expect(creatorUser.is_dormant).toBeTruthy();
  balance = await creatorUser.calculateBalance();
  expect(balance).toEqual(999900);

  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(1);
  expect(mail[0].emailObject.template).toEqual('warning-excess-funds');
  mailer.clearTestInbox();

  const adjustment = await models.UserTransaction.findOne({
    where: {
      users_id: creatorUser.id,
      amount: -600,
    },
  });

  expect(adjustment).toBeTruthy();

  const tipperUser1 = await utilities.createTestUser();
  await tipperUser1.transactBalanceAdjustment({ amount: 10000 });
  await tipperUser1.tipUserWithId(creatorUser.id, 1000);
  await creatorUser.reload();
  balance = await creatorUser.calculateBalance();
  // should still be the same amount!
  expect(balance).toEqual(999900);

  //
  // dormancy should be reset with payout
  //

  await creatorUser.requestPayout();
  await creatorUser.reload();
  expect(creatorUser.is_dormant).toBeFalsy();

  //
  // user funds should be forfeit after 7 days of being dormant
  //

  await creatorUser.sendRevenueShare(999910);
  await creatorUser.reload();
  expect(creatorUser.is_dormant).toBeTruthy();
  balance = await creatorUser.calculateBalance();
  expect(balance).toEqual(999900);

  await models.User.update(
    { dormancy_date: DateTime.now().toUTC().minus({ days: 7 }).toISO() },
    { where: { id: creatorUser.id } }
  );

  await models.ScheduledJob.runAllReady();

  await creatorUser.reload();
  balance = await creatorUser.calculateBalance();
  expect(balance).toEqual(0);

  //
  // user should be purged after 6 months
  //

  await models.User.update(
    { dormancy_date: DateTime.now().toUTC().minus({ days: 180 }).toISO() },
    { where: { id: creatorUser.id } }
  );

  await models.ScheduledJob.runAllReady();

  purgedAccounts = await models.PurgedAccount.findAll({ where: { } });
  expect(purgedAccounts.length).toBe(1);
  expect(purgedAccounts[0].email).toBe(creatorUser.email);
})

test(`purge referral links after 60 days of no use`, async() => {
  await setupScheduledJobs();

  const referrerUser = await utilities.createTestUser();

  // link should remain active indefinitely, if there is at least 1 visit in
  // the last 60 days (i.e. the doomsday clock should reset on every visit)
  const referral = await models.Referral.create({
    affiliate_id: referrerUser.id,
    code: 'asdf',
    landing_uri: 'asdf',
    expiration_date: DateTime.now().toUTC().plus({ days: 60 }).toISO(),
  });

  await models.ScheduledJob.runAllReady();

  let referrals;
  referrals = await models.Referral.findAll({ where: {} });
  expect(referrals.length).toBe(1);

  // if no visits in the last 60 days, delete it!
  await models.Referral.update(
    { expiration_date: DateTime.now().toUTC().minus({ days: 1 }).toISO() },
    { where: { id: referral.id } }
  );

  await models.ScheduledJob.runAllReady();
  referrals = await models.Referral.findAll({ where: {} });
  expect(referrals.length).toBe(0);
});

//
// emails
//

test(`email scheduler`, async () => {
  await models.EmailTemplate.create({
    slug: 'test',
    subject: 'test',
    html_content: `test {{ thing }}`,
  });

  let scheduledEmails;
  scheduledEmails = await models.EmailScheduledSend.findAll({ where: {} });
  expect(scheduledEmails.length).toBe(0);

  const user = await utilities.createTestUser();
  await user.scheduleSendEmail('test', {
    value: 'something!',
  });

  scheduledEmails = await models.EmailScheduledSend.findAll({ where: {} });
  expect(scheduledEmails.length).toBe(1);

  let mail;
  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(0);
  mailer.clearTestInbox();

  await scheduledEmails[0].send();

  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(1);
  expect(mail[0].emailObject.template).toEqual('test');
  mailer.clearTestInbox();
});

test(`new resources from following`, async () => {
  const testUser1 = await utilities.createTestUser();
  const testUser2 = await utilities.createTestUser();
  const testUser3 = await utilities.createTestUser();

  await testUser1.followUser(testUser2.id);
  await testUser1.followUser(testUser3.id);

  const following = await testUser1.getUsersFollowing();
  expect(following[0].id).toBe(testUser2.id);
  expect(following[1].id).toBe(testUser3.id);

  let numNewFollowing;
  numNewFollowing = await testUser1.countNewResourcesFromFollowing(1);
  expect(numNewFollowing).toBe(0);

  const resource1 = await models.Resource.create({ users_id: testUser2.id, title: 'test!', subtitle: 'test subtitle', grade: '5' });
  const resource2 = await models.Resource.create({ users_id: testUser3.id, title: 'test!', subtitle: 'test subtitle', grade: '5' });

  numNewFollowing = await testUser1.countNewResourcesFromFollowing(1);
  expect(numNewFollowing).toBe(2);

  //
  // verify that resources are chosen based on their correct age
  //

  await models.Resource.update(
    { created_at: DateTime.now().toUTC().minus({ days: 8 }).toISO() },
    { where: { id: resource1.id } }
  );

  // resource 1 shouldn't count here, since it isn't within the first week
  numNewFollowing = await testUser1.countNewResourcesFromFollowing(1);
  expect(numNewFollowing).toBe(1);

  // resource 1 SHOULD count here, since we're now looking back up to 2 weeks
  numNewFollowing = await testUser1.countNewResourcesFromFollowing(2);
  expect(numNewFollowing).toBe(2);
});

test(`new resources interests`, async () => {
  await setupScheduledJobs();

  const downloaderUser = await utilities.createTestUser();
  const creatorUser    = await utilities.createTestUser();

  function buildResource(properties) {
    return Object.assign({}, {
      users_id: creatorUser.id,
      grade: '5',
      subject_area: 'math',
      title: 'test!',
      subtitle: 'test subtitle',
    }, properties);
  }

  const resourceSkeletons = [];
  for (let i = 0; i < 20; i++) {
    resourceSkeletons.push(buildResource({ grade: '5', subject_area: 'math' }));
    resourceSkeletons.push(buildResource({ grade: '5', subject_area: 'science' }));
    resourceSkeletons.push(buildResource({ grade: '5', subject_area: 'science' }));
    resourceSkeletons.push(buildResource({ grade: '5', subject_area: 'reading' }));
    resourceSkeletons.push(buildResource({ grade: '5', subject_area: 'reading' }));
    resourceSkeletons.push(buildResource({ grade: '5', subject_area: 'reading' }));
    resourceSkeletons.push(buildResource({ grade: '4', subject_area: 'math' }));
    resourceSkeletons.push(buildResource({ grade: '4', subject_area: 'reading' }));
    resourceSkeletons.push(buildResource({ grade: '3', subject_area: 'math' }));
    resourceSkeletons.push(buildResource({ grade: '3', subject_area: 'math' }));
    resourceSkeletons.push(buildResource({ grade: '3', subject_area: 'science' }));
  }

  await models.Resource.bulkCreate(resourceSkeletons);
  const resources = await models.Resource.findAll({ where: {} });

  const downloadSkeletons = [];
  for (const resource of resources) {
    downloadSkeletons.push({
      users_id: downloaderUser.id,
      resources_id: resource.id,
    });
  }

  await models.ResourceDownload.bulkCreate(downloadSkeletons);

  const downloadsDetails = await downloaderUser.getRecentDownloadsDetails();
  expect(JSON.stringify(downloadsDetails))
    .toBe(JSON.stringify([
        [ { grade: '5', subject_area: 'reading' }, 27 ],
        [ { grade: '3', subject_area: 'math'    }, 18 ],
        [ { grade: '5', subject_area: 'science' }, 18 ],
    ]));

  //
  // make sure email gets sent
  //

  await models.EmailTemplate.create({
    slug: 'new-resources-interests',
    subject: 'test',
    html_content: `
    Hi {{ name }}, you have {{ newResourceCount }} new resource(s)!
    {{#newResourceDetails}}
      <div>{{ gradeDisplay }} {{subjectDisplay}} ( <b>{{count}}</b> )</div>
    {{/newResourceDetails}}
    `,
  });
  await models.EmailTemplate.create({
    slug: 'new-resources-following',
    subject: 'test',
    html_content: ``,
  });

  await models.User.update(
    { last_sign_in_date: DateTime.now().toUTC().minus({ days: 7 }).toISO() },
    { where: { id: downloaderUser.id } }
  );

  let mail;
  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(0);

  await models.ScheduledJob.runAllReady();
  await models.EmailScheduledSend.sendAllImmediately();

  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(1);
  expect(mail[0].emailObject.template).toEqual('new-resources-interests');
  expect(mail[0].emailObject.values.newResourceCount).toEqual(63);
  mailer.clearTestInbox();

  //
  // make sure the mailer runs on the 2nd week +
  //

  // create another relevant resource (and have the downloader user download it)
  const newResource = await models.Resource.create(buildResource({ grade: '5', subject_area: 'reading' }));
  await models.ResourceDownload.create({
    users_id: downloaderUser.id,
    resources_id: newResource.id,
  });

  await models.User.update(
    { last_sign_in_date: DateTime.now().toUTC().minus({ days: 14 }).toISO() },
    { where: { id: downloaderUser.id } }
  );

  await models.ScheduledJob.runAllReady();
  await models.EmailScheduledSend.sendAllImmediately();

  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(1);
  expect(mail[0].emailObject.template).toEqual('new-resources-interests');
  // should now be 64!
  expect(mail[0].emailObject.values.newResourceCount).toEqual(64);
  mailer.clearTestInbox();

  //
  // make sure the email will STOP going out on week 5+
  //

  await models.User.update(
    { last_sign_in_date: DateTime.now().toUTC().minus({ days: 35 }).toISO() },
    { where: { id: downloaderUser.id } }
  );
  await models.ScheduledJob.runAllReady();
  await models.EmailScheduledSend.sendAllImmediately();
  mail = mailer.checkTestInbox();
  expect(mail.length).toBe(0);
  mailer.clearTestInbox();

  //
  // downloader user should get the FOLLOWING email once they start following
  // a creator who has new materials
  //

  await downloaderUser.followUser(creatorUser.id);

  await models.User.update(
    { last_sign_in_date: DateTime.now().toUTC().minus({ days: 7 }).toISO() },
    { where: { id: downloaderUser.id } }
  );
  await models.ScheduledJob.runAllReady();
  await models.EmailScheduledSend.sendAllImmediately();
  mail = mailer.checkTestInbox();
  // should be the other email!
  expect(mail[0].emailObject.template).toEqual('new-resources-following');
  mailer.clearTestInbox();
});

// https://www.teachagogo.com/specs/admin_controls_accounting.htm
test(`revenue and distribution should work fine when manual balance tracking is turned off`, async() => {
  await setupScheduledJobs();

  const creatorUser1 = await utilities.createTestUser();
  const creatorUser2 = await utilities.createTestUser();
  const advertiser = await utilities.createTestUser();

  const resource1 = await models.Resource.create({ users_id: creatorUser1.id, title: 'test', subtitle: 'test subtitle', grade: '5' });
  const resource2a = await models.Resource.create({ users_id: creatorUser2.id, title: 'test', subtitle: 'test subtitle', grade: '5' });
  const resource2b = await models.Resource.create({ users_id: creatorUser2.id, title: 'test', subtitle: 'test subtitle', grade: '5' });

  await models.ResourceDownload.bulkCreate([
    { users_id: creatorUser1.id, resources_id: resource2a.id },
    { users_id: creatorUser1.id, resources_id: resource2b.id },
    { users_id: creatorUser2.id, resources_id: resource1.id },
  ]);

  await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: advertiser.id,
    spend_per_day: 100,
    running_status: 'running',

    start_date: DateTime.now().toUTC().toISO(),
    end_date  : DateTime.now().toUTC().plus({ days: 10 }).toISO(),
  });

  // let thing = await models.SiteBalance.calculateRevenueShare(DateTime.now().toUTC().toISO());
  // thing = await models.SiteBalance.getRevenueSharesForCreators(thing, DateTime.now().toUTC().toISO());
  // console.log(thing);

  let balance1, balance2;;
  balance1 = await creatorUser1.calculateBalance();
  balance2 = await creatorUser2.calculateBalance();
  expect(balance1).toBe(0);
  expect(balance2).toBe(0);

  await models.ScheduledJob.runAllReady();

  // shouldn't have been applied yet-- the admin setting is OFF by default
  balance1 = await creatorUser1.calculateBalance();
  balance2 = await creatorUser2.calculateBalance();
  expect(balance1).toBe(0);
  expect(balance2).toBe(0);

  //
  // should work when the appropriate admin setting is turned ON
  //

  await models.SiteSetting.set('skip_manual_balances', true);

  await models.ScheduledJob.runAllReady();

  balance1 = await creatorUser1.calculateBalance();
  balance2 = await creatorUser2.calculateBalance();
  expect(balance1).toBe(17);
  expect(balance2).toBe(33);
});

test(`email opt-out system`, async () => {
  const user = await utilities.createTestUser();
  await user.reload();
  expect(user.marketing_email_enabled).toBe(1);

  const optOutLink = await models.EmailOptOutLink.procureForUser(user.id);
  await optOutLink.setOptInStatus(0);

  await user.reload();
  expect(user.marketing_email_enabled).toBe(0);
});

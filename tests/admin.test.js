
const { DateTime } = require('luxon');
const { v4: uuidv4 } = require('uuid');

const utilities = require('./utilities');
const models = require('../models');

models.sequelize.options.logging = false;

beforeEach(async () => {
  await utilities.clearDatabase();
});

// https://www.teachagogo.com/specs/misc_considerations.htm
test(`test admin earnings`, async () => {
  // should always be auto-approved for the admin, and then not actually be
  // submitted as a payout to PayPal
  const admin = await utilities.createTestUser({ role: 'admin' });

  await models.UserTransaction.create({
    users_id: admin.id,
    amount: 1000,
    status: 'completed',
    type: 'revenue_share',
    created_at: DateTime.now().toUTC().minus({ days: 31 }).toISO(),
  });

  let eligiblePayout = await admin.calculateEligiblePayout();
  expect(eligiblePayout).toBe(1000);

  await admin.requestPayout();
  // should be marked "completed" immediately
  let pendingPayout = await admin.getPendingPayout();
  expect(pendingPayout).toBe(null);

  eligiblePayout = await admin.calculateEligiblePayout();
  // should be 0 already
  expect(eligiblePayout).toBe(0);

  //
  // regular user should not have these privileges
  //

  const user = await utilities.createTestUser();
  await models.UserTransaction.create({
    users_id: user.id,
    amount: 1000,
    status: 'completed',
    type: 'revenue_share',
    created_at: DateTime.now().toUTC().minus({ days: 31 }).toISO(),
  });

  eligiblePayout = await user.calculateEligiblePayout();
  expect(eligiblePayout).toBe(1000);

  await user.requestPayout();
  pendingPayout = await user.getPendingPayout();
  expect(pendingPayout).not.toBe(null);

  eligiblePayout = await user.calculateEligiblePayout();
  // should still be 1000!
  expect(eligiblePayout).toBe(1000);
});

// https://www.teachagogo.com/specs/misc_considerations.htm
test(`admin downloads should not be logged in the database`, async () => {
  const creator = await utilities.createTestUser();
  const resources = await Promise.all([
    createTestResource({ users_id: creator.id }),
    createTestResource({ users_id: creator.id }),
  ]);

  const admin = await utilities.createTestUser({ role: 'admin' });
  await admin.markDownload(resources[0]);
  await admin.markDownload(resources[1]);

  let downloads = await models.ResourceDownload.findAll({ where: {} });
  expect(downloads.length).toBe(0);

  const user = await utilities.createTestUser();
  await user.markDownload(resources[0]);
  await user.markDownload(resources[1]);
  downloads = await models.ResourceDownload.findAll({ where: {} });
  expect(downloads.length).toBe(2);
});

// TODO: redundant
async function createTestResource(overrides = {}) {
  const defaults = {
    title: uuidv4(),
    subtitle: 'test subtitle',
    grade: '5'
  };

  const resourceProperties = Object.assign({}, defaults, overrides);

  return await models.Resource.create(resourceProperties);
}

async function simulateDownload(user) {
  const creatorUser = await utilities.createTestUser();
  const resource = await createTestResource({ users_id: creatorUser.id });

  await user.markDownload(resource);
}

// https://www.teachagogo.com/specs/admin_controls_pricing.htm
test(`pricing split testing`, async () => {
  const downloaderUser1 = await utilities.createTestUser();
  // expect(downloaderUser1.donations_options_id).toBe(null);
  let donationStats = await models.UserDonationOption.findForUser(downloaderUser1, 'prompt');
  expect(donationStats).toBe(null);

  await simulateDownload(downloaderUser1);

  let prompt = await downloaderUser1.getApplicableDonationPrompt('prompt');
  expect(prompt).toBe(null);

  await simulateDownload(downloaderUser1);
  await simulateDownload(downloaderUser1);
  await simulateDownload(downloaderUser1);
  await simulateDownload(downloaderUser1);

  prompt = await downloaderUser1.getApplicableDonationPrompt('prompt');
  expect(prompt).not.toBe(null);
  expect(prompt[0]).toEqual(24);

  await downloaderUser1.reload();
  // should no longer be undefined
  // expect(downloaderUser1.donations_options_id).not.toBe(null);
  // expect(downloaderUser1.num_donation_option_prompts).toBe(1);

  donationStats = await models.UserDonationOption.findForUser(downloaderUser1, 'prompt');
  expect(donationStats).not.toBe(null);
  expect(donationStats.num_donation_option_prompts).toBe(1);

  //
  // make sure that the same prompt isn't counted more than once in a 24 hour
  // period
  //
  prompt = await downloaderUser1.getApplicableDonationPrompt('prompt');
  await downloaderUser1.reload();

  // should still be 1
  donationStats = await models.UserDonationOption.findForUser(downloaderUser1, 'prompt');
  expect(donationStats.num_donation_option_prompts).toBe(1);

  // await models.User.update(
  //   { last_donation_prompt: DateTime.now().toUTC().minus({ hours: 25 }).toISO() },
  //   { where: { id: downloaderUser1.id } }
  // );

  await models.UserDonationOption.update(
    { last_donation_prompt: DateTime.now().toUTC().minus({ hours: 25 }).toISO() },
    { where: { id: donationStats.id } }
  );

  await downloaderUser1.reload();
  prompt = await downloaderUser1.getApplicableDonationPrompt('prompt');
  await downloaderUser1.reload();

  // now should have been incremented
  donationStats = await models.UserDonationOption.findForUser(downloaderUser1, 'prompt');
  expect(donationStats.num_donation_option_prompts).toBe(2);

  // //
  // // user should receive new option after the correct amount of downloads
  // //
  // await models.User.update({ num_donation_option_prompts: 3 }, { where: { id: downloaderUser1.id } });
  // await downloaderUser1.reload();
  // prompt = await downloaderUser1.getApplicableDonationPrompt('prompt');
  // // should be the next tier down
  // expect(prompt[0]).toEqual(12);
  // await models.User.update({ num_donation_option_prompts: 5 }, { where: { id: downloaderUser1.id } });
  // await downloaderUser1.reload();
  // prompt = await downloaderUser1.getApplicableDonationPrompt('prompt');
  // // should be the next tier down
  // expect(prompt[0]).toEqual(6);
});

test(`pricing split testing stats`, async () => {
  const downloaderUsers = await Promise.all([
    utilities.createTestUser(),
    utilities.createTestUser(),
    utilities.createTestUser(),
    utilities.createTestUser(),
    utilities.createTestUser(),
    utilities.createTestUser(),
  ]);

  await models.DonationOption.create({ placement: 'prompt', tier_1: [33, 66, 99] });
  await models.DonationOption.create({ placement: 'prompt', tier_1: [99, 999, 9999] });
  await models.DonationOption.create({ placement: 'prompt', tier_1: [1, 2, 3] });

  const sidebarOption = await models.DonationOption.create({ placement: 'sidebar', tier_1: [10, 20, 30] });

  const options = await models.DonationOption.findAll({ where: { placement: 'prompt' } });

  // await models.User.update( { donations_options_id: options[0].id }, { where: { id: downloaderUsers[0].id } });
  // await models.User.update( { donations_options_id: options[1].id }, { where: { id: downloaderUsers[1].id } });
  // await models.User.update( { donations_options_id: options[1].id }, { where: { id: downloaderUsers[2].id } });
  // await models.User.update( { donations_options_id: options[1].id }, { where: { id: downloaderUsers[3].id } });
  // await models.User.update( { donations_options_id: options[2].id }, { where: { id: downloaderUsers[4].id } });
  // await models.User.update( { donations_options_id: options[2].id }, { where: { id: downloaderUsers[5].id } });

  await models.UserDonationOption.create( { donations_options_id: options[0].id, users_id: downloaderUsers[0].id });
  await models.UserDonationOption.create( { donations_options_id: options[1].id, users_id: downloaderUsers[1].id });
  await models.UserDonationOption.create( { donations_options_id: options[1].id, users_id: downloaderUsers[2].id });
  await models.UserDonationOption.create( { donations_options_id: options[1].id, users_id: downloaderUsers[3].id });
  await models.UserDonationOption.create( { donations_options_id: options[2].id, users_id: downloaderUsers[4].id });
  await models.UserDonationOption.create( { donations_options_id: options[2].id, users_id: downloaderUsers[5].id });

  await Promise.all(downloaderUsers.map(user => user.reload()));

  // option 1
  await downloaderUsers[0].donate(33, 'prompt');

  // option 2
  await downloaderUsers[1].donate(99, 'prompt');
  await downloaderUsers[2].donate(999, 'prompt');

  // option 3: has users, but no conversions

  // option 4: no users assigned

  // verify that users opted in is correct
  let stats = await models.DonationOption.getStatsByVariation('prompt');
  expect(stats.length).toBe(4);

  expect(stats[0].stats.usersOptedIn).toBe(1);
  expect(stats[0].stats.totalDonationAmount).toBe(33);

  expect(stats[1].stats.usersOptedIn).toBe(3);
  expect(stats[1].stats.usersConverted).toBe(2);
  expect(Math.floor(stats[1].stats.conversionRate * 100) / 100).toBe(0.66);
  expect(stats[1].stats.totalDonationAmount).toBe(1098);
  expect(stats[1].stats.averageDonationAmount).toBe(549);
  expect(stats[1].stats.amountPerUser).toBe(366);

  expect(stats[2].stats.totalDonationAmount).toBe(0);
  expect(stats[3].stats.totalDonationAmount).toBe(0);

  // wait for a second, so when the default donation `started_at` value is
  // set, there is a noticeable difference (since the millisecondes aren't
  // stored)
  await new Promise((resolve) => {
    setTimeout(resolve, 1500);
  });

  //
  // make sure stats for other placements are different
  //
  stats = await models.DonationOption.getStatsByVariation('sidebar');
  expect(stats[0].stats.usersOptedIn).toBe(0);
  const newUser = await utilities.createTestUser();
  await models.UserDonationOption.create( { donations_options_id: sidebarOption.id, users_id: newUser.id });

  stats = await models.DonationOption.getStatsByVariation('sidebar');
  expect(stats[0].stats.usersOptedIn).toBe(1);

  //
  // test deletion
  //

  let allUsersDonationOptions = await models.UserDonationOption.findAll();
  expect(allUsersDonationOptions.length).toBe(7);

  await options[1].destroy();
  await options[2].destroy();
  await options[3].destroy();
  await sidebarOption.destroy();
  stats = await models.DonationOption.getStatsByVariation('prompt');
  expect(stats.length).toBe(1);
  allUsersDonationOptions = await models.UserDonationOption.findAll();
  expect(allUsersDonationOptions.length).toBe(1);

  /*
  // stopping a split test should clear all data, and return users to the
  // default option
  await models.DonationOption.clearAll();
  stats = await models.DonationOption.getStatsByVariation('prompt');
  expect(stats[0].stats.usersOptedIn).toBe(6);
  // donations made to a deleted campaign is no longer counted (even if they
  // donated to the default option which technically still exists)
  expect(stats[0].stats.usersConverted).toBe(0);
  expect(stats[0].stats.totalDonationAmount).toBe(0);

  // verify that user can't tip outside their currently assigned "bracket"
  await downloaderUsers[0].reload();
  let tier = await models.DonationOption.procureTierForUser(downloaderUsers[0], 'prompt');
  // this is the lowest amount the user can pay at this time
  expect(tier[0]).toBe(24);

  // should throw error
  try {
    await downloaderUsers[0].donate(6, 'prompt');
    fail(`Users shouldn't be able to donate less than their bracket allows.`);
  } catch (e) {
    expect(e).toBeTruthy();
  }

  // should succeed
  await downloaderUsers[0].donate(24, 'prompt');
  */

});

// https://www.teachagogo.com/specs/zombie_maker.htm
test(`test zombie system`, async () => {
  // when deleting account, change all published materials under that zombie
  // to a default user account (not necessarily the admin account)
  const zombie = await utilities.createTestUser({ is_zombie: true });
  const nonZombie = await utilities.createTestUser();

  let resources = await Promise.all([
    createTestResource({ users_id: zombie.id }),
    createTestResource({ users_id: zombie.id }),
    createTestResource({ users_id: zombie.id }),
  ]);

  for (const resource of resources) {
    expect(resource.users_id).toBe(zombie.id);
  }

  await zombie.deleteZombie();

  resources = await Promise.all(resources.map(res => res.reload()));

  for (const resource of resources) {
    expect(resource.users_id).not.toBe(zombie.id);
    expect(resource.users_id).toBe(1);
  }

  try {
    await nonZombie.deleteZombie();
    fail(`Shouldn't be able to call 'deleteZombie' on regular account!`);
  } catch (e) {
    expect(e).toBeTruthy();
  }

  // TODO: (???) return funds to default account too
});

// https://www.teachagogo.com/specs/user_data.htm
test.todo(`test user permissions`/*, async () => {
  // TODO: better to do this when the API is being developed
}*/);

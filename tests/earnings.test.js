
const { DateTime } = require('luxon');

const utilities = require('./utilities');
const models = require('../models');
const UserTransaction = models.UserTransaction;

models.sequelize.options.logging = false;

beforeEach(async () => {
  await utilities.clearDatabase();
});

async function createTransaction(users, type, amount, overrides = {}) {
  return await UserTransaction.create(
    Object.assign(
      {
        users_id: users[0].id,
        users_id_related: users[1].id,
        type,
        amount,
        status: 'completed',
      },
      overrides
    )
  );
}

test(`earnings calculations should accept a custom date`, async () => {
  const usersObjects = {
    teachagogoUser: await utilities.createTestUser(),
    creatorUser: await utilities.createTestUser(),
  };
  const users = [usersObjects.creatorUser, usersObjects.teachagogoUser];

  await createTransaction(users, 'revenue_share', 12300, { created_at: DateTime.now().toUTC().minus({ days: 5 }).toISO() });
  await createTransaction(users, 'tip_received',    500, { created_at: DateTime.now().toUTC().minus({ days: 4 }).toISO() });
  await createTransaction(users, 'top_up',          400, { created_at: DateTime.now().toUTC().minus({ days: 3 }).toISO() });
  await createTransaction(users, 'adjustment',     -300, { created_at: DateTime.now().toUTC().minus({ days: 2 }).toISO() });
  await createTransaction(users, 'adjustment',      100, { created_at: DateTime.now().toUTC().minus({ days: 1 }).toISO() });
  //                                            = 13000
  let balance = await usersObjects.creatorUser.calculateBalance();
  expect(balance).toEqual(13000);

  // - 100
  balance = await usersObjects.creatorUser.calculateBalance(DateTime.now().toUTC().minus({ days: 2 }));
  expect(balance).toEqual(12900);

  // + 300
  balance = await usersObjects.creatorUser.calculateBalance(DateTime.now().toUTC().minus({ days: 3 }));
  expect(balance).toEqual(13200);

  // - 400
  balance = await usersObjects.creatorUser.calculateBalance(DateTime.now().toUTC().minus({ days: 4 }));
  expect(balance).toEqual(12800);

  // - 500
  balance = await usersObjects.creatorUser.calculateBalance(DateTime.now().toUTC().minus({ days: 5 }));
  expect(balance).toEqual(12300);

  // - 12300
  balance = await usersObjects.creatorUser.calculateBalance(DateTime.now().toUTC().minus({ days: 6 }));
  expect(balance).toEqual(0);

  //
  // eligible payout
  //

  let payout = await usersObjects.creatorUser.calculateEligiblePayout(DateTime.now().toUTC().plus({ days: 30 }));
  // the full 1300, minus the 400 topup
  expect(payout).toEqual(12600);

  payout = await usersObjects.creatorUser.calculateEligiblePayout(DateTime.now().toUTC().plus({ days: 25 }));
  // the 500 tip_received transaction should no longer count at this point
  expect(payout).toEqual(12100);

  payout = await usersObjects.creatorUser.calculateEligiblePayout(DateTime.now().toUTC().plus({ days: 24 }));
  // the 12300 revenue_share transaction should no longer count at this point
  expect(payout).toEqual(-200);
});

test(`site stats should be correct`, async () => {
  let data;
  data = await models.SiteStat.aggregateDataForToday();
  data.record_date = null;
  expect(data).toEqual({
    record_date: null,
    new_users             : 1,
    total_users           : 1,
    unique_logins         : 0,
    active_resources      : 0,
    new_resources         : 0,
    total_resources       : 0,
    resource_downloads    : 0,
    income_per_download   : 0,
    ad_impressions        : 0,
    ad_spend              : 0,
    total_donations       : 0,
    total_income          : 0,
    misc_income           : 0,
    dormancy_income       : 0,
    total_tips            : 0,
    total_revenue         : 0,
    total_unpaid_earnings : 0
  });

  await models.SiteBalance.destroy({ where: {} });
  await models.SiteBalance.create({
    affiliate_revenue: 2727,
    is_finalized: true,
  });

  const downloaderUser = await utilities.createTestUser();
  // initialize ad revenue for today
  const ad = await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: downloaderUser.id,
    running_status: 'running',
    spend_per_day: 1000,

    start_date: DateTime.now().toUTC().toISO(),
    end_date  : DateTime.now().toUTC().toISO(),
  });

  await Promise.all([
    models.AdvertisementRecord.create({ record_type: 'impression', advertisements_id: ad.id }),
    models.AdvertisementRecord.create({ record_type: 'impression', advertisements_id: ad.id }),
    models.AdvertisementRecord.create({ record_type: 'impression', advertisements_id: ad.id }),
    models.AdvertisementRecord.create({ record_type: 'impression', advertisements_id: ad.id }),
  ]);

  const teacherA = await utilities.createTestUser();
  const teacherAResource1 = await models.Resource.create({
    users_id: teacherA.id, title: 'title', subtitle: 'test subtitle', approval_status: 'approved' });

  const teacherB = await utilities.createTestUser();
  const teacherBResource1 = await models.Resource.create({
    users_id: teacherB.id, title: 'title', subtitle: 'test subtitle', approval_status: 'approved' });

  const teacherC = await utilities.createTestUser();
  const teacherCResource1 = await models.Resource.create({
    users_id: teacherC.id, title: 'title', subtitle: 'test subtitle', approval_status: 'awaiting_approval' });

  // simulate downloads for those users
  await Promise.all([
    downloaderUser.markDownload(teacherAResource1),
    downloaderUser.markDownload(teacherAResource1),
  ]);

  await downloaderUser.update({
    last_sign_in_date: new Date(),
  });

  await downloaderUser.donate(321);

  const usersObjects = {
    teachagogoUser: await utilities.createTestUser(),
    creatorUser: await utilities.createTestUser(),
  };
  const users = [usersObjects.creatorUser, usersObjects.teachagogoUser];

  const revShareTransaction = await createTransaction(users, 'revenue_share', 100);
  await createTransaction(users, 'tip_given',    500);

  const dormantUser = await utilities.createTestUser();
  await dormantUser.setDormant('no_sign_in');
  await dormantUser.reload();
  await dormantUser.sendRevenueShare(101);

  data = await models.SiteStat.aggregateDataForToday();
  data.record_date = null;
  expect(data).toEqual({
    record_date           : null,
    new_users             : 8,
    total_users           : 8,
    unique_logins         : 1,
    active_resources      : 2,
    new_resources         : 3,
    total_resources       : 3,
    resource_downloads    : 2,
    income_per_download   : 931.75,
    ad_impressions        : 4,
    ad_spend              : 1000,
    total_donations       : 321,
    total_income          : 1321,
    misc_income           : 2727,
    dormancy_income       : 101,
    total_tips            : 500,
    total_revenue         : 4048,
    total_unpaid_earnings : 0,
  });

  await models.UserTransaction.update(
    { created_at: DateTime.now().toUTC().minus({ days: 31 }).toISO() },
    { where: { id: revShareTransaction.id } }
  );

  data = await models.SiteStat.aggregateDataForToday();
  // that 100 tip given should no longer be immature
  expect(data.total_unpaid_earnings).toEqual(100);
});

test(`earnings calculations should be correct!`, async () => {
  const usersObjects = {
    teachagogoUser: await utilities.createTestUser(),
    creatorUser: await utilities.createTestUser(),
  };
  const users = [usersObjects.creatorUser, usersObjects.teachagogoUser];

  const revShareTransaction = await createTransaction(users, 'revenue_share', 12300);
  await createTransaction(users, 'tip_received',    500);
  await createTransaction(users, 'top_up',          400);
  await createTransaction(users, 'adjustment',     -300);
  await createTransaction(users, 'adjustment',      100);
  //                                            = 13000
  let balance = await usersObjects.creatorUser.calculateBalance();
  expect(balance).toEqual(13000);

  // these two should not be included in the calculation, since they aren't
  // marked as `completed`
  await createTransaction(users, 'tip_received',   1234, { status: 'awaiting_approval' });
  await createTransaction(users, 'tip_received',   4321, { status: 'rejected' });

  // users.reverse();
  await createTransaction(users, 'donation',      -5555);
  // users.reverse();
  //                                13000 - 5555 = 7445

  balance = await usersObjects.creatorUser.calculateBalance();
  expect(balance).toEqual(7445);

  // includes everything except top-ups. considers all revenue at least 30
  // days old.
  let payout = await usersObjects.creatorUser.calculateEligiblePayout();
  // Payable revenue (revenue_share + tips) is not usable until it's 30+ days
  // old. Since expenses are factored in immediately, there may temporarily
  // be a negative payout balance, which will even out when the payable
  // revenue matures.
  expect(payout).toEqual(-5755);

  // XXX for some reason, revShareTransaction.update isn't working, so I have
  // to call the whole model
  await models.UserTransaction.update(
    { created_at: DateTime.now().toUTC().minus({ days: 31 }).toISO() },
    { where: { id: revShareTransaction.id } }
  );

  // payout should now include the revenue share of 12300
  payout = await usersObjects.creatorUser.calculateEligiblePayout();
  // -5755 + 12300 = 6545
  expect(payout).toEqual(6545);

  // make sure payouts subtract from the balance
  await createTransaction([usersObjects.creatorUser, usersObjects.creatorUser], 'payout', -7445);

  balance = await usersObjects.creatorUser.calculateBalance();
  expect(balance).toEqual(0);

  await createTransaction(users, 'tip_received', 100);
  await createTransaction(users, 'top_up',       200);

  balance = await usersObjects.creatorUser.calculateBalance();
  expect(balance).toEqual(300);
})

test(`payouts should only be processed upon approval`, async () => {
  const creator = await utilities.createTestUser();

  await models.UserTransaction.create({
    users_id: creator.id,
    amount: 1000,
    status: 'completed',
    type: 'revenue_share',
    created_at: DateTime.now().toUTC().minus({ days: 31 }).toISO(),
  });

  let payoutBalance;
  payoutBalance = await creator.calculateEligiblePayout();
  expect(payoutBalance).toEqual(1000);

  await creator.requestPayout();

  try {
    await creator.requestPayout();
    fail(`Creators shouldn't be able to request more than one payout at a time`);
  } catch (e) {
    expect(e).toBeTruthy();
  }

  payoutBalance = await creator.calculateEligiblePayout();
  expect(payoutBalance).toEqual(1000);

  await creator.approvePayout();

  payoutBalance = await creator.calculateEligiblePayout();
  expect(payoutBalance).toEqual(0);
});

// tipping system
// https://www.teachagogo.com/specs/tipping.htm
//
test(`verify tipping system is working properly`, async () => {
  const tipper = await utilities.createTestUser();
  const tippee = await utilities.createTestUser();
  await tipper.applyTopup(1000);

  let balance = await tippee.calculateBalance();
  expect(balance).toEqual(0);

  // tip should be deducted from tippers account
  const firstTipTransactions = await tipper.tipUserWithId(tippee.id, 100);

  // 75% of it added to the (recipient's) account balance, 25% to Teachagogo
  balance = await tippee.calculateBalance();
  expect(balance).toEqual(75);

  // same user should not be able to tip the same creator more than ONCE in a
  // 30-day period
  try {
    await tipper.tipUserWithId(tippee.id, 100);
    fail(`Should throw an error when tipper tries to tip the same user twice within 30 days`);
  } catch (e) {
    expect(e).toBeTruthy();
  }

  // any user should not be able to tip more than 5 times in a single day
  for (let tipsAttempted = 1; tipsAttempted < 5; tipsAttempted++) {
    const newUser = await utilities.createTestUser();
    await tipper.tipUserWithId(newUser.id, 100);
  }

  const tipsGivenToday = await tipper.numTipsGivenToday();
  expect(tipsGivenToday).toEqual(5);

  try {
    const newUser = await utilities.createTestUser();
    await tipper.tipUserWithId(newUser.id, 100);
    fail(`User should not be able to tip more than 5 times in a single day`);
  } catch (e) {
    expect(e).toBeTruthy();
  }

  // move one tip into yesterday, and it should no longer fail
  await UserTransaction.update(
    { created_at: DateTime.now().toUTC().minus({ days: 1.1 }).toISO() },
    { where: { id: firstTipTransactions[0].id } }
  );
  const newUser = await utilities.createTestUser();
  // no errors this time!
  await tipper.tipUserWithId(newUser.id, 100);
});

test(`any user should not be able to tip more than $50 TOTAL in a given day`, async () => {
  const tipper = await utilities.createTestUser();
  await tipper.applyTopup(10000);

  for (let i = 0; i < 5; i++) {
    const newUser = await utilities.createTestUser();
    await tipper.tipUserWithId(newUser.id, 1000);
  }

  let totalTipped = await tipper.totalAmountTippedToday();
  expect(totalTipped).toEqual(5000);

  const newUser = await utilities.createTestUser();
  try {
    await tipper.tipUserWithId(newUser.id, 100);
    fail(`Shouldn't be able to tip more than $50 in a given day!`);
  } catch (e) {
    expect(e).toBeTruthy();
  }
});

test(`top-ups should be restricted to 2 per day`, async () => {
  const tipper = await utilities.createTestUser();
  let balance = await tipper.calculateBalance();
  expect(balance).toEqual(0);

  await tipper.applyTopup(123);
  balance = await tipper.calculateBalance();
  expect(balance).toEqual(123);

  await tipper.applyTopup(100);
  balance = await tipper.calculateBalance();
  expect(balance).toEqual(223);

  try {
    await tipper.applyTopup(100);
    fail(`Shouldn't be able to tip more than twice in a given day!`);
  } catch (e) {
    expect(e).toBeTruthy();
  }
});

test(`if tip balance doesn't cover tip, take the remainder from earnings`, async () => {
  const mainUser = await utilities.createTestUser();
  const otherUserA = await utilities.createTestUser();
  const otherUserB = await utilities.createTestUser();

  await createTransaction([ mainUser, otherUserA ], 'tip_received', 400, {
    created_at: DateTime.now().toUTC().minus({ days: 31 }).toISO(),
  });

  let balance, earnings;
  balance = await mainUser.calculateBalance();
  expect(balance).toEqual(400);

  earnings = await mainUser.calculateEligiblePayout();
  expect(earnings).toEqual(400);

  //
  // sanity check: topups shouldn't apply to the earnings
  //
  await mainUser.applyTopup(100);

  balance = await mainUser.calculateBalance();
  expect(balance).toEqual(500);

  earnings = await mainUser.calculateEligiblePayout();
  expect(earnings).toEqual(400);

  // so now, we have balance: 500, eligible payout: 400

  //
  // tip 50-- all 50 should be from the "topup balance", with the payout
  // balance remaining untouched
  //
  await mainUser.tipUserWithId(otherUserA.id, 50);

  balance = await mainUser.calculateBalance();
  expect(balance).toEqual(450);

  earnings = await mainUser.calculateEligiblePayout();
  expect(earnings).toEqual(400);

  // now, we have balance: 450, eligible payout: 400

  //
  // tip 100-- 50 should be from the "topup balance" (bringing it to 0), and the
  // other 50 from the payout balance
  //
  await mainUser.tipUserWithId(otherUserB.id, 100);

  balance = await mainUser.calculateBalance();
  expect(balance).toEqual(350);

  earnings = await mainUser.calculateEligiblePayout();
  expect(earnings).toEqual(350);
});

test(`tip recipient's balance should be limited to 9999`, async () => {
  const tipperA = await utilities.createTestUser();
  const tipperB = await utilities.createTestUser();
  const tippee = await utilities.createTestUser();

  await tipperA.applyTopup(700000);
  await tipperB.applyTopup(700000);

  await tipperA.tipUserWithId(tippee.id, 700000);

  let tippeeBalance;
  tippeeBalance = await tippee.calculateBalance();
  // will only be 75%
  expect(tippeeBalance).toEqual(525000);

  await tippee.reload();
  expect(tippee.is_dormant).toBeFalsy();

  let adminTransactions;
  adminTransactions = await models.UserTransaction.findAll({ where: { users_id: 1 }});
  expect(adminTransactions.length).toEqual(0);

  await tipperB.tipUserWithId(tippee.id, 700000);
  tippeeBalance = await tippee.calculateBalance();
  // the tippee should still only have $9,999
  // but 5,250 + 5,250 = 10,500-- so an overflow of $501 was "sent" to the
  // admin account
  expect(tippeeBalance).toEqual(999900);

  adminTransactions = await models.UserTransaction.findAll({ where: { users_id: 1 }});
  expect(adminTransactions.length).toEqual(1);
  // expect that $501 overflow
  expect(adminTransactions[0].amount).toEqual(50100);
});

test.todo(`laundering safeguard`
  // TODO: see https://developer.paypal.com/docs/api/orders/v2/#orders_get
  // purchase_units.payee.email_address

  // the PayPal email address used for one user's tip top-ups should be
  // disallowed from topping up another Teachagogo account
  // (will require a PayPal mock response, and another DB table to track the
  // email used for topups for each user)
);

//
// revenue distribution
// https://www.teachagogo.com/specs/admin_controls_accounting.htm
//
test(`download and revenue distribution is calculated properly`, async () => {
  const downloaderUser = await utilities.createTestUser();
  // initialize ad revenue for today
  await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: downloaderUser.id,
    running_status: 'running',
    spend_per_day: 1000,

    start_date: DateTime.now().toUTC().toISO(),
    end_date  : DateTime.now().toUTC().toISO(),
  });

  const teacherA = await utilities.createTestUser();
  const teacherAResource1 = await models.Resource.create({ users_id: teacherA.id, title: 'title', subtitle: 'test subtitle' });

  const teacherB = await utilities.createTestUser();
  const teacherBResource1 = await models.Resource.create({ users_id: teacherB.id, title: 'title', subtitle: 'test subtitle' });

  const teacherC = await utilities.createTestUser();
  const teacherCResource1 = await models.Resource.create({ users_id: teacherC.id, title: 'title', subtitle: 'test subtitle' });

  // simulate downloads for those users
  await Promise.all([
    downloaderUser.markDownload(teacherAResource1),
    downloaderUser.markDownload(teacherAResource1),
    downloaderUser.markDownload(teacherAResource1),

    downloaderUser.markDownload(teacherBResource1),
    downloaderUser.markDownload(teacherBResource1),

    downloaderUser.markDownload(teacherCResource1),
  ]);

  await models.SiteSetting.set('global_revenue_share', 1);

  const downloadsByUser = await models.ResourceDownload.getTotalDownloadsByUser(DateTime.now().toUTC().toISO());
  expect(Math.round(downloadsByUser[teacherA.id].percentage * 100)).toEqual(50);
  expect(Math.round(downloadsByUser[teacherB.id].percentage * 100)).toEqual(33);
  expect(Math.round(downloadsByUser[teacherC.id].percentage * 100)).toEqual(17);

  // run the distribution function - downloads
  await models.SiteBalance.distributeRevenueShares(DateTime.now().toUTC().toISO());

  // 3/6 = 50% * 1000 * 1 = 500
  const teacherABalance = await teacherA.calculateBalance();
  expect(teacherABalance).toEqual(500);

  // 2/6 = ~33.3% * 1000 * 1 = 333
  const teacherBBalance = await teacherB.calculateBalance();
  expect(teacherBBalance).toEqual(333);

  // 1/6 = ~16.7% * 1000 * 1 = 167
  const teacherCBalance = await teacherC.calculateBalance();
  expect(teacherCBalance).toEqual(167);
});

test(`ad revenue should be split across the number of days for which it's purchased`, async () => {
  // simulate a purchase of an ad
  const user = await utilities.createTestUser();

  const anchorDate = DateTime.now().toUTC();

  const ad1 = await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: user.id,
    spend_per_day: 1,
    running_status: 'running',

    start_date: anchorDate.toISO(),
    end_date  : anchorDate.plus({ days: 10 }).toISO(),
  });

  const ad2 = await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: user.id,
    spend_per_day: 2,
    running_status: 'running',

    start_date: anchorDate.toISO(),
    end_date  : anchorDate.plus({ days: 20 }).toISO(),
  });

  const ad3 = await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: user.id,
    spend_per_day: 3,
    // stopped ads should STILL be included in the revenue calculation, since
    // they have already been paid for
    running_status: 'stopped',

    start_date: anchorDate.toISO(),
    end_date  : anchorDate.plus({ days: 30 }).toISO(),
  });

  let adRevenue;
  adRevenue = await models.Advertisement.calculateTotalSpendForDate(anchorDate.toISO());
  expect(adRevenue).toEqual(6);

  adRevenue = await models.Advertisement.calculateTotalSpendForDate(anchorDate.plus({ days: 11 }).toISO());
  expect(adRevenue).toEqual(5);

  adRevenue = await models.Advertisement.calculateTotalSpendForDate(anchorDate.plus({ days: 21 }).toISO());
  expect(adRevenue).toEqual(3);
});

test(`net revenue should be calculated properly`, async() => {
  const today = DateTime.now().toUTC().toISO();

  const adOwner = await utilities.createTestUser();
  await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: adOwner.id,
    running_status: 'running',
    spend_per_day: 2000,

    start_date: today,
    end_date  : today,
  });

  await models.Donation.create({
    users_id: adOwner.id,
    donations_options_id: 1,
    donation_options_tier: 1,
    donation_amount: 300,
  });

  let netRevenue;
  netRevenue = await models.SiteBalance.calculateNetRevenue(today);
  // 2000 + 300
  expect(netRevenue).toEqual(2300);

  const siteBalance = await models.SiteBalance.procureForDate(today);
  await models.SiteBalance.update(
    {
      affiliate_revenue: 89,
      expenses: 200,
    },
    { where: { id: siteBalance.id } }
  );

  netRevenue = await models.SiteBalance.calculateNetRevenue(today);
  // 2000 + 300 + 89 - 200 = 2189
  expect(netRevenue).toEqual(2189);
});

//
// referrals
// https://www.teachagogo.com/specs/share_it.htm
//
test(`a "referral download" shouldn't be counted more than ONCE in a 30-day period`, async () => {
  const downloaderUser1 = await utilities.createTestUser();
  const downloaderUser2 = await utilities.createTestUser();

  const teacherA = await utilities.createTestUser();
  const teacherAResource = await models.Resource.create({ users_id: teacherA.id, title: 'title', subtitle: 'test subtitle' });

  const teacherB = await utilities.createTestUser();
  const teacherBResource = await models.Resource.create({ users_id: teacherB.id, title: 'title', subtitle: 'test subtitle' });

  const teacherAReferralCode = '1234';
  const teacherAReferralLink = await models.Referral.create({
    affiliate_id: teacherA.id,
    code: teacherAReferralCode,
    landing_uri: 'asdf',
    expiration_date: DateTime.now().toUTC().plus({ days: 10 }).toISO(),
  });

  let downloads;

  const firstDownload = await downloaderUser1.markDownload(teacherAResource);
  downloads = await models.ResourceDownload.findAll();
  expect(downloads.length).toEqual(1);

  // second download shouldn't count-- number of downloads should still be 1
  await downloaderUser1.markDownload(teacherAResource);
  downloads = await models.ResourceDownload.findAll();
  expect(downloads.length).toEqual(1);

  //
  // but SHOULD be counted if the last download of the same resource was > 30
  // days ago
  //
  await models.ResourceDownload.update(
    { created_at: DateTime.now().toUTC().minus({ days: 31 }).toISO() },
    { where: { id: firstDownload.id } }
  );

  // should be counted now
  await downloaderUser1.markDownload(teacherAResource);
  downloads = await models.ResourceDownload.findAll();
  expect(downloads.length).toEqual(2);

  // and again, another download shouldn't be recognized...
  await downloaderUser1.markDownload(teacherAResource);
  downloads = await models.ResourceDownload.findAll();
  expect(downloads.length).toEqual(2);

  // but if a different user downloads the same resource, it WILL be recognized
  await downloaderUser2.markDownload(teacherAResource);
  downloads = await models.ResourceDownload.findAll();
  expect(downloads.length).toEqual(3);

  // and if the same user downloads a DIFFERENT resource, it will be recognized
  await downloaderUser2.markDownload(teacherBResource);
  downloads = await models.ResourceDownload.findAll();
  expect(downloads.length).toEqual(4);
});

test(`users should not get credit for using their own referral code`, async () => {
  const teacherA = await utilities.createTestUser();
  const teacherAResource = await models.Resource.create({ users_id: teacherA.id, title: 'title', subtitle: 'test subtitle' });

  const teacherB = await utilities.createTestUser();
  const teacherBResource = await models.Resource.create({ users_id: teacherB.id, title: 'title', subtitle: 'test subtitle' });

  const teacherAReferralCode = '1234';
  const teacherAReferralLink = await models.Referral.create({
    affiliate_id: teacherA.id,
    code: teacherAReferralCode,
    landing_uri: 'asdf',
    expiration_date: DateTime.now().toUTC().plus({ days: 10 }).toISO(),
  });

  let downloads;

  // shouldn't be counted if it's a resource the teacher owns...
  await teacherA.markDownload(teacherAResource);
  downloads = await models.ResourceDownload.findAll();
  expect(downloads.length).toEqual(0);

  // and shouldn't be counted if they're using their own referral code, EVEN
  // IF they're downloading materials that aren't theirs
  await teacherA.markDownload(teacherBResource, teacherAReferralCode);
  downloads = await models.ResourceDownload.findAll();
  expect(downloads.length).toEqual(0);
});

test(`download "credits" should be calculated properly`, async () => {
  const downloaderUser1 = await utilities.createTestUser();
  const downloaderUser2 = await utilities.createTestUser();

  const teacherA = await utilities.createTestUser();
  const teacherAResource1 = await models.Resource.create({ users_id: teacherA.id, title: 'title', subtitle: 'test subtitle' });

  const teacherB = await utilities.createTestUser();
  const teacherBResource1 = await models.Resource.create({ users_id: teacherB.id, title: 'title', subtitle: 'test subtitle' });

  const teacherC = await utilities.createTestUser();
  const teacherCResource1 = await models.Resource.create({ users_id: teacherC.id, title: 'title', subtitle: 'test subtitle' });

  const teacherAReferralCode = '1234';
  const teacherAReferralLink = await models.Referral.create({
    affiliate_id: teacherA.id,
    code: teacherAReferralCode,
    landing_uri: 'asdf',
    expiration_date: DateTime.now().toUTC().plus({ days: 10 }).toISO(),
  });

  const teacherBReferralCode = '5678';
  const teacherBReferralLink = await models.Referral.create({
    affiliate_id: teacherB.id,
    code: teacherBReferralCode,
    landing_uri: 'asdf2',
    expiration_date: DateTime.now().toUTC().plus({ days: 10 }).toISO(),
  });

  const teacherCReferralCode = '9012';
  const teacherCReferralLink = await models.Referral.create({
    affiliate_id: teacherC.id,
    code: teacherCReferralCode,
    landing_uri: 'asdf3',
    expiration_date: DateTime.now().toUTC().plus({ days: 10 }).toISO(),
  });

  // full credit for teacher B
  await downloaderUser1.markDownload(teacherBResource1);
  // 0.75 credit for teacher B, and 0.25 for teacher A
  await downloaderUser2.markDownload(teacherBResource1, teacherAReferralCode);
  // 0.75 credit for teacher C, and 0.25 for teacher A
  await downloaderUser1.markDownload(teacherCResource1, teacherAReferralCode);

  const downloadsByUser = await models.ResourceDownload.getTotalDownloadsByUser(DateTime.now().toUTC().toISO());
  expect(downloadsByUser[teacherA.id].downloads).toEqual(0.50);
  expect(downloadsByUser[teacherB.id].downloads).toEqual(1.75);
  expect(downloadsByUser[teacherC.id].downloads).toEqual(0.75);
});

test.todo(`both tip flows should work`
  // TODO: not sure how to test this yet
  // flow 1: users can stock up on tip "credits" ("top-ups")
  // flow 2: users will be redirected to PayPal for every tip
);

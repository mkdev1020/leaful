
const { DateTime } = require('luxon');

const Router = require('@koa/router');
const router = new Router();

const models = require('../models');
// models.sequelize.options.logging = true;

const { guardAccessToken, guardAdmin } = require('../middleware/guards');

router
.get(
  '/',

  guardAccessToken,

  guardAdmin,

  async (ctx) => {
    let startDate = DateTime.fromISO(ctx.request.query.start).toUTC();
    let endDate   = DateTime.fromISO(ctx.request.query.end).toUTC();

    let balances = await models.SiteBalance.procureAllForDateRange(
      startDate.toISO(),
      endDate.toISO()
    );

    const contributorUsersIds = new Set();

    balances = await Promise.all(
      balances.map((balance) => {
        return (async () => {
          const date = DateTime.fromJSDate(balance.record_date).toUTC().toISO();
          const downloadsByUser = await models.ResourceDownload.getTotalDownloadsByUser(date);

          for (const userId of Object.keys(downloadsByUser)) {
            contributorUsersIds.add(userId);
          }

          const globalRevenueShare = await models.SiteSetting.getValueByName('global_revenue_share');
          const revenueShare = await models.SiteBalance.calculateRevenueShare(date);

          const adRevenue = await models.Advertisement.calculateTotalSpendForDate(date);
          const donations = await models.Donation.calculateTotalDonationsForDate(date);

          return Object.assign({}, balance.toJSON(), {
            adRevenue,
            donations,
            revenueShare,
            globalRevenueShare,
            downloadsByUser,
          });
        })();
      })
    );

    const contributorUsers = {};
    await Promise.all(Array.from(contributorUsersIds).map(async (userId) => {
      return contributorUsers[userId] = await models.User.findByPk(userId);
    }));

    ctx.body = {
      balances,
      contributorUsers,
    };
  },
);

router
.patch(
  '/:date',

  guardAccessToken,

  guardAdmin,

  async (ctx) => {
    const date = ctx.request.params.date;
    let balance = await models.SiteBalance.procureForDate(date);
    balance = await balance.update(ctx.request.body);
    ctx.body = {
      balance,
    };
  }
);

module.exports = router;

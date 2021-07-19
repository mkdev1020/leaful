
const { DateTime } = require('luxon');

const Router = require('@koa/router');
const router = new Router();

const models = require('../models');
// models.sequelize.options.logging = true;

const { guardAccessToken, guardAdmin } = require('../middleware/guards');

router
.get(
  '/pending',

  guardAccessToken,

  guardAdmin,

  async (ctx) => {
    const payouts = await models.UserTransaction.findAll({
      where: {
        type: 'payout',
        status: 'awaiting_approval',
      },
      order: [['created_at', 'ASC']],
    });

    const totalEligiblePayouts = await models.User.calculateTotalEligiblePayouts();

    const userIds = new Set();
    for (const payout of payouts) {
      userIds.add(payout.users_id);
    }
    const users = await models.User.findAllByIds(userIds);

    ctx.body = {
      users,
      payouts,
      totalEligiblePayouts,
    };
  },
);

router
.post(
  '/',

  guardAccessToken,

  async (ctx) => {
    await ctx.user.requestPayout();
    ctx.status = 200;
  },

);

router
.post(
  '/approval',

  guardAccessToken,

  guardAdmin,

  async (ctx) => {
    const userIds = ctx.request.body.userIds;

    const userIdsApproved = await Promise.all(userIds.map(userId => {
      return (async () => {
        const user = await models.User.findByPk(userId);
        await user.approvePayout();
        return user.id;
      })();
    }));

    ctx.status = 200;
    ctx.body = {
      userIdsApproved,
    };
  },
);

router
.post(
  '/rejection',

  guardAccessToken,

  guardAdmin,

  async (ctx) => {
    const userIds = ctx.request.body.userIds;

    const userIdsRejected = await Promise.all(userIds.map(userId => {
      return (async () => {
        const user = await models.User.findByPk(userId);
        await user.rejectPayout();
        return user.id;
      })();
    }));

    ctx.status = 200;
    ctx.body = {
      userIdsRejected,
    };
  },
);

module.exports = router;

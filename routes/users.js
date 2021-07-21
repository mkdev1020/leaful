
const { DateTime } = require('luxon');

const Router = require('@koa/router');
const router = new Router();

const models = require('../models');
const { guardAccessToken, guardAdmin } = require('../middleware/guards');
// models.sequelize.options.logging = true;

router
.get(
  '/:id',

  guardAccessToken,

  async (ctx) => {
    let userId = ctx.request.params.id;
    if (userId === 'self') {
      userId = ctx.accessTokenDecoded.sub;
    }

    // TODO TODO TODO guard admin if not 'self'

    const user = await models.User.findByPk(userId);

    ctx.body = {
      user,
    };
  },
);

router
.patch(
  '/:id',

  guardAccessToken,

  async (ctx) => {
    let userId = ctx.request.params.id;
    if (userId === 'self') {
      userId = ctx.accessTokenDecoded.sub;
    }

    // TODO TODO TODO guard admin if not 'self'

    // TODO TODO TODO also: only allow non-admins to edit certain fields

    let user = await models.User.findByPk(userId);

    user = await user.update(ctx.request.body);

    ctx.body = {
      user,
    };
  },
);

router
.get(
  '/',

  guardAccessToken,

  guardAdmin,

  async (ctx) => {

    const users = await models.User.findAll();

    const usersDetailed = await Promise.all(users.map(async (user) => {
      return Object.assign({}, user.toJSON(), {
        balance: await user.calculateBalance(),
        downloads: await user.getNumDownloads(),
        is_recent_donator: await user.isRecentDonator(),
      });
    }));

    ctx.body = {
      users: usersDetailed,
    };
  },
);

router
.get(
  '/:id/permissions',

  guardAccessToken,

  async (ctx) => {
    let userId = ctx.request.params.id;
    if (userId === 'self') {
      userId = ctx.accessTokenDecoded.sub;
    }

    // TODO TODO TODO guard admin if not 'self'

    let user = await models.User.findByPk(userId);
    const permissions = await user.procurePermissions();

    ctx.body = {
      permissions,
    };
  },
);

router
.patch(
  '/:id/permissions',

  guardAccessToken,

  guardAdmin,

  async (ctx) => {
    const userId = ctx.request.params.id;

    const user = await models.User.findByPk(userId);
    const permissions = await user.procurePermissions();
    await permissions.update(ctx.request.body);
    await permissions.reload();

    ctx.body = {
      permissions,
    };
  }
);

router
.get(
  '/:id/stats',

  guardAccessToken,

  async (ctx) => {
    let userId = ctx.request.params.id;
    if (userId === 'self') {
      userId = ctx.accessTokenDecoded.sub;
    }

    // TODO TODO TODO guard admin if not 'self'

    const user = await models.User.findByPk(userId);

    const [
      downloads,
      resources,
      followers,
      following,
      adsRunning,
      totalIncome,
      totalTips,
      totalDonations,
    ] = await Promise.all([
      user.getNumDownloads(),
      user.getNumResources(),
      user.getNumFollowers(),

      user.getNumFollowing(),

      user.getAdsRunning(),
      user.calculateTotalRevenueShare(),
      user.calculateTotalTips(),

      // user.getFeaturedResources(),

      user.calculateTotalDonations(),
    ]);

    ctx.body = {
      stats: {
        downloads,
        resources,
        followers,
        following,
        adsRunning,
        totalIncome,
        totalTips,
        totalDonations,
      },
    };
  },
);

router
.post(
  '/:id/balance-adjustment',

  guardAccessToken,

  guardAdmin,

  async (ctx) => {
    const userId = ctx.request.params.id;
    const user = await models.User.findByPk(userId);
    await user.transactBalanceAdjustment(ctx.request.body);

    ctx.body = {
      message: 'success',
    };
  }
);

// router
// .put(
//   '/bulk-email',
//   guardAccessToken,
//   guardAdmin,
//   async (ctx) => {
//     const userId = ctx.request.params.id;
//     const user = await models.User.findByPk(userId);
//     ctx.body = {
//       message: 'success',
//     };
//   }
// );

module.exports = router;


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
    const ads = await models.Advertisement.findAll({
      where: {
        approval_status: 'awaiting_approval',
      },
      order: [['created_at', 'ASC']],
      include: models.AdvertisementTargetGrade,
    });

    const userIds = new Set(ads.map(ad => ad.users_id));
    const users = await models.User.findAllByIds(userIds);

    ctx.body = {
      users,
      advertisements: ads,
    };
  },
);

router
.post(
  '/:id/approval',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const adId = ctx.request.params.id;
    const ad = await models.Advertisement.findByPk(adId);
    await ad.approve(ctx.request.body);

    ctx.status = 200;
    ctx.body = { };
  },
);

router
.post(
  '/:id/rejection',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const adId = ctx.request.params.id;
    const ad = await models.Advertisement.findByPk(adId);
    await ad.reject(ctx.request.body);

    ctx.status = 200;
    ctx.body = { };
  },
);

module.exports = router;

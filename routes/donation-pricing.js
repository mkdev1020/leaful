
const { DateTime } = require('luxon');

const Router = require('@koa/router');
const router = new Router();
module.exports = router;

const models = require('../models');
// models.sequelize.options.logging = true;

const { guardAccessToken, guardAdmin } = require('../middleware/guards');

router
.get(
  '/',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {

    const [promptPrices, sidebarPrices] = await Promise.all([
      models.DonationOption.findAll({
        where: { placement: 'prompt' },
        order: [[ 'id', 'ASC' ]],
      }),
      models.DonationOption.findAll({
        where: { placement: 'sidebar' },
        order: [[ 'id', 'ASC' ]],
      })
    ]);

    const [promptMetrics, sidebarMetrics] = await Promise.all([
      models.DonationOption.getStatsByVariation('prompt'),
      models.DonationOption.getStatsByVariation('sidebar'),
    ]);

    ctx.body = {
      prices: {
        prompt: promptPrices,
        sidebar: sidebarPrices,
      },
      metrics: {
        prompt: promptMetrics,
        sidebar: sidebarMetrics,
      },
    };
  }
);

router
.post(
  '/',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const donationOption = await models.DonationOption.create(ctx.request.body);
    ctx.body = {
      donationOption,
    };
  }
);

router
.patch(
  '/:id',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const id = ctx.request.params.id;
    const donationOption = await models.DonationOption.findByPk(id);
    if (!donationOption) {
      ctx.status = 404;
      return;
    }

    await donationOption.update(ctx.request.body);
    await donationOption.reload();

    ctx.body = {
      donationOption,
    };
  }
);

router
.delete(
  '/:id',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const id = ctx.request.params.id;
    const donationOption = await models.DonationOption.findByPk(id);
    if (!donationOption) {
      ctx.status = 404;
      return;
    }

    if (donationOption.is_default) {
      await donationOption.reset();
      ctx.status = 200;
      return;
    }

    await donationOption.destroy();

    ctx.status = 200;
  }
);

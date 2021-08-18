
const Router = require('@koa/router');
const router = new Router();

const models = require('../models');
const { guardAccessToken, guardAdmin } = require('../middleware/guards');

router.get(
  '/',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const settings = await models.SiteSetting.findAll();

    ctx.body = {
      settings,
    };
  },
);

router.patch(
  '/:id',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const setting = await models.SiteSetting.findByPk(ctx.request.params.id);
    if (!setting) {
      ctx.status = 404;
      return;
    }

    await setting.update(ctx.request.body);
    await setting.reload();

    ctx.body = {
      setting,
    };
  },
);

module.exports = router;

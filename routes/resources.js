
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
    const resources = await models.Resource.findAll({
      where: {
        approval_status: 'awaiting_approval',
      },
      order: [['created_at', 'ASC']],
      include: models.ResourcePreview,
    });

    const userIds = new Set(resources.map(resource => resource.users_id));
    const users = await models.User.findAllByIds(userIds);

    ctx.body = {
      users,
      resources,
    };
  },
);

router
.post(
  '/:id/approval',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const resourceId = ctx.request.params.id;
    const resource = await models.Resource.findByPk(resourceId);
    await resource.approve(ctx.request.body);

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
    const resourceId = ctx.request.params.id;
    const resource = await models.Resource.findByPk(resourceId);
    await resource.reject(ctx.request.body);

    ctx.status = 200;
    ctx.body = { };
  },
);

module.exports = router;

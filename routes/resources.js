
const { DateTime } = require('luxon');

const Router = require('@koa/router');
const router = new Router();
const fs = require('fs');

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
    let data = await resource.approve(ctx.request.body);

    ctx.status = 200;
    ctx.body = {
      data
    };
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


router
.post(
  '/:id/reactivate',
  guardAccessToken,

  async (ctx) => {
    const resourceId = ctx.request.params.id;
    const resource = await models.Resource.findByPk(resourceId);
    await resource.activate(ctx.request.body);

    ctx.status = 200;
    ctx.body = {
      resource
    };
  },
);

router
.post(
  '/:id/deactivate',
  guardAccessToken,

  async (ctx) => {
    const resourceId = ctx.request.params.id;
    const resource = await models.Resource.findByPk(resourceId);
    await resource.deactivate(ctx.request.body);

    ctx.status = 200;
    ctx.body = {
      resource
    };
  },
);

router
.post(
  '/:id/cancel',
  guardAccessToken,

  async (ctx) => {
    const resourceId = ctx.request.params.id;
    const resource = await models.Resource.findByPk(resourceId);
    await resource.cancel(ctx.request.body);

    ctx.status = 200;
    ctx.body = {
      resource
    };
  },
);

router
.post(
  '/',
  guardAccessToken,

  async (ctx) => {
    console.log(ctx.accessTokenDecoded, ctx.request.body);
    const user = await ctx.accessTokenDecoded.sub
    let item = await models.Resource.insertItem(ctx.request.body, user)

    ctx.status = 201;
    ctx.body = {
      item
    };
  },
);

router
.post(
  '/:id/files',
  guardAccessToken,

  async (ctx) => {
    let base64Data = ctx.request.body.file

    if(base64Data) {
      let base64 = base64Data.split(";base64,")[1];
      let buffer = Buffer.alloc(base64.length, base64, 'base64');

      await fs.writeFile(`static/files/uploads/${ctx.request.body.name}`,
        buffer,
        'base64',
        function(err) {
          console.log(err);
        });
    }

    let item = await models.Resource.insertResourceFile(ctx.request.params.id, ctx.request.body)

    ctx.status = 201;
    ctx.body = {
      item
    };
  },
);


router
.post(
  '/:id/resources-preview',
  guardAccessToken,

  async (ctx) => {

    let base64Data = ctx.request.body.file;
    console.log(base64Data)
    if(base64Data) {
      console.log("dfdsf")
      let base64 = base64Data.split(";base64,")[1];
      let buffer = Buffer.alloc(base64.length, base64, 'base64');

      await fs.writeFile(`static/preview-images/uploads/${ctx.request.body.name}`,
        buffer,
        'base64',
        function(err) {
          console.log(err);
        });
    }

    let item = await models.Resource.insertPreviewImage(ctx.request.params.id, ctx.request.body)

    ctx.status = 201;
    ctx.body = {
      item
    };
  },
);

router.delete(
  '/:id',
  guardAccessToken,

  async (ctx) => {
    const help = await models.Resource.deleteItem(ctx.request.params.id)

    ctx.status = 200;
    ctx.body = {
    };
});

module.exports = router;

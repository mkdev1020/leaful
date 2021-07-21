const Router = require('@koa/router');
const router = new Router();
const fs = require('fs')
var path = require('path');
const models = require('../models');

const { guardAccessToken, guardAdmin } = require('../middleware/guards');

router
.get(
  '/',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const entries = await models.HelpCenterEntry.findAll();

    ctx.status = 200;
    ctx.body = {
      entries,
    };
  },
);

router.post(
  '/',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    let base64Data = ctx.request.body.image ? ctx.request.body.image.replace(/^data:image\/png;base64,/, "") : ''

    if(base64Data) {
      await fs.writeFile(`static/images/master/uploads/${ctx.request.body.image_locator}`,
        base64Data,
        'base64',
        function(err) {
          console.log(err);
        });
    }

    let item = await models.HelpCenterEntry.insertItem(ctx.request.body)

    ctx.status = 201
    ctx.body = {
      item
    };
  }
);

router.post('/feedback', async (ctx) => {
  console.log(
    "REQUEST BODY:", ctx.request.body,
    "FILES:       ", ctx.request.files
  );
  console.log('dddddd', ctx.request.body)
  console.log(item)
  // TODO: move file into /static/master/uploads (or somewhere)

  ctx.body = {
  };
});


router.put(
  '/:id',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    let base64Data = ctx.request.body.image ? ctx.request.body.image.replace(/^data:image\/png;base64,/, "") : ''

    if(base64Data) {
      await fs.writeFile(`static/images/master/uploads/${ctx.request.body.image_locator}`,
        base64Data,
        'base64',
        function(err) {
          console.log(err);
        });
    }

    const item = await models.HelpCenterEntry.editItem(ctx.request.params.id, ctx.request.body)

    ctx.status = 200;
    ctx.body = {
      item
    };
  }
);

router.delete('/:id', async (ctx) => {
  const help = await models.HelpCenterEntry.deleteItem(ctx.request.params.id)

  ctx.status = 200;
  ctx.body = {
  };
});

router
.get(
  '/random-pro-tip',

  async (ctx) => {
    const proTip = await models.HelpCenterEntry.getRandomProTip();

    ctx.status = 200;
    ctx.body = {
      proTip,
    };
  },
);

router.get(
  '/inquiries',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    let threads = await models.EmailProxyThread.getAllUnresolvedSupportThreads();

    const userIds = new Set();
    threads = await Promise.all(threads.map(thread => {
      userIds.add(thread.users_id_a);
      userIds.add(thread.users_id_b);
      return (async () => {
        return Object.assign({}, thread.toJSON(), {
          messages: await thread.getAllSupportMessages(),
        });
      })();
    }));

    const users = await models.User.findAllByIds(userIds);

    ctx.body = {
      threads,
      users,
    };
  },

);

router.post(
  '/inquiries',
  guardAccessToken,

  async (ctx) => {
    const user = ctx.user;
    // const user = await models.User.findByPk(2);

    const activeThread = await models.EmailProxyThread.findActiveSupportThreadForUser(user);
    if (activeThread) {
      ctx.status = 400;
      ctx.body = {
        message: `There is already an active support thread.`,
      };
      return;
    }

    const emailProxyThread = await models.SupportThreadMessage.createEmailProxyThreadForUser(user);
    await emailProxyThread.sendInitialSupportThreadMessage(ctx.request.body.message);

    ctx.status = 200;
  },

);

router.patch(
  '/inquiries/:id',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const id = ctx.request.params.id;
    const emailProxyThread = await models.EmailProxyThread.findByPk(id);
    if (!emailProxyThread) {
      ctx.status = 404;
      return;
    }

    await emailProxyThread.update(ctx.request.body);

    ctx.status = 200;
    ctx.body = {
      inquiry: emailProxyThread,
    };
  }
);

router.post(
  '/inquiries/:id/message',
  guardAccessToken,
  guardAdmin,

  async (ctx) => {
    const id = ctx.request.params.id;
    const emailProxyThread = await models.EmailProxyThread.findByPk(id);
    if (!emailProxyThread) {
      ctx.status = 404;
      return;
    }

    const message = ctx.request.body.message;
    await emailProxyThread.sendSupportEmailReplyAdmin(message);

    ctx.status = 200;
  }
);

module.exports = router;

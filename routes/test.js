
const { DateTime } = require('luxon');
const Router = require('@koa/router');
const router = new Router();

const models = require('../models');
models.sequelize.options.logging = false;

const { guardAccessToken, guardHeartbeat } = require('../middleware/guards');
const { requireCaptcha } = require('../middleware/captcha');
const { createTestUser } = require('../tests/utilities');

const throttler = require('../middleware/throttler');

// XXX
throttler.settings.delayMultiplier = 1;
///////

function timeout(duration) {
  return new Promise(resolve => {
    global.setTimeout(resolve, duration);
  });
}

router.get(
  '/throttle',

  async (ctx, next) => {
    const user = await models.User.findByPk(2);
    ctx.user = user;
    next();
  },

  // throttler.ipThrottler(),
  throttler.userIdThrottler(),

  async (ctx, next) => {
    ctx.status = 404;
    ctx.body = {
      works: true,
    };
  },
);

router
.get(
  '/login-token',
  async (ctx, next) => {
    const loginToken = await models.UserLoginToken.findOne({
      where: { users_id: 2 },
    });
    if (!loginToken) {
      ctx.status = 404;
      return;
    }

    ctx.body = {
      loginToken: loginToken.token,
    };
  }
);

router.get('/token-heartbeat', guardAccessToken, guardHeartbeat, async (ctx) => {
  ctx.body = {
    works: 'true!',
  };
});

// TODO: redundant to `patternLock.js`
function randomChoice(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

async function createApiTestUser() {
  let alias_first_name = null;
  let alias_last_name = null;
  if (Math.random() > 0.5) {
    alias_first_name = randomChoice(['Alfirst', 'Alian', 'Aliex']);
    alias_last_name  = randomChoice(['Lastlias', 'Aliast', 'Secret']);
  }
  return await createTestUser({
    created_at       : DateTime.now().minus({ days: Math.round(Math.random() * 100) }),
    last_sign_in_date: DateTime.now().minus({ days: Math.round(Math.random() * 100) }),
    first_name: randomChoice(['Abby', 'Ben', 'Carter', 'David', 'Eli', 'Felicia', 'Gary', 'Hanna', 'Inez']),
    last_name: randomChoice(['Doe', 'Smith', 'McNoname', 'Washington']),
    alias_first_name,
    alias_last_name,
  });
}

router.get('/donate', async (ctx) => {
  const user = await models.User.findByPk(3);
  await user.donate(500);
  ctx.body = 'works!';
});

router.get('/populate-users', async (ctx) => {
  const newUserPromises = [];
  for (let i = 0; i < 50; i++) {
    newUserPromises.push((async () => {
      const user = await createApiTestUser();
      await user.reload();
      const resource = await models.Resource.create({ users_id: user.id, title: 'title', subtitle: 'test subtitle' });

      await user.sendRevenueShare(Math.round(Math.random() * 100000));

      const numActions = Math.round(Math.random() * 20);
      const actionsPromises = [];
      for (let j = 0; j < numActions; j++) {
        actionsPromises.push((async () => {
          const follower = await createApiTestUser();
          await follower.followUser(user.id);

          if (Math.random() > 0.3) {
            await follower.markDownload(resource);
          }

          if (Math.random() > 0.5) {
            await follower.markDownload(resource);
          }

          if (Math.random() > 0.7) {
            await follower.markDownload(resource);
          }
        })());
      }

      await Promise.all(actionsPromises);
    })());
  }

  await Promise.all(newUserPromises);

  ctx.body = 'k';
});

router.post(
  '/captcha',

  requireCaptcha(async (ctx) => {
    if (ctx.request.body.requireCaptcha) {
      return true;
    }
    return false
  }),

  async (ctx, next) => {
    ctx.status = 200;
    ctx.body = {
      message: 'correct captcha!',
    };
  },
);

module.exports = router;


const njwt = require('njwt');
const jwtDecode = require('jwt-decode');
const Router = require('@koa/router');
const router = new Router();

const models = require('../models');
models.sequelize.options.logging = false;

const { RequestError, ValidationError } = require('./error');

const { validateBody } = require('../middleware/validators');

const { guardAccessToken } = require('../middleware/guards');
const { requireCaptcha } = require('../middleware/captcha');
const throttler = require('../middleware/throttler');
const {Model} = require("sequelize");

function queryToBody() {
  return async (ctx, next) => {
    ctx.request.body = ctx.request.query;
    await next();
  }
}

function injectUser() {
  return async (ctx, next) => {
    const user = await models.User.findOne({
      where: { email: ctx.request.body.username }
    });

    if (!user) {
      ctx.status = 403;
      return;
    }

    ctx.user = user;
    await next();
  };
}


router
.get(
  '/username-validation',

  throttler.ipThrottler(),

  queryToBody(),

  validateBody({
    username: { presence: true },
  }),

  async (ctx) => {
    const user = await models.User.findOne({
      where: { email: ctx.request.body.username }
    });

    if (user) {
      ctx.status = 200;
      return;
    }

    ctx.status = 404;
  },
);

router
.post(
  '/token-heartbeat',

  guardAccessToken,

  validateBody({
    username: { presence: true },
    password: { presence: true },
  }),

  async (ctx, next) => {
    const tokenObject = jwtDecode(ctx.accessToken);

    const user = await models.User.findByPk(tokenObject.sub);
    if (!user.doesPasswordMatch(ctx.request.body.password)) {
      ctx.status = 403;
      ctx.body = {
        message: `Invalid password`,
      };
      return;
    }

    await models.TokenHeartbeat.refresh(ctx.accessToken);

    ctx.status = 200;
    ctx.body = { refreshed: true };
  }
);

router
.post(
  '/token/email-login-link',

  validateBody({
    username: { presence: true },
  }),

  injectUser(),

  async (ctx, next) => {
    try {
      await ctx.user.sendLoginLink();
      ctx.status = 200;
    }
    catch (e) {
      ctx.status = 500;
    }
  }
);

router
.post(
  '/token/login-token',

  validateBody({
    loginToken: { presence: true },
  }),

  async (ctx, next) => {
    const accessToken = await models.User.getAccessTokenFromLoginToken(ctx.request.body.loginToken);
    if (!accessToken) {
      ctx.status = 400;
      return;
    }

    ctx.status = 200;
    ctx.body = {
      accessToken,
    };
  }
);

router
.post(
  '/token',

  validateBody({
    username: { presence: true },
    password: { presence: true },
  }),

  injectUser(),

  requireCaptcha(async (ctx) => {
    const isIpRecognized = await ctx.user.isIpRecognized(ctx.ip);
    return !isIpRecognized;
  }),

  throttler.userIdThrottler(),

  async (ctx, next) => {
    const user = ctx.user;
    console.log("user", user)
    console.log(user.id);
    const doesMatch = user.doesPasswordMatch(ctx.request.body.password);
    if (!doesMatch) {
      ctx.status = 403;
      ctx.body = { message: 'Incorrect credentials' };
      return;
    }

    const accessToken = user.getNewAccessToken();
    const refreshToken = user.getRefreshToken();

    // ignore if empty address
    if (ctx.ip !== '::1') {
      await ctx.user.markIpRecognized(ctx.ip);
    }

    ctx.body = {
      accessToken,
      refreshToken,
      userdata : { userId : user.id}
    };
  }
);


router
.post(
  '/refresh-token',
  async (ctx, next) => {
    // const user = ctx.user;
    const token = ctx.request.body.refresh_token;
    const signingKey = '12341234';
    let accessToken = ''

    try {
      let verifiedJwt = njwt.verify(token, signingKey);
      let user = await models.User.getUserByTokenId(verifiedJwt.body.sub)
      accessToken = user.getNewAccessToken();
    } catch(e) {
      ctx.status = 403;
      ctx.body = { message: 'Incorrect credentials' };
      return;
    }
    // const refreshToken = user.getRefreshToken();

    // ignore if empty address
    // if (ctx.ip !== '::1') {
    //   await ctx.user.markIpRecognized(ctx.ip);
    // }

    ctx.body = {
      accessToken,
    };
  }
);

router
  .post(
    '/sign-up',

    validateBody({
      first_name: { presence: true },
      last_name: { presence: true },
      email: { presence: true },
      password: { presence: true },
    }),

    async (ctx, next) => {
      console.log('body', ctx.request.body)
      try {
        let user = await models.User.insertUser(ctx.request.body)
        console.log(user)
        ctx.status = 200;
      }
      catch (e) {
        console.log(e)
        ctx.status = 500;
      }
    }
  );

module.exports = router;

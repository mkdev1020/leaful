
const njwt = require('njwt');

const models = require('../models');
models.sequelize.options.logging = false;

async function guardAccessToken(ctx, next) {
  // TODO: shouldn't be hard-coded
  const signingKey = '12341234';
  try {
    njwt.verify(ctx.accessToken, signingKey);
  }
  catch (e) {
    console.error(e);
    ctx.status = 401;
    ctx.body = {
      reason: `invalid_token`,
    };
    return;
  }

  await next();
}
module.exports.guardAccessToken = guardAccessToken;

async function guardHeartbeat(ctx, next) {
  const isFresh = await models.TokenHeartbeat.isFresh(ctx.accessToken);
  if (isFresh) {
    return await next();
  }

  ctx.status = 401;
  ctx.body = {
    reason: `stale_heartbeat`,
  };
}
module.exports.guardHeartbeat = guardHeartbeat;

async function guardAdmin(ctx, next) {
  if (ctx.accessTokenDecoded.scopes.includes('admin')) {
    return await next();
  }

  ctx.status = 403;
  ctx.body = {
    reason: `permission_denied`,
  };
}
module.exports.guardAdmin = guardAdmin;

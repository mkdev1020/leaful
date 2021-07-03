
const models = require('../models');
const { validateRequest } = require('./validators');
models.sequelize.options.logging = false;

async function sendNewCaptcha(ctx) {
  const captcha = await models.CaptchaChallenge.generate()
  const captchaSolution = await captcha.getSolutionEntity();

  ctx.status = 401;
  ctx.body = {
    reason: 'requires_captcha',
    captcha: {
      id: captcha.id,
      clue: captchaSolution.clue,
      inputs: await captcha.getInputCodes(),
    },
  };
}

function requireCaptcha(isRequiredFunction = async () => true) {
  return async function(ctx, next) {
    // skip the captcha check if the user-defined require function returns false
    if (!(await isRequiredFunction(ctx))) {
      await next();
      return;
    }

    if (ctx.request.body.captcha) {
      validateRequest(ctx.request.body.captcha, {
        id         : { presence: true },
        inputCodes : { presence: true, type: "array" },
      });

      const captcha = ctx.request.body.captcha;
      const isValid = await models.CaptchaChallenge.validateAndDestroy(captcha.id, captcha.inputCodes)
      if (isValid) {
        await next();
        return;
      }
    }

    await sendNewCaptcha(ctx);
  }
}
module.exports.requireCaptcha = requireCaptcha;

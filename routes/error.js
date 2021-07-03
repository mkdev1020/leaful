
const Router = require('@koa/router');
const router = new Router();

class RequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RequestError';
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports.RequestError = RequestError;

class ValidationError extends Error {
  constructor(details) {
    const message = JSON.stringify(details);
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports.ValidationError = ValidationError;

router.use(async (ctx, next) => {
  try {
    await next();
  }
  catch (err) {
    console.error(err);
    if (err.name === 'RequestError') {
      ctx.status = err.status || 400;
      console.log(ctx.status);
      ctx.body = {
        message: err.message
      };
    }
    else if (err.name === 'ValidationError') {
      ctx.status = err.status || 400;
      console.log(ctx.status);
      ctx.body = {
        message: `Validation error!`,
        details: err.details,
      };
    }
    else {
      ctx.status = err.statusCode || err.status || 500;
    }
  }
})
module.exports.router = router;

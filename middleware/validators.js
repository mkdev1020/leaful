
const { ValidationError } = require('../routes/error');
const validate = require('validate.js');

const validateBody = (constraints) => {
  return async (ctx, next) => {
    validateRequest(ctx.request.body, constraints);
    await next();
  };
};
module.exports.validateBody = validateBody;

const validateRequest = (body, constraints) => {
  const result = validate(body, constraints);
  if (result) {
    throw new ValidationError(result);
  }
}
module.exports.validateRequest = validateRequest;

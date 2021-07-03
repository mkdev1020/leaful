
const { DateTime } = require('luxon');

const Router = require('@koa/router');
const router = new Router();

const models = require('../models');
// models.sequelize.options.logging = true;

const { guardAccessToken, guardAdmin } = require('../middleware/guards');

router
.get(
  '/',

  guardAccessToken,

  guardAdmin,

  async (ctx) => {
    let start = ctx.request.query.start;
    let end = ctx.request.query.end;

    let startDate, endDate;

    if (start) {
      startDate = DateTime.fromISO(start).toUTC();
    }

    if (end) {
      endDate = DateTime.fromISO(end).toUTC();
    }

    if (end === undefined) {
      endDate = DateTime.fromISO(end).toUTC();
    }

    if (start === undefined) {
      startDate = endDate.minus({ days: 30 });
    }

    const stats = await models.SiteStat.getAllForDateRange(
      startDate.toISO(),
      endDate.toISO()
    );

    ctx.body = {
      stats,
    };
  },
);

module.exports = router;

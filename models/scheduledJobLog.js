
const { DateTime } = require('luxon');

module.exports = (sequelize) => {
  const ScheduledJobLog = require(__dirname + '/definitions/scheduled_jobs_log')(sequelize);

  ScheduledJobLog.prototype.finish = async function(overrides = {}) {
    // if (overrides.info) {
    //   console.info(overrides.info);
    // }
    return await ScheduledJobLog.update(
      Object.assign(
        { },
        { finished_at: DateTime.now().toUTC().toISO() },
        overrides
      ),
      { where: { id: this.id } }
    );
  };

  return ScheduledJobLog;
}

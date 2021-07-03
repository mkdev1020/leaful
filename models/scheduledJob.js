
const { DateTime } = require('luxon');
const cronjsMatcher = require('@datasert/cronjs-matcher');

module.exports = (sequelize) => {
  const ScheduledJob = require(__dirname + '/definitions/scheduled_jobs')(sequelize);

  const User            = require(__dirname + '/user')(sequelize);
  const EmailTemplate   = require(__dirname + '/emailTemplate')(sequelize);
  const EmailScheduledSend = require(__dirname + '/emailScheduledSend')(sequelize);
  const Referral        = require(__dirname + '/referral')(sequelize);
  const ScheduledJobLog = require(__dirname + '/scheduledJobLog')(sequelize);
  const PurgedAccount   = require(__dirname + '/purgedAccount')(sequelize);
  const SiteSetting     = require(__dirname + '/siteSetting')(sequelize);
  const SiteBalance     = require(__dirname + '/siteBalance')(sequelize);
  const SiteStat        = require(__dirname + '/siteStat')(sequelize);

  const JOB_FUNCTIONS = {};

  ScheduledJob.findAllReady = async function(date = null) {
    if (!date) {
      date = DateTime.now().toUTC();
    }

    date = date.set({ second: 0, millisecond: 0 });
    const dateString = date.toISO()

    const allJobs = await ScheduledJob.findAll({ where: { enabled: true } });
    const readyJobs = [];
    for (const job of allJobs) {
      const cronSpec = job.getCronSpec();
      const ready = cronjsMatcher.isTimeMatches(cronSpec, dateString);
      if (ready) {
        readyJobs.push(job);
      }
    }
    return readyJobs;
  }

  ScheduledJob.registerJobFunction = function(name, func) {
    JOB_FUNCTIONS[name] = func;
  };

  ScheduledJob.runAllReady = async function() {
    const allReady = await ScheduledJob.findAllReady();
    for (const job of allReady) {
      await job.run();
    }
  };

  ScheduledJob.prototype.getCronSpec = function() {
    return `${this.minute} ${this.hour} ${this.day_of_month} ${this.month} ${this.day_of_week}`;
  };

  ScheduledJob.prototype.run = async function() {
    const logEntry = await ScheduledJobLog.create({ scheduled_jobs_id: this.id });

    const jobFunc = JOB_FUNCTIONS[this.name];
    if (jobFunc === undefined) {
      await logEntry.finish({
        info: `No job entry found for name: "${this.name}"`,
      });
      return;
    }

    try {
      const result = await jobFunc();
      await logEntry.finish({
        success: true,
        info: result,
      });
      return;
    }
    catch (e) {
      await logEntry.finish({ info: `${e.message}\n${e.stack}` });
      return;
    }
  };

  ScheduledJob.registerJobFunction('send non-creator purge warning emails', async() => {
    const users = await User.findAllForInactivity({ days: 180 - 7, isCreator: false });
    await EmailTemplate.bulkSendToUsers({
      users,
      template: 'purge-warning-non-creator',
    });
  });

  ScheduledJob.registerJobFunction('purge inactive non-creators', async() => {
    const users = await User.findAllForInactivity({ days: 180, isCreator: false });
    for (const user of users) {
      await user.purge();
    }
  });

  ScheduledJob.registerJobFunction('send creator dormancy warning emails', async() => {
    const users = await User.findAllForInactivity({ days: 180 - 7, isCreator: true });
    await EmailTemplate.bulkSendToUsers({
      users,
      template: 'dormancy-warning-creator',
    });
  });

  ScheduledJob.registerJobFunction('set dormant inactive creators', async() => {
    const users = await User.findAllForInactivity({ days: 180, isCreator: true });
    for (const user of users) {
      await user.setDormant('no_sign_in');
      await user.forfeitAllFunds();
    }
  });

  ScheduledJob.registerJobFunction('send creator purge warning emails', async() => {
    const inactiveUsers = await User.findAllForInactivity({ days: 365 - 7, isCreator: true });
    const excessFundsUsers = await User.findAllForExcessFunds({ days: 180 - 7 });

    const users = inactiveUsers.concat(excessFundsUsers);

    await EmailTemplate.bulkSendToUsers({
      users,
      template: 'purge-warning-creator',
    });
  });

  ScheduledJob.registerJobFunction('purge inactive creators', async() => {
    const inactiveUsers = await User.findAllForInactivity({ days: 365, isCreator: true });
    const excessFundsUsers = await User.findAllForExcessFunds({ days: 180 });

    const users = inactiveUsers.concat(excessFundsUsers);

    for (const user of users) {
      await user.purge();
    }
  });

  ScheduledJob.registerJobFunction('forfeit excess funds', async() => {
    // forfeit funds 7 days after marked as dormant
    const users = await User.findAllForExcessFunds({ days: 7 });
    for (const user of users) {
      await user.forfeitAllFunds();
    }
  });

  ScheduledJob.registerJobFunction('send new resources email', async() => {
    for (let week = 0; week < 4; week++) {
      // send resources digest exactly N days after last login
      const users = await User.findAllForInactivity({ days: 7 * (week + 1) });
      for (const user of users) {
        if (!user.marketing_email_enabled) {
          continue;
        }
        await user.sendRelevantNewResourcesEmail(week + 1);
      }
    }
  });

  // TODO: test
  ScheduledJob.registerJobFunction('send scheduled emails', async() => {
    await EmailScheduledSend.sendAllReady();
  });

  ScheduledJob.registerJobFunction('destroy expired referrals', async() => {
    await Referral.destroyAllExpired();
  });

  ScheduledJob.registerJobFunction('destroy old purged accounts', async() => {
    await PurgedAccount.destroyAllExpired();
  });

  ScheduledJob.registerJobFunction('auto distribute revenue share', async() => {
    const isEnabled = await SiteSetting.getValueByName('skip_manual_balances', false);
    if (!isEnabled) {
      return 'not enabled';
    }
    const today = DateTime.now().toUTC().toISO();
    return await SiteBalance.distributeRevenueShares(today);
  });

  ScheduledJob.registerJobFunction('compile site stats', async() => {
    await siteStat.procureDataForToday();
  });

  return ScheduledJob;
}

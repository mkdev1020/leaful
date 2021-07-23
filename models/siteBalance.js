const { DateTime } = require('luxon');

module.exports = (sequelize) => {
  const SiteBalance = require(__dirname + '/definitions/site_balances')(sequelize);

  const ResourceDownload = require(__dirname + '/resourceDownload')(sequelize);
  const Advertisement    = require(__dirname + '/advertisement')(sequelize);
  const Donation         = require(__dirname + '/donation')(sequelize);
  const SiteSetting      = require(__dirname + '/siteSetting')(sequelize);
  const User             = require(__dirname + '/user')(sequelize);

  SiteBalance.getForDate = async function(date) {
    return await sequelize.query(
      `
      SELECT *
      FROM \`site_balances\`
      WHERE DATE(\`record_date\`) = DATE(:date)
      `,
      {
        replacements: { date },
        model: SiteBalance,
        mapToModel: true,
        plain: true,
      }
    );
  };

  function getDateRange(startDateString, endDateString) {
    const range = [];
    const startDateTime = DateTime.fromISO(startDateString);
    const endDateTime = DateTime.fromISO(endDateString);

    let currDateTime = startDateTime;
    range.push(currDateTime);
    while (endDateTime.diff(currDateTime) > 0) {
      currDateTime = currDateTime.plus({ days: 1 });
      range.push(currDateTime);
    }
    return range;
  }

  SiteBalance.procureAllForDateRange = async function(startDateString, endDateString) {
    return await Promise.all(getDateRange(startDateString, endDateString).map((date) => {
      return SiteBalance.procureForDate(date.toISO());
    }));

    // return await sequelize.query(
    //   `
    //   SELECT *
    //   FROM \`site_balances\`
    //   WHERE
    //     DATE(\`record_date\`) >= DATE(:startDate)
    //     AND
    //     DATE(\`record_date\`) <= DATE(:endDate)
    //   `,
    //   {
    //     replacements: { startDate, endDate },
    //     model: SiteBalance,
    //     mapToModel: true,
    //   }
    // );
  };

  SiteBalance.procureForDate = async function(date) {
    const existing = await SiteBalance.getForDate(date);
    if (existing) {
      return existing;
    }

    const skipManualBalances = await SiteSetting.getValueByName('skip_manual_balances', false);

    const siteBalance = await SiteBalance.create({
      record_date: date,
      skip_manual_balances: skipManualBalances,
    });

    await siteBalance.reload();

    return siteBalance;
  };

  SiteBalance.calculateNetRevenue = async function(date) {
    const siteBalance = await SiteBalance.procureForDate(date);

    const grossRevenue = await SiteBalance.calculateGrossRevenue(date);
    const netRevenue = grossRevenue - siteBalance.expenses;

    return netRevenue;
  };

  SiteBalance.calculateGrossRevenue = async function(date) {
    const siteBalance = await SiteBalance.procureForDate(date);

    const adRevenue = await Advertisement.calculateTotalSpendForDate(date);
    const donations = await Donation.calculateTotalDonationsForDate(date);
    const affiliateRevenue = siteBalance.affiliate_revenue;

    return adRevenue + donations + affiliateRevenue;
  };

  SiteBalance.calculateRevenueShare = async function(date) {
    const globalRevenueShare = await SiteSetting.getValueByName('global_revenue_share');

    const netRevenue = await SiteBalance.calculateNetRevenue(date);
    const revenueShare = netRevenue * globalRevenueShare;

    return revenueShare;
  };

  SiteBalance.distributeRevenueShares = async function(date) {
    const revenueShare = await SiteBalance.calculateRevenueShare(date);
    const shareByUserId = await SiteBalance.getRevenueSharesForCreators(revenueShare, date);

    for (const [userId, share] of Object.entries(shareByUserId)) {
      const user = await User.findByPk(userId);
      await user.sendRevenueShare(share);
    }
  };

  SiteBalance.getRevenueSharesForCreators = async function(revenue, date) {
    const downloadsByUser = await ResourceDownload.getTotalDownloadsByUser(date);

    const shareByUserId = {};
    for (const [userId, downloadData] of Object.entries(downloadsByUser)) {
      const userRevenueShare = Math.round(downloadData.percentage * revenue);
      shareByUserId[userId] = userRevenueShare;
    }

    return shareByUserId;
  };

  return SiteBalance;
}


const { DateTime } = require('luxon');

module.exports = (sequelize) => {
  const SiteStat = require(__dirname + '/definitions/site_stats')(sequelize);

  const Advertisement = require(__dirname + '/advertisement')(sequelize);
  const SiteBalance   = require(__dirname + '/siteBalance')(sequelize);
  const User          = require(__dirname + '/user')(sequelize);

  SiteStat.getTotalNewUsers = async function(date) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`users\`
        WHERE DATE(\`created_at\`) = DATE('${date}')
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
      }
    );
    return result.total;
  };

  SiteStat.getTotalUsers = async function(date) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`users\`
        WHERE DATE(\`created_at\`) <= DATE('${date}')
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
      }
    );
    return result.total;
  };

  SiteStat.getTotalLogins = async function(date) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`users\`
        WHERE DATE(\`last_sign_in_date\`) = DATE('${date}')
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
      }
    );
    return result.total;
  };

  SiteStat.getTotalActiveResources = async function() {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`resources\`
        WHERE \`approval_status\` = 'approved'
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
      }
    );
    return result.total;
  };

  SiteStat.getTotalNewResources = async function(date) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`resources\`
        WHERE DATE(\`created_at\`) = DATE('${date}')
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
      }
    );
    return result.total;
  };

  SiteStat.getTotalResources = async function(date) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`resources\`
        WHERE DATE(\`created_at\`) <= DATE('${date}')
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
      }
    );
    return result.total;
  };

  SiteStat.getTotalDownloads = async function(date) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`resources_downloads\`
        WHERE DATE(\`download_date\`) = DATE('${date}')
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
      }
    );
    return result.total;
  };

  SiteStat.getTotalAdImpressions = async function(date) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`advertisements_records\` r
        JOIN \`advertisements\` a ON r.advertisements_id = a.id
        WHERE
          DATE(r.record_date) = DATE('${date}')
          AND
          r.record_type = 'impression'
          AND
          a.ad_type IN ('1', '2', '3', '4')
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
      }
    );
    return result.total;
  };

  SiteStat.getTotalDonationAmountForDate = async function(date) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(SUM(t.amount), 0) AS 'total'
        FROM \`users_transactions\` t
        WHERE
          DATE(t.created_at) = DATE('${date}')
          AND t.type = 'donation'
          AND t.users_id = :adminId
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
        replacements: {
          adminId: User.ADMIN_ACCOUNT_ID,
        },
      }
    );
    return parseInt(result.total);
  }

  SiteStat.getTotalMiscIncomeForDate = async function(date) {
    const result = await SiteBalance.getForDate(date);
    if (result) {
      return result.affiliate_revenue;
    }
    return 0;
  }

  SiteStat.getTotalDormancyIncomeForDate = async function(date) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(SUM(t.amount), 0) AS 'total'
        FROM \`users_transactions\` t
        WHERE
          DATE(t.created_at) = DATE('${date}')
          AND t.memo = 'dormant'
          AND t.users_id = :adminId
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
        replacements: {
          adminId: User.ADMIN_ACCOUNT_ID,
        },
      }
    );
    return parseInt(result.total);
  };

  SiteStat.getTotalTipsForDate = async function(date) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(SUM(t.amount), 0) AS 'total'
        FROM \`users_transactions\` t
        WHERE
          DATE(t.created_at) = DATE('${date}')
          AND t.type = 'tip_given'
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
      }
    );
    return parseInt(result.total);
  };

  SiteStat.getTotalUnpaidEarnings = async function(date) {
    let sum = 0;
    const users = await User.findAll();
    for (const user of users) {
      sum += await user.calculateEligiblePayout(date);
    }
    return sum;
  }

  SiteStat.aggregateDataForToday = async function() {
    const date = DateTime.now().toUTC();
    const dateSql = date.toSQL();

    const data = {};

    data.record_date = dateSql;

    // new_users
    data.new_users = await SiteStat.getTotalNewUsers(dateSql);

    // total_users
    data.total_users = await SiteStat.getTotalUsers(dateSql);

    // unique_logins
    data.unique_logins = await SiteStat.getTotalLogins(dateSql);

    // active_resources
    data.active_resources = await SiteStat.getTotalActiveResources();

    // new_resources
    data.new_resources = await SiteStat.getTotalNewResources(dateSql);

    // total_resources
    data.total_resources = await SiteStat.getTotalResources(dateSql);

    // resource_downloads
    data.resource_downloads = await SiteStat.getTotalDownloads(dateSql);

    // income_per_download
    const revenueShare = await SiteBalance.calculateRevenueShare(dateSql);
    data.income_per_download = (revenueShare / data.resource_downloads) || 0;

    // ad_impressions
    data.ad_impressions = await SiteStat.getTotalAdImpressions(dateSql);

    // ad_spend
    data.ad_spend = await Advertisement.calculateTotalSpendForDate(dateSql);

    // total_donations
    data.total_donations = await SiteStat.getTotalDonationAmountForDate(dateSql);

    // total_income
    data.total_income = data.ad_spend + data.total_donations;

    // misc_income
    data.misc_income = await SiteStat.getTotalMiscIncomeForDate(dateSql);

    // dormancy_income
    data.dormancy_income = await SiteStat.getTotalDormancyIncomeForDate(dateSql);

    // total_tips
    data.total_tips = await SiteStat.getTotalTipsForDate(dateSql);

    // total_revenue
    data.total_revenue = data.ad_spend + data.total_donations + data.misc_income;

    // total_unpaid_earnings
    data.total_unpaid_earnings = await SiteStat.getTotalUnpaidEarnings(date);

    return data;
  };

  SiteStat.getForDate = async function(date) {
    return await sequelize.query(
      `
      SELECT *
      FROM \`site_stats\`
      WHERE DATE(\`record_date\`) = DATE(:date)
      `,
      {
        replacements: { date },
        model: SiteStat,
        mapToModel: true,
        plain: true,
      }
    );
  };

  SiteStat.procureDataForToday = async function() {
    const existingStat = await SiteStat.getForDate(DateTime.now().toUTC().toISO());
    if (existingStat) {
      return existingStat;
    }

    const data = await SiteStat.aggregateDataForToday();
    return await SiteStat.create(data);
  };

  SiteStat.getAllForDateRange = async function(
    startDate = DateTime.now().toUTC().minus({ days: 30 }).toISO(),
    endDate   = DateTime.now().toUTC().toISO()
  ) {

    return await sequelize.query(
      `
      SELECT *
      FROM \`site_stats\`
      WHERE
        DATE(\`record_date\`) >= DATE(:startDate)
        AND
        DATE(\`record_date\`) <= DATE(:endDate)
      `,
      {
        replacements: {
          startDate,
          endDate,
        },
        model: SiteStat,
        mapToModel: true,
      }
    );
  };

  return SiteStat;
}

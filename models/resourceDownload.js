
const { DateTime } = require('luxon');
const { Op, QueryTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ResourceDownload = require(__dirname + '/definitions/resources_downloads')(sequelize);
  const Resource         = require(__dirname + '/definitions/resources')(sequelize);

  ResourceDownload.belongsTo(Resource, {
    foreignKey: 'resources_id',
  });

  ResourceDownload.getTotalReferralDownloadCreditsByUser = async function(date) {
    const results = await sequelize.query(`
      SELECT
        ref.\`affiliate_id\`,
        SUM(ref.\`commission_percentage_affiliate\` / 100)
          AS \`download_credits\`
      FROM \`referrals\` ref
      JOIN \`resources_downloads\` d ON d.\`referrals_id\` = ref.\`id\`
      WHERE DATE(d.\`download_date\`) = DATE(:date)
      GROUP BY ref.\`affiliate_id\`
      `,
      {
        replacements: { date },
        type: QueryTypes.SELECT,
      }
    );

    const creditsByUserId = {};
    for (const row of results) {
      creditsByUserId[row.affiliate_id] = parseFloat(row.download_credits);
    }

    return creditsByUserId;
  };

  ResourceDownload.getTotalDirectDownloadCreditsByUser = async function(date) {
    const results = await sequelize.query(`
      SELECT
        res.\`users_id\`,
        SUM(IF(d.\`referrals_id\`, 1 - (ref.\`commission_percentage_affiliate\` / 100), 1))
          AS \`total_downloads\`
      FROM \`resources_downloads\` d
      JOIN \`resources\` res ON res.id = d.resources_id
      LEFT JOIN \`referrals\` ref ON ref.id = d.referrals_id
      WHERE DATE(d.download_date) = DATE(:date)
      GROUP BY res.users_id
      `,
      {
        replacements: { date },
        type: QueryTypes.SELECT,
      }
    );

    const creditsByUserId = {};
    for (const row of results) {
      creditsByUserId[row.users_id] = parseFloat(row.total_downloads);
    }

    return creditsByUserId;
  };

  function combineSums(sumObjects) {
    const combinedSums = {};

    for (const obj of sumObjects) {
      for (const [key, value] of Object.entries(obj)) {
        if (combinedSums[key] === undefined) {
          combinedSums[key] = 0;
        }
        combinedSums[key] += value;
      }
    }

    return combinedSums;
  }

  ResourceDownload.getTotalDownloadsByUser = async function(date) {
    const affiliateCredits = await ResourceDownload.getTotalReferralDownloadCreditsByUser(date);
    const directCredits    = await ResourceDownload.getTotalDirectDownloadCreditsByUser(date);

    const totalCreditsByUser = combineSums([
      affiliateCredits,
      directCredits,
    ]);

    const totalOverall = Object.values(totalCreditsByUser).reduce((prev, curr) => prev + curr, 0);

    const totalDownloadsByUserId = {};
    for (const [userId, credits] of Object.entries(totalCreditsByUser)) {
      totalDownloadsByUserId[userId] = {
        downloads : credits,
        percentage: credits / totalOverall,
      };
    }

    return totalDownloadsByUserId;
  };

  ResourceDownload.createIfNotRecent = async function(resourceDownload) {
    const recentDownload = await ResourceDownload.findOne({
      where: {
        users_id: resourceDownload.users_id,
        resources_id: resourceDownload.resources_id,
        created_at: {
          [Op.gte]: DateTime.now().toUTC().minus({ days: 30 }).toISO(),
        },
      }
    });

    if (recentDownload) {
      return null;
    }

    return await ResourceDownload.create(resourceDownload);
  };

  return ResourceDownload;
}

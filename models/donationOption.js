
const { DateTime } = require('luxon');

module.exports = (sequelize) => {
  const DonationOption = require(__dirname + '/definitions/donations_options')(sequelize);
  const User           = require(__dirname + '/definitions/users')(sequelize);
  const UserDonationOption = require(__dirname + '/userDonationOption')(sequelize);

  DonationOption.procureForUser = async function(user, placement) {
    const userDonationOption = await UserDonationOption.findForUser(user, placement);

    if (userDonationOption?.donations_options_id) {
      return await DonationOption.findByPk(userDonationOption.donations_options_id);
    }

    const option = await DonationOption.getRandom(placement);

    await UserDonationOption.create({
      users_id: user.id,
      donations_options_id: option.id,
    });

    return option;
  };

  DonationOption.procureTierForUser = async function(user, placement) {
    const option = await DonationOption.procureForUser(user, placement);
    const tierData = option.getTierDataForNumPrompts(0);
    return tierData;
  };

  DonationOption.getPromptForUser = async function(user, placement) {
    const option = await DonationOption.procureForUser(user, placement);
    const tierData = option.getTierDataForNumPrompts(0);

    const optionStats = await option.getStatsForUser(user);

    if (optionStats.last_donation_prompt) {
      const lastPrompt = DateTime.fromJSDate(optionStats.last_donation_prompt).toUTC();
      const hoursSinceLastPrompt = DateTime.now().toUTC().diff(lastPrompt).as('hours');
      if (hoursSinceLastPrompt < 24) {
        return tierData;
      }
    }

    await optionStats.markPrompt();

    return tierData;
  };

  DonationOption.prototype.getStatsForUser = async function(user) {
    return await UserDonationOption.findOne({
      where: {
        users_id: user.id,
        donations_options_id: this.id,
      },
    });
  };

  DonationOption.getRandom = async function(placement) {
    return await DonationOption.findOne({
      where: {
        placement,
      },
      order: sequelize.literal('rand()'),
      limit: 1,
    });
  };

  DonationOption.getStatsByVariation = async function(placement) {
    const options = await DonationOption.findAll({ where: { placement } });
    const stats = await Promise.all(options.map(async (option) => {
      return {
        id: option.id,
        stats: await option.getStats(),
      };
    }));
    return stats;
  };

  DonationOption.prototype.getTotalUsersOptedIn = async function() {
    const usersOptedIn = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`users_donations_options\` udo
        JOIN \`users\` u ON u.id = udo.users_id
        WHERE
          u.role <> 'admin'
          AND udo.donations_options_id = :id
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
        replacements: {
          id: this.id,
        },
      }
    );
    return usersOptedIn.total;
  };

  DonationOption.prototype.getTotalUsersConverted = async function() {
    const usersOptedIn = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`users\`
        WHERE
          \`role\` <> 'admin'
          AND \`donated_options_id\` = :id
          AND \`donation_date\` >= :startedAt
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,
        replacements: {
          id: this.id,
          startedAt: DateTime.fromJSDate(this.started_at).toUTC().toFormat('yyyy-MM-dd HH:mm:ss'),
        },
      }
    );
    return usersOptedIn.total;
  };

  DonationOption.prototype.getTotalDonationAmount = async function() {
    let totalAmount = await sequelize.query(
      `
      SELECT IFNULL(SUM(t.amount), 0) AS 'total'
      FROM \`users_transactions\` t
      JOIN \`users\` u ON t.users_id = u.id
      WHERE
        u.donated_options_id = :optionId
        AND u.role <> 'admin'
        AND u.donation_date >= :optionStartedAt
        AND t.type = 'donation'
        AND t.status = 'completed'
      `,
      {
        replacements: {
          optionId: this.id,
          optionStartedAt: DateTime.fromJSDate(this.started_at).toUTC().toFormat('yyyy-MM-dd HH:mm:ss'),
        },
        plain: true,
      }
    );

    totalAmount = Math.abs(parseInt(totalAmount.total));

    return totalAmount;
  };

  DonationOption.prototype.getStats = async function() {
    const [usersOptedIn, usersConverted, totalDonationAmount] = await Promise.all([
      this.getTotalUsersOptedIn(),
      this.getTotalUsersConverted(),
      this.getTotalDonationAmount(),
    ]);

    return {
      usersOptedIn          : usersOptedIn,
      usersConverted        : usersConverted,
      conversionRate        : usersConverted / usersOptedIn,
      totalDonationAmount   : totalDonationAmount,
      averageDonationAmount : totalDonationAmount / usersConverted,
      amountPerUser         : totalDonationAmount / usersOptedIn,
    };
  };

  DonationOption.prototype.getTierDataForNumPrompts = function(numPrompts) {
    numPrompts = numPrompts || 0;
    for (let tier = 3; tier >= 1; tier--) {
      const tierName = `tier_${tier}`;
      if (!this[tierName]) {
        continue;
      }
      const onset = this[`${tierName}_onset`] || 0;
      if (numPrompts >= onset) {
        return this[tierName];
      }
    }
    return null;
  };

  DonationOption.prototype.reset = async function() {
    this.started_at = DateTime.now().toUTC().toJSDate();
    await this.save();
  };

  return DonationOption;
}

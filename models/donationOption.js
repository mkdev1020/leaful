
const { DateTime } = require('luxon');

module.exports = (sequelize) => {
  const DonationOption = require(__dirname + '/definitions/donations_options')(sequelize);
  const User           = require(__dirname + '/definitions/users')(sequelize);

  DonationOption.procureForUser = async function(user) {
    if (user.donations_options_id) {
      return await DonationOption.findByPk(user.donations_options_id);
    }

    const option = await DonationOption.getRandom();
    await User.update(
      { donations_options_id: option.id },
      { where: { id: user.id } }
    );
    return option;
  };

  DonationOption.procureTierForUser = async function(user) {
    const option = await DonationOption.procureForUser(user);
    const tierData = option.getTierDataForNumPrompts(user.num_donation_option_prompts);
    return tierData;
  };

  DonationOption.getPromptForUser = async function(user) {
    const tierData = await DonationOption.procureTierForUser(user);

    if (user.last_donation_prompt) {
      const lastPrompt = DateTime.fromJSDate(user.last_donation_prompt).toUTC();
      const hoursSinceLastPrompt = DateTime.now().toUTC().diff(lastPrompt).as('hours');
      if (hoursSinceLastPrompt < 24) {
        return tierData;
      }
    }

    await User.update(
      {
        num_donation_option_prompts : user.num_donation_option_prompts + 1,
        num_donation_prompts_total  : user.num_donation_prompts_total  + 1,
        last_donation_prompt        : DateTime.now().toUTC().toISO(),
      },
      { where: { id: user.id } }
    );

    return tierData;
  };

  DonationOption.getRandom = async function() {
    return await DonationOption.findOne({ order: sequelize.literal('rand()'), limit: 1 });
  };

  DonationOption.getStatsByVariation = async function() {
    const options = await DonationOption.findAll({ where: {} });
    const stats = await Promise.all(options.map(async (option) => {
      return {
        id: option.id,
        stats: await option.getStats(),
      };
    }));
    return stats;
  };

  DonationOption.clearAll = async function() {
    // set all users to default option
    await sequelize.query(
      `
      UPDATE \`users\` u
      JOIN \`donations_options\` o ON o.is_default = 1
      SET
        u.donations_options_id = o.id,
        u.num_donation_option_prompts = 0
      `
    );

    // delete all other options
    await DonationOption.destroy({ where: { is_default: false } });

    // reset date for default option
    await sequelize.query(
      `
      UPDATE \`donations_options\` o
      SET o.started_at = :startedAt
      WHERE o.is_default = 1
      `,
      {
        replacements: {
          startedAt: DateTime.now().toUTC().toFormat('yyyy-MM-dd HH:mm:ss'),
        },
      }
    );
  };

  DonationOption.prototype.getTotalUsersOptedIn = async function() {
    const usersOptedIn = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'total'
        FROM \`users\`
        WHERE
          \`role\` <> 'admin'
          AND \`donations_options_id\` = :id
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
          AND \`donations_options_id\` = :id
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
        u.donations_options_id = :optionId
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

  return DonationOption;
}


const { DateTime } = require('luxon');

module.exports = (sequelize) => {
  const UserDonationOption = require(__dirname + '/definitions/users_donations_options')(sequelize);

  UserDonationOption.findForUser = async function(user, placement) {
    const result = await sequelize.query(
      `
        SELECT udo.*
        FROM \`users_donations_options\` udo
        JOIN \`donations_options\` d ON udo.donations_options_id = d.id
        WHERE
          d.placement = :placement
          AND udo.users_id = :userId
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        plain: true,

        replacements: {
          placement,
          userId: user.id,
        },
        model: UserDonationOption,
        mapToModel: true,
      }
    );

    return result;
  };

  UserDonationOption.prototype.markPrompt = async function() {
    return await this.update(
      {
        num_donation_option_prompts : this.num_donation_option_prompts + 1,
        num_donation_prompts_total  : this.num_donation_prompts_total  + 1,
        last_donation_prompt        : DateTime.now().toUTC().toISO(),
      },
    );
  };

  return UserDonationOption;
}

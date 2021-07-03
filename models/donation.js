
module.exports = (sequelize) => {
  const Donation = require(__dirname + '/definitions/donations')(sequelize);

  Donation.calculateTotalDonationsForDate = async function(date) {
    let total = await sequelize.query(
      `
      SELECT IFNULL(SUM(\`donation_amount\`), 0) AS \`total\`
      FROM \`donations\`
      WHERE
        DATE(\`created_at\`) = DATE(:date)
      `,
      {
        replacements: { date },
        plain: true,
      }
    );

    total = parseInt(total.total);

    return total;
  };

  return Donation;
}

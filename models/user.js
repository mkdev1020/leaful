
const njwt = require('njwt');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { DateTime } = require('luxon');

const { clearThrottlerForId } = require('../middleware/throttler');

module.exports = (sequelize) => {
  const User = require(__dirname + '/definitions/users')(sequelize);

  const Advertisement    = require(__dirname + '/advertisement')(sequelize);
  const SiteSetting      = require(__dirname + '/siteSetting')(sequelize);
  const Resource         = require(__dirname + '/resource')(sequelize);
  const ResourceDownload = require(__dirname + '/resourceDownload')(sequelize);
  const Referral         = require(__dirname + '/referral')(sequelize);
  const UserTransaction  = require(__dirname + '/userTransaction')(sequelize);
  const UserFollowing    = require(__dirname + '/userFollowing')(sequelize);
  const UserLoginToken   = require(__dirname + '/userLoginToken')(sequelize);
  const UserPermission   = require(__dirname + '/userPermission')(sequelize);
  const UserIp           = require(__dirname + '/userIp')(sequelize);
  const DonationOption   = require(__dirname + '/donationOption')(sequelize);
  const PurgedAccount    = require(__dirname + '/purgedAccount')(sequelize);
  const EmailTemplate    = require(__dirname + '/emailTemplate')(sequelize);
  const EmailScheduledSend = require(__dirname + '/emailScheduledSend')(sequelize);

  async function beforeCreate(user, options) {
    if (user.avatar_locator === null && user.first_name) {
      const firstLetter = user.first_name[0];
      const num = Math.floor(Math.random() * 24) + 1;
      user.avatar_locator = `/api/images/letters/${firstLetter.toUpperCase()}/${firstLetter}${num}.svg`;
    }
    return user;
  }

  User.addHook('beforeCreate', beforeCreate);

  User.addHook('beforeBulkCreate', (transactions, options) => {
    return Promise.all(
      transactions.map((transaction) => beforeCreate(transaction, options))
    );
  });

  const FRIENDLY_GRADE_NAME = {
     p: 'Pre-K',
     0: 'Kindergarten',
     k: 'Kindergarten',
     1: '1st Grade',
     2: '2nd Grade',
     3: '3rd Grade',
     4: '4th Grade',
     5: '5th Grade',
     6: '6th Grade',
     7: '7th Grade',
     8: '8th Grade',
     9: '9th Grade',
    10: '10th Grade',
    11: '11th Grade',
    12: '12th Grade',
     h: 'Higher Level',
  };

  // TODO: use actual Teachagogo/admin account here
  const ADMIN_ACCOUNT_ID = 1;
  const SITE_TIP_CUT = 0.25;
  const DAILY_TIP_LIMIT = 5000;

  User.ADMIN_ACCOUNT_ID = ADMIN_ACCOUNT_ID;

  User.findAllForInactivity = async function(options) {
    let isCreatorClause = '1';
    if (options.isCreator === true) {
      isCreatorClause = `num_resources > 0`;
    }
    else if (options.isCreator === false) {
      isCreatorClause = `num_resources = 0`;
    }

    const query = `
      SELECT u.*, IFNULL(COUNT(r.id), 0) AS 'num_resources'
      FROM \`users\` u
      LEFT JOIN \`resources\` r ON r.users_id = u.id
      WHERE
        IFNULL(u.dormancy_reason, '') <> 'excess_funds'
        AND
        (DATEDIFF(CURRENT_TIMESTAMP(), u.last_sign_in_date)) = :days
      GROUP BY u.id
      HAVING
        ${isCreatorClause}
    `;

    return await sequelize.query(
      query,
      {
        replacements: { days: options.days },
        type: sequelize.QueryTypes.SELECT,
        model: User,
        mapToModel: true,
      }
    );
  }

  User.findAllForExcessFunds = async function(options) {
    const query = `
      SELECT u.*
      FROM \`users\` u
      WHERE
        u.is_dormant = 1
        AND u.dormancy_reason = 'excess_funds'
        AND (DATEDIFF(CURRENT_TIMESTAMP(), u.dormancy_date)) = :days
    `;

    return await sequelize.query(
      query,
      {
        replacements: { days: options.days },
        type: sequelize.QueryTypes.SELECT,
        model: User,
        mapToModel: true,
      }
    );
  };

  User.getAccessTokenFromLoginToken = async function(loginToken) {
    const token = await UserLoginToken.findByToken(loginToken);
    if (!token) {
      throw new Error(`Invalid login token`);
    }

    const user = await User.findByPk(token.users_id);

    await UserLoginToken.destroyToken(token.token);
    const accessToken = user.getNewAccessToken();

    user.clearLoginLockout();

    return accessToken;
  };

  User.prototype.getNewAccessToken = function(claimOverrides = {}) {
    // TODO: shouldn't be hard-coded
    const signingKey = '12341234';
    const baseClaims = {
      sub: this.id,
      iat: DateTime.now().toUTC().toSeconds(),
      iss: "https://teachagogo.com/",
      scopes: [],
      exp: DateTime.now().toUTC().plus({ hours: 4 }).toJSDate(),
    }

    if (this.role === 'admin') {
      baseClaims.scopes.push('admin');
    }

    const claims = Object.assign({}, baseClaims, claimOverrides);

    const jwt = njwt.create(claims, signingKey);
    if (claims.exp) {
      jwt.setExpiration(claims.exp);
    }
    return jwt.compact();
  };

  User.prototype.doesPasswordMatch = function(password) {
    const doesMatch = bcrypt.compareSync(password, this.password_hash);
    return doesMatch;
  };

  User.prototype.isIpRecognized = async function(ip) {
    const result = await UserIp.findOne({
      where: {
        users_id: this.id,
        ip,
      },
    });

    return !!result;
  };

  User.prototype.markIpRecognized = async function(ip) {
    const isAlreadyRecognized = await this.isIpRecognized(ip);
    if (isAlreadyRecognized) {
      return;
    }

    await UserIp.create({
      users_id: this.id,
      ip,
    });
  };

  User.prototype.calculatePayoutDeductions = async function(date = DateTime.now().toUTC()) {
    // NOTE: The `calculateNetTopupBalance` is the heart of the "take
    // expenses from tip balance first" functionality. When calculating the
    // eligible payout, we don't want to deduct ALL the topups from the
    // balance. Instead, we want to deduct only the topups that haven't been
    // "eaten away at" from tips given. And if there have been more tips
    // given than the topup balance can handle, we don't want to deduct ANY
    // topup balance-- it's already been cleared away from the tips given,
    // and our standard balance amount already has that factored in.
    const totalTopups = await this.calculateNetTopupBalance(date);
    const totalImmatureRevenue = await this.calculateImmatureRevenue(date);

    return totalTopups + totalImmatureRevenue;
  };

  User.prototype.calculateImmatureRevenue = async function(date = DateTime.now().toUTC()) {
    const dateSql = date.toSQL();
    let totalImmatureRevenue = await sequelize.query(
      `
      SELECT IFNULL(SUM(\`amount\`), 0) AS 'total'
      FROM \`users_transactions\`
      WHERE
        \`users_id\` = :userId
        AND \`type\` IN ('revenue_share', 'tip_received')
        AND \`status\` = 'completed'
        AND \`created_at\` >= '${dateSql}' - INTERVAL 30 DAY
        AND \`created_at\` <= '${dateSql}'
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );

    totalImmatureRevenue = parseInt(totalImmatureRevenue.total);

    return totalImmatureRevenue;
  };

  User.prototype.calculateNetTopupBalance = async function (date = DateTime.now().toUTC()) {
    // the net topup balance is the total topup balance, minus any expenses
    // that may "eat into" the topup balance (e.g. tip_given transactions)

    const dateSql = date.toSQL();

    let totalTopups = await sequelize.query(
      `
      SELECT IFNULL(SUM(\`amount\`), 0) AS 'total'
      FROM \`users_transactions\`
      WHERE
        \`users_id\` = :userId
        AND \`type\` = 'top_up'
        AND \`status\` = 'completed'
        AND \`created_at\` <= '${dateSql}'
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );

    totalTopups = parseInt(totalTopups.total);

    let totalTipsGiven = await sequelize.query(
      `
      SELECT IFNULL(SUM(\`amount\`), 0) AS 'total'
      FROM \`users_transactions\`
      WHERE
        \`users_id\` = :userId
        AND \`type\` = 'tip_given'
        AND \`status\` = 'completed'
        AND \`created_at\` <= '${dateSql}'
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );
    totalTipsGiven = parseInt(totalTipsGiven.total);

    // NOTE: totalTipsGiven will be negative, so adding the values here makes
    // sense
    const netTopups = totalTopups + totalTipsGiven;

    // bound the net topups value to a minimum of 0
    return Math.max(netTopups, 0);
  };

  User.prototype.calculateEligiblePayout = async function(date = DateTime.now().toUTC()) {
    const balance = await this.calculateBalance(date);
    const deductions = await this.calculatePayoutDeductions(date);

    return balance - deductions;
  };

  User.prototype.calculateBalance = async function (date = DateTime.now().toUTC()) {
    const dateSql = date.toSQL();
    const amountResult = await sequelize.query(
      `
      SELECT
        IFNULL(SUM(\`amount\`), 0)
        AS 'total'
      FROM \`users_transactions\`
      WHERE
        \`users_id\` = :userId
        AND
        \`status\` = 'completed'
        AND \`created_at\` <= '${dateSql}'
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );

    if (amountResult.total?.length > 0) {
      return parseInt(amountResult.total);
    }

    return null;
    /*

    ENUM("tip_received", "tip_given", "donation", "revenue_share", "adjustment", "payout", "top_up")

    BALANCE:
    + topupTO
    + revshareTO
    + adjTO
    + tipTO
    - tipFROM
    - donationFROM
    - payoutFROM

    ELIGIBLE PAYOUT:
    + BALANCE
    - topupTO

    - revshareTO <= 30 days old
    - tipTO      <= 30 days old

    tip:
      - FROM user1 TO user2
        - SUBTRACT
      - TO user1 FROM user2
        - ADD

    donation:
      - FROM user1 TO site
        - SUBTRACT

    revenue_share:
      - FROM site TO user1
        - ADD

    adjustment:
      - FROM site TO user1
        - ADD

    payout:
      - FROM user1 TO user1
        - SUBTRACT

    top_up:
      - FROM user1 TO user1
        - ADD (FOR BALANCE)
        - DISREGARD (FOR PAYOUT)
    */
  };

  User.prototype.calculateTotalRevenueShare = async function (date = DateTime.now().toUTC()) {
    const dateSql = date.toSQL();
    const amountResult = await sequelize.query(
      `
      SELECT IFNULL(SUM(\`amount\`), 0) AS 'total'
      FROM \`users_transactions\`
      WHERE
        \`users_id\` = :userId
        AND \`status\` = 'completed'
        AND \`type\` = 'revenue_share'
        AND \`created_at\` <= '${dateSql}'
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );

    if (amountResult.total?.length > 0) {
      return parseInt(amountResult.total);
    }

    return null;
  };

  User.prototype.calculateTotalTips = async function (date = DateTime.now().toUTC()) {
    const dateSql = date.toSQL();
    const amountResult = await sequelize.query(
      `
      SELECT IFNULL(SUM(\`amount\`), 0) AS 'total'
      FROM \`users_transactions\`
      WHERE
        \`users_id\` = :userId
        AND \`status\` = 'completed'
        AND \`type\` = 'tip_received'
        AND \`created_at\` <= '${dateSql}'
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );

    if (amountResult.total?.length > 0) {
      return parseInt(amountResult.total);
    }

    return null;
  };

  User.prototype.calculateTotalDonations = async function (date = DateTime.now().toUTC()) {
    const dateSql = date.toSQL();
    const amountResult = await sequelize.query(
      `
      SELECT IFNULL(SUM(\`amount\`), 0) AS 'total'
      FROM \`users_transactions\`
      WHERE
        \`users_id\` = :userId
        AND \`status\` = 'completed'
        AND \`type\` = 'donation'
        AND \`created_at\` <= '${dateSql}'
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );

    if (amountResult.total?.length > 0) {
      return -parseInt(amountResult.total);
    }

    return null;
  };

  User.prototype.createLoginUrl = async function () {
    const token = await UserLoginToken.procureTokenForUser(this);
    const url = token.getUrl();
    // https://www.teachagogo.com/specs/email_following_new.htm
    return url;
  };

  User.prototype.sendLoginLink = async function() {
    const url = await this.createLoginUrl();
    await this.sendEmail('login-link', {
      name: this.first_name,
      url,
    });
  };

  User.prototype.clearLoginLockout = function() {
    clearThrottlerForId(this.id);
  };

  function getWeights(objects, mapper) {
    const values = objects.map(mapper);

    const weights = {};
    for (const value of values) {
      if (weights[value] === undefined) {
        weights[value] = 0;
      }
      weights[value] += (1 / values.length);
    }

    return weights;
  }

  User.prototype.getResourcePreferenceWeights = async function() {
    const resourcesDownloaded = await ResourceDownload.findAll({
      where: {
        users_id: this.id,
      },
      include: Resource,
    });

    const gradeWeights   = getWeights(resourcesDownloaded, res => res.resources_model.grade);
    const subjectWeights = getWeights(resourcesDownloaded, res => res.resources_model.subject_area);

    return {
      gradeWeights,
      subjectWeights,
    };
  };

  User.prototype.getSubjectPreferenceWeights = async function(resourceDownloads) {
    return
  };

  User.prototype.markDownload = async function(resource, referralCode = null) {
    if (resource.users_id == this.id) {
      return null;
    }

    if (this.role === 'admin') {
      return null;
    }

    let referral;
    if (referralCode) {
      referral = await Referral.findByCode(referralCode);
    }

    if (referral && referral.affiliate_id == this.id) {
      return null;
    }

    return await ResourceDownload.createIfNotRecent({
      users_id: this.id,
      resources_id: resource.id,
      referrals_id: referral ? referral.id : null,
    });
  };

  User.prototype.setDormant = async function(reason) {
    if (this.is_zombie || this.is_dormant) {
      return false;
    }

    return await this.update({
      is_dormant: true,
      dormancy_reason: reason,
      dormancy_date: new Date(),
    });
  }

  User.prototype.clearDormancy = async function() {
    await this.update({
      is_dormant: false,
      dormancy_reason: null,
      dormancy_date: null,
    });
  }

  User.prototype.getApplicableDonationPrompt = async function() {
    if (await this.isRecentDonator()) {
      console.log('recent donor!');
      return null;
    }

    const totalDownloadsToday = await this.numResourceDownloadsToday();
    if (totalDownloadsToday < 5) {
      return null;
    }

    return await DonationOption.getPromptForUser(this);
  };

  User.prototype.guardMinimumBalance = async function(amount) {
    const balance = await this.calculateBalance();
    if (balance < amount) {
      throw new Error(`You don't have enough funds!`);
    }
  };

  User.prototype.guardMaximumBalance = async function() {
    const balance = await this.calculateBalance();
    const maxBalance = 999900;
    if (balance > maxBalance) {
      const remainder = balance - maxBalance;

      await this.setDormant('excess_funds');

      await this.sendEmail('warning-excess-funds', { name: this.first_name });

      return await this.transactBalanceAdjustment({
        amount: -remainder,
        memo: 'dormant',
      });
    }
  }

  User.prototype.countNewResourcesFromFollowing = async function(weeks) {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'num_resources'
        FROM \`resources\` r
        WHERE
          r.created_at >= (NOW() - INTERVAL :weeks WEEK)
          AND
          r.users_id IN (
            SELECT f.users_id_following
            FROM \`users_following\` f
            WHERE f.users_id = :userId
          )
      `,
      {
        plain: true,
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: this.id,
          weeks,
        },
      }
    );

    return result['num_resources'];
  };

  User.prototype.getUsersFollowing = async function() {
    return await sequelize.query(
      `
        SELECT u.*
        FROM \`users_following\` f
        JOIN \`users\` u ON u.id = f.users_id_following
        WHERE f.users_id = :userId
      `,
      {
        model: User,
        mapToModel: true,
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: this.id,
        },
      }
    );
  };

  User.prototype.followUser = async function(userId) {
    return await UserFollowing.create({
      users_id: this.id,
      users_id_following: userId,
    });
  };

  User.prototype.sendEmail = async function(template, values = {}) {
    const email = EmailTemplate.newEmail();
    email.setEmailAddress(this.email);
    await email.setTemplate(template);
    email.setValues(values);
    return await email.send();
  };

  User.prototype.getRandomDaytimeDateTime = async function() {
    const emailStartHours = await SiteSetting.getValueByName('email-start-hours', 8);
    const emailWindowHours = await SiteSetting.getValueByName('email-window-hours', 12);

    const dayStart = DateTime.now().toUTC().startOf('day').plus({
      hours: emailStartHours,
      minutes: this.timezone_offset,
    });

    const now = DateTime.now().toUTC();

    // 8am - 8pm (12 hours)
    const minutesInDaytime = emailWindowHours * 60;
    const randomMinuteOffset = Math.floor(Math.random() * minutesInDaytime);

    let randomDateTime = dayStart.plus({ minutes: randomMinuteOffset });
    if (randomDateTime < now) {
      randomDateTime = randomDateTime.plus({ days: 1 });
    }

    return randomDateTime;
  };

  User.prototype.scheduleSendEmail = async function(template, values = {}, sendDate = null) {
    if (sendDate === null) {
      sendDate = await this.getRandomDaytimeDateTime();
    }

    const emailTemplate = await EmailTemplate.findOne({ where: { slug: template } });
    if (!emailTemplate) {
      throw new Error(`Email template "${template}" does not exist!`);
    }

    return await EmailScheduledSend.create({
      users_id: this.id,
      send_at_date: sendDate.toISO(),
      email_templates_id: emailTemplate.id,
      email_values: values,
    });
  }

  User.prototype.sendRelevantNewResourcesEmail = async function(weeks = 1) {
    const newResourceCount = await this.countNewResourcesFromFollowing(weeks);
    if (newResourceCount > 0) {
      return await this.scheduleSendEmail('new-resources-following', {
        weeks,
        name: this.first_name,
        newResourceCount,
      });
    }

    await this.sendNewResourcesEmailForInterests();
  };

  User.prototype.sendNewResourcesEmailForInterests = async function() {
    const downloadDetails = await this.getRecentDownloadsDetails();
    if (downloadDetails.length === 0) {
      return null;
    }

    return await this.scheduleSendEmail('new-resources-interests', {
      newResourceDetails: downloadDetails.map(details => {
        const combo = details[0];
        details.gradeDisplay = FRIENDLY_GRADE_NAME[combo.grade];
        details.subjectDisplay = combo.subject_area[0].toUpperCase() + combo.subject_area.slice(1);
        details.count = details[1];
        return details;
      }),
      name: this.first_name,
      newResourceCount: downloadDetails.reduce((acc, curr) => curr[1] + acc, 0),
    });
  };

  User.prototype.getRecentDownloadsDetails = async function() {
    const results = await sequelize.query(
      `
        SELECT r.id, r.grade, r.subject_area, d.download_date
        FROM \`resources_downloads\` d
        JOIN \`resources\` r ON r.id = d.resources_id
        WHERE d.users_id = :userId
        ORDER BY d.download_date DESC, d.id DESC
        LIMIT 100
      `,
      {
        type: sequelize.QueryTypes.SELECT,
        replacements: { userId: this.id },
      }
    );

    const numResultsForCombo = {};
    for (const result of results) {
      const combo = JSON.stringify({ grade: result.grade, subject_area: result.subject_area });
      if (numResultsForCombo[combo] === undefined) {
        numResultsForCombo[combo] = 0;
      }
      numResultsForCombo[combo] += 1;
    }

    const numResultsArrays = Object.entries(numResultsForCombo);
    if (numResultsArrays.lengty === 0) {
      return [];
    }

    numResultsArrays.sort((a, b) => {
        if (a[1] < b[1]) { return 1; }
        if (a[1] > b[1]) { return -1; }
        return 0;
    });

    const topNumResultsArrays = numResultsArrays.slice(0, Math.min(numResultsArrays.length, 3));
    const details = topNumResultsArrays.map((arr) => {
      return [JSON.parse(arr[0]), arr[1]];
    });

    return details;
  };

  User.prototype.guardMinimumDonation = async function(amount) {
    const donationTier = await DonationOption.procureTierForUser(this);
    const minimumAmount = donationTier[0];
    if (amount < minimumAmount) {
      throw new Error(`Your donation is below the minimum amount!`);
    }
  };

  User.prototype.isRecentDonator = async function() {
    if (!this.donation_date) {
      return false;
    }

    const donationDate = DateTime.fromJSDate(this.donation_date);
    const lastDonationAgeDays = DateTime.now().toUTC().diff(donationDate).as('days');

    return lastDonationAgeDays < 365;
  };

  User.prototype.hasTippedUserRecently = async function(recipientId) {
    const result = await UserTransaction.findOne({
      where: {
        users_id: this.id,
        users_id_related: recipientId,
        type: 'tip_given',
        created_at: {
          [Op.gte]: DateTime.now().minus({ days: 30 }).toUTC().toISO(),
        },
      },
    });

    return result !== null;
  };

  User.prototype.numResourceDownloadsToday = async function() {
    let totalToday = await sequelize.query(
      `
      SELECT COUNT(*) AS 'total'
      FROM \`resources_downloads\`
      WHERE
        \`users_id\` = :userId
        AND \`created_at\` >= NOW() - INTERVAL 24 HOUR
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );

    totalToday = parseInt(totalToday.total);

    return totalToday;
  };

  User.prototype.numTopupsDoneToday = async function() {
    let totalTopupsToday = await sequelize.query(
      `
      SELECT COUNT(*) AS 'total'
      FROM \`users_transactions\`
      WHERE
        \`users_id\` = :userId
        AND \`type\` = 'top_up'
        AND \`status\` = 'completed'
        AND \`created_at\` >= NOW() - INTERVAL 24 HOUR
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );

    totalTopupsToday = parseInt(totalTopupsToday.total);

    return totalTopupsToday;
  };

  User.prototype.numTipsGivenToday = async function () {
    let totalTipsToday = await sequelize.query(
      `
      SELECT COUNT(*) AS 'total'
      FROM \`users_transactions\`
      WHERE
        \`users_id\` = :userId
        AND \`type\` = 'tip_given'
        AND \`status\` = 'completed'
        AND \`created_at\` >= NOW() - INTERVAL 24 HOUR
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );

    totalTipsToday = parseInt(totalTipsToday.total);

    return totalTipsToday;
  };

  User.prototype.totalAmountTippedToday = async function() {
    let totalAmount = await sequelize.query(
      `
      SELECT IFNULL(SUM(\`amount\`), 0) AS 'total'
      FROM \`users_transactions\`
      WHERE
        \`users_id\` = :userId
        AND \`type\` = 'tip_given'
        AND \`status\` = 'completed'
        AND \`created_at\` >= NOW() - INTERVAL 24 HOUR
      `,
      {
        replacements: { userId: this.id },
        plain: true,
      }
    );

    totalAmount = Math.abs(parseInt(totalAmount.total));

    return totalAmount;
  };

  User.prototype.tipUserWithId = async function (userId, amount) {
    const recipientUser = await User.findByPk(userId);

    const totalTipsToday = await this.numTipsGivenToday();
    if (totalTipsToday >= 5) {
      throw new Error(`You can't tip more than 5 times per day!`);
    }

    const hasTippedRecently = await this.hasTippedUserRecently(recipientUser.id);
    if (hasTippedRecently) {
      throw new Error(`You can't tip the same user twice within a 30-day period!`);
    }

    const totalAmountTippedToday = await this.totalAmountTippedToday();
    if (totalAmountTippedToday >= DAILY_TIP_LIMIT) {
      throw new Error(`You've reached your maximum tip limit for the day!`);
    }

    await this.guardMinimumBalance(amount);

    const tipTransactions = await this.transactTip(recipientUser, {
      amount,
    });

    await Promise.all([
      this.guardMaximumBalance(),
      recipientUser.guardMaximumBalance(),
    ]);

    return tipTransactions;
  }

  User.prototype.applyTopup = async function(amount) {
    const topupsToday = await this.numTopupsDoneToday();
    if (topupsToday >= 2) {
      throw new Error(`You have exceeded the maximum number of allowed topups in a single day!`);
    }

    await this.transactTopup(amount);
  };

  User.prototype.sendRevenueShare = async function(amount) {
    if (parseInt(this.is_dormant)) {
      return await this.transactBalanceAdjustment({
        amount: -amount,
        memo: 'dormant',
      });
    }

    await UserTransaction.create({
      users_id: this.id,
      users_id_related: ADMIN_ACCOUNT_ID,
      type: 'revenue_share',
      amount,
      status: 'completed',
    });

    await this.guardMaximumBalance();
  }

  User.prototype.payoutToPaypal = async function(amount) {
    // TODO TODO TODO

    return true;
  };

  User.prototype.getPendingPayout = async function() {
    return await UserTransaction.findOne({
      where: {
        type  : 'payout',
        status: 'awaiting_approval',
      },
    });
  };

  User.prototype.requestPayout = async function() {
    const alreadyPendingPayout = await this.getPendingPayout();

    if (alreadyPendingPayout) {
      throw new Error(`You can't request a payout while another payout is still awaiting approval.`);
    }

    const eligiblePayout = await this.calculateEligiblePayout();

    if (this.is_dormant) {
      await this.clearDormancy();
    }

    return await UserTransaction.create({
      users_id: this.id,
      type: 'payout',
      amount: -eligiblePayout,
      status: (this.role === 'admin'
        ? 'completed'
        : 'awaiting_approval'),
    });
  };

  User.prototype.approvePayout = async function() {
    const pendingPayout = await this.getPendingPayout();
    if (!pendingPayout) {
      throw new Error(`There are no pending payouts to approve!`);
    }

    const payoutAmount = Math.abs(pendingPayout.amount);

    await this.payoutToPaypal(payoutAmount);

    await UserTransaction.update(
      { status: 'completed' },
      { where: { id: pendingPayout.id } },
    );
  };

  User.prototype.donate = async function(amount) {
    await this.guardMinimumDonation(amount);
    await this.transactDonation({ amount });
    await User.update(
      { donation_date: DateTime.now().toUTC().toISO() },
      { where: { id: this.id } }
    );
  };

  User.prototype.transactDonation = async function(donation) {
    const transaction = Object.assign({}, donation, {
      status      : 'completed',
      fingerprint : UserTransaction.makeFingerprint(),
    });

    const transactions = await UserTransaction.bulkCreate([
      Object.assign({}, transaction, {
        users_id: this.id,
        users_id_related: ADMIN_ACCOUNT_ID,
        amount: -donation.amount,
        type: 'donation',
      }),
      Object.assign({}, transaction, {
        users_id: ADMIN_ACCOUNT_ID,
        users_id_related: this.id,
        amount: donation.amount,
        type: 'donation',
      }),
    ]);

    return transactions;
  };

  User.prototype.transactTip = async function(recipientUser, tip) {
    const transaction = Object.assign({}, tip, {
      status      : 'completed',
      fingerprint : UserTransaction.makeFingerprint(),
    });

    let recipientId = recipientUser.id;
    let memo = null;
    if (parseInt(recipientUser.is_dormant)) {
      recipientId = ADMIN_ACCOUNT_ID;
      memo = 'dormant';
    }

    if (parseInt(recipientUser.is_zombie)) {
      recipientId = ADMIN_ACCOUNT_ID;
      memo = 'zombie';
    }

    const transactions = await UserTransaction.bulkCreate([
      Object.assign({}, transaction, {
        users_id: this.id,
        users_id_related: recipientUser.id,
        // deduct GROSS tip from tipper's account
        amount: -tip.amount,
        type: 'tip_given',
      }),
      Object.assign({}, transaction, {
        users_id: recipientId,
        users_id_related: this.id,
        // add NET tip to tippee's account (i.e. with the site's cut taken out)
        amount: tip.amount * (1 - SITE_TIP_CUT),
        type: 'tip_received',
        memo,
      }),
    ]);

    return transactions;
  };

  User.prototype.transactBalanceAdjustment = async function(adjustment) {
    const transaction = Object.assign({}, adjustment, {
      type        : 'adjustment',
      status      : 'completed',
      fingerprint : UserTransaction.makeFingerprint(),
    });

    return await UserTransaction.bulkCreate([
      Object.assign({}, transaction, {
        users_id: this.id,
        users_id_related: ADMIN_ACCOUNT_ID,
        amount: adjustment.amount,
      }),
      Object.assign({}, transaction, {
        users_id: ADMIN_ACCOUNT_ID,
        users_id_related: this.id,
        amount: -adjustment.amount,
      }),
    ]);
  };

  User.prototype.transactTopup = async function(amount) {
    return await UserTransaction.create({
      users_id: this.id,
      amount,
      status: 'completed',
      type: 'top_up',
    });
  };

  User.prototype.deleteZombie = async function() {
    if (!this.is_zombie) {
      throw new Error(`This user is not a zombie!`);
    }

    await Resource.update(
      { users_id: ADMIN_ACCOUNT_ID },
      { where: { users_id: this.id } }
    );

    return await this.destroy();
  };

  User.prototype.forfeitAllFunds = async function() {
    const balance = await this.calculateBalance();
    await this.transactBalanceAdjustment({ amount: -balance });
  };

  User.prototype.forfeitAllResources = async function() {
    return await sequelize.query(
      `
      UPDATE \`resources\` r
      SET r.users_id = :adminId
      WHERE r.users_id = :userId
      `,
      {
        replacements: {
          adminId: ADMIN_ACCOUNT_ID,
          userId: this.id,
        }
      }
    );
  };

  User.prototype.purge = async function() {
    await this.forfeitAllFunds();
    await this.forfeitAllResources();
    await PurgedAccount.create({
      email: this.email,
    });
    await this.destroy();
  };

  User.prototype.getNumFollowers = async function() {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'count'
        FROM \`users_following\` f
        WHERE f.users_id_following = :userId
      `,
      {
        plain: true,
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: this.id,
        },
      }
    );
    return result.count;
  };

  User.prototype.getNumFollowing = async function() {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'count'
        FROM \`users_following\` f
        WHERE f.users_id = :userId
      `,
      {
        plain: true,
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: this.id,
        },
      }
    );
    return result.count;
  };

  User.prototype.getNumResources = async function() {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'count'
        FROM \`resources\` r
        WHERE r.users_id = :userId
      `,
      {
        plain: true,
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: this.id,
        },
      }
    );
    return result.count;
  };

  User.prototype.getNumDownloads = async function() {
    const result = await sequelize.query(
      `
        SELECT IFNULL(COUNT(*), 0) AS 'count'
        FROM \`resources_downloads\` d
        JOIN \`resources\` r ON r.id = d.resources_id
        WHERE r.users_id = :userId
      `,
      {
        plain: true,
        type: sequelize.QueryTypes.SELECT,
        replacements: {
          userId: this.id,
        },
      }
    );
    return result.count;
  };

  User.prototype.getAdsRunning = async function() {
    return await Advertisement.findAll({
      where: {
        users_id: this.id,
        running_status: 'running',
      },
    });
  };

  User.prototype.procurePermissions = async function () {
    const [permissions, created] = await UserPermission.findOrCreate({
      where: { users_id: this.id },
    });
    return permissions;
  };

  return User;
}

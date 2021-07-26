
const { Op } = require("sequelize");
const { DateTime, Interval } = require('luxon');

function getDatesForRange(startDate, endDate) {
  startDate = DateTime.fromISO(startDate);
  endDate = DateTime.fromISO(endDate);
  const numDaysRunning = Interval.fromDateTimes(startDate, endDate).length('days') + 1;

  const dates = [];
  for (let i = 0; i < numDaysRunning; i++) {
    const currDate = startDate.plus({ days: i }).toFormat('yyyy-MM-dd');
    dates.push(currDate);
  }

  return dates;
}

function intersection(setA, setB) {
  const intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      intersection.add(elem);
    }
  }
  return intersection;
}

function weightedRandomChoice(options) {
  const weights = [];
  for (let i = 0; i < options.length; i++) {
    // create a segment on an imaginary line, whereby all segments add up to
    // the full line, and each segment has a length proportional to its weight
    const segment = options[i].weight + (weights[i - 1] || 0);
    weights.push(segment);
  }

  // choose a random point on the line, normalized by the max value in the
  // line (which will always be the segment at the last index)
  const randomPoint = Math.random() * weights[weights.length - 1];

  // return the first segment that is greater than the randomly chosen point
  for (let i = 0; i < weights.length; i++) {
    if (weights[i] > randomPoint) {
      return options[i];
    }
  }

  return options[0];
}

module.exports = (sequelize) => {
  const Advertisement = require(__dirname + '/definitions/advertisements')(sequelize);
  const AdvertisementTargetGrade = require(__dirname + '/advertisementTargetGrade')(sequelize);

  Advertisement.AD_TYPE_1 = '1';
  Advertisement.AD_TYPE_2 = '2';
  Advertisement.AD_TYPE_3 = '3';
  Advertisement.AD_TYPE_4 = '4';

  Advertisement.hasMany(AdvertisementTargetGrade, {
    foreignKey: 'advertisements_id',
  });

  Advertisement.getHighestBidForDateRange = async function (startDate, endDate) {
    const highest = await sequelize.query(
      `
      SELECT \`spend_per_day\`
      FROM \`advertisements\`
      WHERE
        NOT (\`end_date\` < :startDate OR \`start_date\` > :endDate)
      ORDER BY \`spend_per_day\` DESC
      LIMIT 1
      `,
      { replacements: { startDate, endDate } }
    );

    return highest;
  };

  Advertisement.fairCreate = async function(ad) {
    const currHighestBid = Advertisement.getHighestBidForDateRange(ad.start_date, ad.end_date);
    if (currHighestBid >= 4) {
      if (ad.spend_per_day > currHighestBid * 2) {
        return false;
      }
    }

    return await Advertisement.create(ad);
  };

  Advertisement.getAverageImpressions = async function() {
    // get average impressions over the past 30 days
    const query = `
      SELECT AVG(i.\`impressions\`) AS \`impressions\`
      FROM (
        SELECT r.\`record_date\`, COUNT(*) AS \`impressions\`
        FROM \`advertisements_records\` r
        WHERE
          r.\`record_type\` = 'impression'
          AND
          r.\`record_date\` BETWEEN (CURDATE() - INTERVAL 30 DAY) AND CURDATE()
        GROUP BY r.\`record_date\`
      ) AS i
    `;

    let averageImpressions = await sequelize.query(
      query,
      { plain: true }
    );

    averageImpressions = parseInt(averageImpressions['impressions']);

    return averageImpressions;
  };

  Advertisement.getEstimatedImpressions = async function(startDate, endDate, spendPerDay) {
    const datesForRange = getDatesForRange(startDate, endDate);
    const totalSpendForDate = {};
    for (const d of datesForRange) {
      totalSpendForDate[d] = 0;
    }

    const datesSetForRange = new Set(datesForRange);
    const ads = await Advertisement.getAllForDateRange(startDate, endDate);

    for (const ad of ads) {
      const adRunDatesSet = new Set(ad.getRunDates());

      const overlappingDates = intersection(datesSetForRange, adRunDatesSet);
      for (const overlappingDate of overlappingDates) {
        totalSpendForDate[overlappingDate] += ad.spend_per_day;
      }
    }

    const averageImpressionsPerDay = await Advertisement.getAverageImpressions();
    let totalEstimatedImpressions = 0;
    for (const otherAdsTotalSpendForDay of Object.values(totalSpendForDate)) {
      const totalSpendForDay = otherAdsTotalSpendForDay + spendPerDay;
      const estimatedImpressionShare = (spendPerDay / totalSpendForDay) || 0;
      const estimatedImpressionsForDay = estimatedImpressionShare * averageImpressionsPerDay;
      totalEstimatedImpressions += estimatedImpressionsForDay;
    }

    return totalEstimatedImpressions;
  };

  Advertisement.prototype.getRunDates = function() {
    return getDatesForRange(
      DateTime.fromJSDate(this.start_date),
      DateTime.fromJSDate(this.end_date)
    );
  };

  Advertisement.getAllForDateRange = async function(startDate, endDate) {
    const ads = await Advertisement.findAll({
      where: {
        [Op.and]: [
          { running_status: 'running' },
          {
            // NOTE: here, we're basically choosing all advertisements that are
            // _not outside_ the start and end date range (rather than choosing
            // all that are inside, which is harder to test for)
            [Op.not]: [
              {
                [Op.or]: [
                  { end_date   : { [Op.lt]: startDate }, },
                  { start_date : { [Op.gt]: endDate }, },
                ],
              },
            ],
          },
        ]
      },
      include: AdvertisementTargetGrade,
    });

    return ads;
  };

  Advertisement.prototype.getGradeWeightMultiplier = function(gradeWeights) {
    const adGrades = this.advertisements_target_grades_models.map((targetGrade) => {
      return targetGrade.grade;
    });

    if (adGrades.length === 0) {
      // if the ad doesn't have any associated grades, then just use the
      // _average_ grade weighting
      const gradeWeightValues = Object.values(gradeWeights);
      const totalGradeWeights = gradeWeightValues.reduce((acc, grade) => acc + grade, 0);

      return totalGradeWeights / gradeWeightValues.length;
    }

    let adGradeWeight = 0;
    for (const adGrade of adGrades) {
      adGradeWeight += gradeWeights[adGrade] !== undefined
        ? gradeWeights[adGrade]
        : 0;
    }

    return adGradeWeight;
  };

  Advertisement.getWeightsForUser = async function(user = null) {
    let gradeWeights = {};
    if (user) {
      gradeWeights = (await user.getResourcePreferenceWeights()).gradeWeights;
    }
    const ads = await Advertisement.getAllForDateRange(
      DateTime.now().toUTC().toISO(),
      DateTime.now().toUTC().toISO()
    )

    const totalSpend = ads.reduce((acc, ad) => acc + ad.spend_per_day, 0);

    const adShareWeights = ads.map((ad) => {
      return {
        ad,
        id: ad.id,
        share: ad.spend_per_day / totalSpend,
      };
    });

    const adjustedWeights = {};
    let adjustedWeightSum = 0;
    for (const adShareWeight of adShareWeights) {
      const adGradeWeight = adShareWeight.ad.getGradeWeightMultiplier(gradeWeights);

      const weight = adShareWeight.share * adGradeWeight;
      adjustedWeights[adShareWeight.id] = {
        ad: adShareWeight.ad,
        weight,
      };
      adjustedWeightSum += weight;
    }

    const normalizedAdjustedWeights = [];
    for (const weightInfo of Object.values(adjustedWeights)) {
      normalizedAdjustedWeights.push({
        ad: weightInfo.ad,
        weight: weightInfo.weight / adjustedWeightSum,
      });
    }

    return normalizedAdjustedWeights;
  };

  Advertisement.chooseForUser = async function(user = null) {
    const weights = await Advertisement.getWeightsForUser(user);
    if (weights.length === 0) {
      throw new Error(`No ads to choose from!`);
    }

    const chosenAd = weightedRandomChoice(weights);
    return chosenAd.ad;
  };

  Advertisement.calculateTotalSpendForDate = async function(date) {
    let total = await sequelize.query(
      `
      SELECT IFNULL(SUM(\`spend_per_day\`), 0) AS \`total\`
      FROM \`advertisements\`
      WHERE
        NOT (DATE(\`end_date\`) < DATE(:date) OR DATE(\`start_date\`) > DATE(:date))
      `,
      {
        replacements: { date },
        plain: true,
      }
    );

    total = parseInt(total.total);

    return total;
  };

  Advertisement.prototype.approve = async function(fields = {}) {
    const User = require(__dirname + '/user')(sequelize);

    await this.update(Object.assign({},
      {
        approval_status: 'approved',
        rejected_at: null,
        moderator_comment: null,
      },
      fields
    ));
    await this.reload();

    const user = await User.findByPk(this.users_id);
    await user.sendEmail('ad-approved', {
      name: user.first_name,
      ad: this,
    });
  };

  Advertisement.prototype.reject = async function(fields = {}) {
    const User = require(__dirname + '/user')(sequelize);

    await this.update(Object.assign({},
      {
        approval_status: 'rejected',
        rejected_at: DateTime.now().toUTC().toISO(),
        moderator_comment: null,
      },
      fields
    ));
    await this.reload();

    const user = await User.findByPk(this.users_id);
    await user.sendEmail('ad-rejected', {
      name: user.first_name,
      ad: this,
    });
  };

  return Advertisement;
}

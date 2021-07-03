
const { DateTime } = require('luxon');

const utilities = require('./utilities');
const models = require('../models');
const User = models.User;
const Advertisement = models.Advertisement;
const AdvertisementRecord = models.AdvertisementRecord;

models.sequelize.options.logging = false;

beforeEach(async () => {
  await utilities.clearDatabase();
});

// https://www.teachagogo.com/specs/ad_type_a.htm
test(`ad space bids should not exceed 2x the next highest bidder`, async () => {
  // limits the highest per day dollar amount possible at any given time to
  // double what the next highest bidder is paying per day

  const user = await utilities.createTestUser();

  // shouldn't "kick in" right away
  await Advertisement.fairCreate({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: "site",
    users_id: user.id,
    spend_per_day: 1,
    start_date: '2021-01-01',
    end_date  : '2021-02-01',
    running_status: 'running',
  });

  // more than double, but that's okay since these are such small numbers
  await Advertisement.fairCreate({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: "site",
    users_id: user.id,
    spend_per_day: 3,
    start_date: '2021-01-01',
    end_date  : '2021-02-01',
    running_status: 'running',
  });

  // should kick in after around 4 dollars
  await Advertisement.fairCreate({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: "site",
    users_id: user.id,
    spend_per_day: 4,
    start_date: '2021-01-01',
    end_date  : '2021-02-01',
    running_status: 'running',
  });

  // error
  await Advertisement.fairCreate({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: "site",
    users_id: user.id,
    spend_per_day: 9,
    start_date: '2021-01-01',
    end_date  : '2021-02-01',
    running_status: 'running',
  });

  // success
  await Advertisement.fairCreate({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: "site",
    users_id: user.id,
    spend_per_day: 8,
    start_date: '2021-01-01',
    end_date  : '2021-02-01',
    running_status: 'running',
  });
})

test(`should give an accurate estimation of ad impressions`, async() => {
  /*
  | AD "TRACKS"   | TOTAL IMPR/TRACK |
  +----------------------------------+
  |  A |  B |  C  |   A  |  B  |  C  |
  +----------------------------------+
  |  5 | 20 | 15  |  299 | 598 | 300 |
  +----+----+------------+-----+-----+
  | $1 |    |     == 100 |   0 |   0 |
  | $1 |    |     == 100 |   0 |   0 |
  | $1 | $2 |     ==  33 |  66 |   0 |
  | $1 | $2 |     ==  33 |  66 |   0 |
  | $1 | $2 |     ==  33 |  66 |   0 |
  |    | $2 | $3  ==   0 |  40 |  60 |
  |    | $2 | $3  ==   0 |  40 |  60 |
  |    | $2 | $3  ==   0 |  40 |  60 |
  |    | $2 | $3  ==   0 |  40 |  60 |
  |    | $2 | $3  ==   0 |  40 |  60 |
  |    | $2 |     ==   0 | 100 |   0 |
  |    | $2 |     ==   0 | 100 |   0 |
  */

  const anchorDate = DateTime.now().toUTC();

  const user = await utilities.createTestUser();
  const ad1 = await Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: user.id,
    spend_per_day: 1,
    running_status: 'running',

    start_date: anchorDate.toISO(),
    end_date  : anchorDate.plus({ days: 5 }).toISO(),
  });

  const recordsPromises = [];
  for (let i = 0; i < 30; i++) {
    // simulate 100 ad impressions per day for the past 30 days
    const records = [];
    for (let r = 0; r < 100; r++) {
      records.push({
        advertisements_id: ad1.id,
        record_type: 'impression',
        record_date: anchorDate.minus({ days: i }).toISO(),
      });
    }
    recordsPromises.push(AdvertisementRecord.bulkCreate(records));
  }

  await Promise.all(recordsPromises);

  await Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: user.id,
    spend_per_day: 2,
    running_status: 'running',

    start_date: anchorDate.plus({ days:  3 }).toISO(),
    end_date  : anchorDate.plus({ days: 12 }).toISO(),
  });

  const averageImpressions = await Advertisement.getAverageImpressions();
  expect(averageImpressions).toBe(100);

  // |    | $2 | $3  ==   0 |  40 |  60 |
  // |    | $2 | $3  ==   0 |  40 |  60 |
  // |    | $2 | $3  ==   0 |  40 |  60 |
  // |    | $2 | $3  ==   0 |  40 |  60 |
  // |    | $2 | $3  ==   0 |  40 |  60 |
  //
  // 60 * 5 = 300 estimated ad impressions
  let estimatedImpressions = await Advertisement.getEstimatedImpressions(
    anchorDate.plus({ days:  6 }).toISO(), // end date
    anchorDate.plus({ days: 10 }).toISO(), // start date
    3 // spend per day
  );
  expect(estimatedImpressions).toBe(300);

  // | $1 | $2 | $3  ==  17 |  33 |  50 |
  // | $1 | $2 | $3  ==  17 |  33 |  50 |
  // | $1 | $2 | $3  ==  17 |  33 |  50 |
  //
  // 50 * 3 = 150 estimated ad impressions
  estimatedImpressions = await Advertisement.getEstimatedImpressions(
    anchorDate.plus({ days: 3 }).toISO(), // start date
    anchorDate.plus({ days: 5 }).toISO(), // end date
    3 // spend per day
  );
  expect(estimatedImpressions).toBe(150);
});

test(`should only show running ads`, async () => {
  const adCreator = await utilities.createTestUser();
  const adConsumer = await utilities.createTestUser();

  // only ads that are running for the specific day
  await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: adCreator.id,
    running_status: 'running',
    spend_per_day: 1,

    // this will run in the future, but now today!
    start_date: DateTime.now().toUTC().plus({ days:  5 }).toISO(),
    end_date:   DateTime.now().toUTC().plus({ days: 10 }).toISO(),
  });

  const adWeights1 = await Advertisement.getWeightsForUser(adConsumer);
  expect(adWeights1.length).toBe(0);

  const pendingAd = await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: adCreator.id,
    // NOT running!
    // running_status: 'running',
    spend_per_day: 1,

    // date overlaps today, but the ad is not set to 'running', so it will
    // still not show up
    start_date: DateTime.now().toUTC().toISO(),
    end_date:   DateTime.now().toUTC().plus({ hours: 1 }).toISO(),
  });

  const adWeights2 = await Advertisement.getWeightsForUser(adConsumer);
  expect(adWeights2.length).toBe(0);

  await pendingAd.update({
    running_status: 'running',
  });

  const adWeights3 = await Advertisement.getWeightsForUser(adConsumer);
  expect(adWeights3.length).toBe(1);
  expect(adWeights3[0].ad.id).toBe(pendingAd.id);
})

test(`should prioritize ads based on user preferences`, async () => {
  const anonTeacher1 = await utilities.createTestUser();

  // only ads that match the grade level preferences of a user
  // grade level preferences: https://www.teachagogo.com/specs/active_search.htm
  const grade5Teacher = await utilities.createTestUser();
  const grade5Resource1 = await models.Resource.create({ users_id: anonTeacher1.id, title: 'grade 5 resource!', subtitle: 'test subtitle', grade: '5' });
  const grade5Resource2 = await models.Resource.create({ users_id: anonTeacher1.id, title: 'grade 5 resource!', subtitle: 'test subtitle', grade: '5' });
  const grade5Resource3 = await models.Resource.create({ users_id: anonTeacher1.id, title: 'grade 5 resource!', subtitle: 'test subtitle', grade: '5' });

  const grade6Resource = await models.Resource.create({
    users_id: anonTeacher1.id,
    title: 'grade 6 resource!',
    subtitle: 'test subtitle',
    grade: '6',
  });
  // simulate downloads: 3/4 downloads is grade 5 material, and 1/4 is grade 6
  await grade5Teacher.markDownload(grade5Resource1);
  await grade5Teacher.markDownload(grade5Resource2);
  await grade5Teacher.markDownload(grade5Resource3);

  await grade5Teacher.markDownload(grade6Resource);

  const grade3Teacher = await utilities.createTestUser();
  const grade3Resource = await models.Resource.create({
    users_id: anonTeacher1.id,
    title: 'grade 3 resource!',
    subtitle: 'test subtitle',
    grade: '3',
  });
  // simulate downloads of grade level 3
  await grade3Teacher.markDownload(grade3Resource);

  const adCreator = await utilities.createTestUser();

  // create an ad, which specifically targets only grade 5
  const adGrade5 = await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: adCreator.id,
    running_status: 'running',
    spend_per_day: 1,

    start_date: DateTime.now().toUTC().toISO(),
    end_date  : DateTime.now().toUTC().toISO(),
  });
  await models.AdvertisementTargetGrade.create({
    advertisements_id: adGrade5.id,
    grade: '5',
  });

  // create another ad, which does NOT target a specific grade
  const adUnspecific = await models.Advertisement.create({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: 'site',
    users_id: adCreator.id,
    running_status: 'running',
    spend_per_day: 1,

    start_date: DateTime.now().toUTC().toISO(),
    end_date  : DateTime.now().toUTC().toISO(),
  });

  const gradeWeight1 = (await grade5Teacher.getResourcePreferenceWeights()).gradeWeights;
  expect(gradeWeight1['5']).toBe(0.75);
  expect(gradeWeight1['6']).toBe(0.25);

  // should show both ads, but give more weight to the grade 5 ad
  const weights1 = await Advertisement.getWeightsForUser(grade5Teacher);
  const weightsByAdId1 = {};
  for (const w of weights1) {
    weightsByAdId1[w.ad.id] = w.weight;
  }
  expect(weightsByAdId1[adGrade5.id]).toBe(0.6);
  expect(weightsByAdId1[adUnspecific.id]).toBe(0.4);

  // should give 100% probability to the unspecific ad, since there are no
  // grade 3 ads
  const weights2 = await Advertisement.getWeightsForUser(grade3Teacher);
  const weightsByAdId2 = {};
  for (const w of weights2) {
    weightsByAdId2[w.ad.id] = w.weight;
  }
  expect(weightsByAdId2[adUnspecific.id]).toBe(1);
  expect(weightsByAdId2[adGrade5.id]).toBe(0);
});


const { DateTime } = require('luxon');
const { v4: uuidv4 } = require('uuid');

const utilities = require('./utilities');
const models = require('../models');

models.sequelize.options.logging = false;

beforeEach(async () => {
  await utilities.clearDatabase();
});

async function createTestResource(overrides = {}) {
  const defaults = {
    title: uuidv4(),
    subtitle: 'test subtitle',
    grade: '5'
  };

  const resourceProperties = Object.assign({}, defaults, overrides);

  return await models.Resource.create(resourceProperties);
}

async function createTestPreferredResource(creatorUser) {
  return await createTestResource({
    users_id: creatorUser.id,
    curator_score: 95,
  });
}

async function createTestFeaturedResource(creatorUser) {
  return await createTestResource({
    users_id: creatorUser.id,
    curator_score: 85,
    created_at: DateTime.now().toUTC().minus({ days: 35 }).toISO(),
  });
}

async function createTestNewResource(creatorUser) {
  return await createTestResource({
    users_id: creatorUser.id,
    curator_score: 85,
    created_at: DateTime.now().toUTC().minus({ days: 5 }).toISO(),
  });
}

async function createTestResources(creatorUser) {
  let resourcePromises = [];
  for (let i = 0; i < 35; i++) {
    resourcePromises.push(createTestFeaturedResource(creatorUser));
  }
  for (let i = 0; i < 2; i++) {
    resourcePromises.push(createTestPreferredResource(creatorUser));
  }
  for (let i = 0; i < 4; i++) {
    resourcePromises.push(createTestNewResource(creatorUser));
  }
  await Promise.all(resourcePromises);
}

function getPageComposition(page) {
  const composition = {};
  for (const resource of page) {
    const classification = resource.getHomepageClassification();
    if (composition[classification] === undefined) {
      composition[classification] = 0;
    }
    composition[classification] += 1;
  }
  return composition;
}

test(`test home page composition`, async () => {
  const creatorUser = await utilities.createTestUser();

  await createTestResources(creatorUser);

  await models.Advertisement.fairCreate({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: "site",
    title: 'an ad!',
    subtitle: 'a subtitle!',
    users_id: creatorUser.id,
    spend_per_day: 1,
    start_date: DateTime.now().toUTC().toISO(),
    end_date  : DateTime.now().toUTC().toISO(),
    running_status: 'running',
  });

  const resourcesUsed = new Set();
  let resourceCount = 0;

  let seed = 1234;
  const pager = models.Resource.makePager();
  pager.setSeed(seed)

  const resourcesByPage = [];
  let pageOffset = 0;
  for (let page = 0; page < 4; page++) {
    pager.setPage(page);
    pager.setFeaturedOffset(pageOffset);

    let pageData = await pager.getPage();

    pageOffset = pageData.extraOffset;
    const pageResources = pageData.resources;
    resourcesByPage.push(pageResources);
    for (const resource of pageResources) {
      if (!resource.isAdvertisement() && resourcesUsed.has(resource.id)) {
        // verify that, over the entire course of pagination, NO entries are
        // repeated
        fail(`Resources should not appear more than once!`);
        return;
      }
      if (!resource.isAdvertisement()) {
        resourcesUsed.add(resource.id);
      }
      resourceCount += 1;
    }
  }

  // all resources were used
  expect(resourceCount).toEqual(45);

  // verify that pagination works as expected. as resources are exhausted, the
  // appropriate slots fill in the place of other slots that no longer have
  // enough materials-- "featured" entries should begin to take over
  expect(getPageComposition(resourcesByPage[0])).toEqual({
    ad        : 1,
    preferred : 1,
    new       : 3,
    featured  : 7,
  })

  expect(getPageComposition(resourcesByPage[1])).toEqual({
    ad        : 1,
    preferred : 1,
    new       : 1,
    featured  : 9,
  })

  expect(getPageComposition(resourcesByPage[2])).toEqual({
    ad        : 1,
    // preferred : 0,
    // new       : 0,
    featured  : 11,
  })

  expect(getPageComposition(resourcesByPage[3])).toEqual({
    ad        : 1,
    // preferred : 0,
    // new       : 0,
    featured  : 8,
  })

});

test(`ads should be turned off for donators`, async () => {
  const creatorUser = await utilities.createTestUser();
  const viewerUser  = await utilities.createTestUser();
  await createTestResources(creatorUser);

  await models.Advertisement.fairCreate({
    ad_type: models.Advertisement.AD_TYPE_1,
    placement: "site",
    title: 'an ad!',
    subtitle: 'a subtitle!',
    users_id: creatorUser.id,
    spend_per_day: 1,
    start_date: DateTime.now().toUTC().toISO(),
    end_date  : DateTime.now().toUTC().toISO(),
    running_status: 'running',
  });

  const pager = models.Resource.makePager();
  pager.setSeed(1234)
  pager.setPage(0);
  await pager.loadAdminPreferences();
  let pageData = await pager.getPage();

  // no donation
  expect(getPageComposition(pageData.resources)).toEqual({
    ad        : 1,
    preferred : 1,
    new       : 3,
    featured  : 7,
  });

  await models.User.update(
    { donation_date: DateTime.now().toUTC().minus({ days: 30 }).toISO() },
    { where: { id: viewerUser.id } }
  );
  await viewerUser.reload();

  pager.setAdsEnabled(await viewerUser.isRecentDonator());
  pageData = await pager.getPage();
  expect(getPageComposition(pageData.resources)).toEqual({
    // ad        : 0,
    preferred : 1,
    new       : 3,
    featured  : 8,
  });

  // verify that admin can adjust the admin score threshold for "Featured",
  // "New Featured", and "Preferred"
  await models.SiteSetting.set('homepage-composition', {
    ad        : 2,
    preferred : 2,
    new       : 2,
    featured  : 2,
  });

  await pager.loadAdminPreferences();
  pageData = await pager.getPage();
  expect(getPageComposition(pageData.resources)).toEqual({
    ad        : 2,
    preferred : 2,
    new       : 2,
    featured  : 2,
  });
});

async function createFullTestLibrary(count = 30) {
  const creatorUsers = await Promise.all([
    utilities.createTestUser(),
    utilities.createTestUser(),
    utilities.createTestUser(),
    utilities.createTestUser(),
  ]);

  const grades = ['p', 'k', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const subjectAreas = [
    'math', 'reading', 'social studies', 'history', 'music', 'art', 'games',
    'computers', 'logic', 'colors', 'animals', 'people', 'language', 'nature',
  ];

  const defaults = {
    title: uuidv4(),
    subtitle: 'test subtitle',
    grade: '5'
  };

  const testResources = [];
  for (let i = 0; i < count; i++) {
    const overrides = {
      users_id: creatorUsers[i % creatorUsers.length].id,
      grade: grades[i % grades.length],
      subject_area: subjectAreas[i % subjectAreas.length],
    };
    const resourceProperties = Object.assign({}, defaults, overrides);
    testResources.push(resourceProperties);
  }
  const resources = await models.Resource.bulkCreate(testResources);

  return {
    creatorUsers,
    resources,
  };
}

test(`test search: prioritize by number of downloads`, async() => {
  const { creatorUsers, resources } = await createFullTestLibrary();

  const searcherUser = await utilities.createTestUser();

  let searchResults;
  searchResults = await models.Resource.search('', searcherUser);
  let scoreSet;
  scoreSet = new Set(searchResults.map(result => result.dataValues.score));
  const firstResultBeforeDownload = searchResults[0].id;

  // all scores should be even, to start
  expect(scoreSet.size).toEqual(1);

  const resourceWithMoreDownloads = searchResults[1];
  await models.UserFavorite.create({
    users_id: (await utilities.createTestUser()).id,
    resources_id: resourceWithMoreDownloads.id,
  });

  searchResults = await models.Resource.search('', searcherUser);
  scoreSet = new Set(searchResults.map(result => result.dataValues.score));
  expect(scoreSet.size).toEqual(2);
  expect(searchResults[0].id).toEqual(resourceWithMoreDownloads.id);
  expect(searchResults[0].id).not.toEqual(firstResultBeforeDownload);
});

function indexByKey(objects, key) {
  const objectsByKey = {};
  for (const obj of objects) {
    if (objectsByKey[obj[key]] === undefined) {
      objectsByKey[obj[key]] = [];
    }
    objectsByKey[obj[key]].push(obj);
  }
  return objectsByKey;
}

test(`test search: prioritize by user download history`, async() => {
  const { creatorUsers, resources } = await createFullTestLibrary(70);

  //
  // by grade
  //
  let searcherUser = await utilities.createTestUser();

  let searchResults;
  searchResults = await models.Resource.search('', searcherUser);
  let gradeSet = new Set(searchResults.slice(0, 5).map(result => result.grade));

  // initially, the first five results will be composed of at least 2 different
  // grades
  expect(gradeSet.size).toBeGreaterThan(1);

  const resourcesByGrade = indexByKey(searchResults, 'grade');
  // "download" grade 5 materials for this user-- this will cause the grade 5
  // materials to be weighted more heavily during the next search
  await searcherUser.markDownload(resourcesByGrade['5'][0]);
  await searcherUser.markDownload(resourcesByGrade['5'][1]);
  searchResults = await models.Resource.search('', searcherUser);
  gradeSet = new Set(searchResults.slice(0, 5).map(result => result.grade));

  // now, the first five results will all be grade 5 material
  expect(gradeSet.size).toEqual(1);
  expect(searchResults[0].grade).toEqual('5');

  //
  // by subject
  //
  searcherUser = await utilities.createTestUser();
  searchResults = await models.Resource.search('', searcherUser);
  subjectSet = new Set(searchResults.slice(0, 5).map(result => result.subject_area));
  expect(subjectSet.size).toBeGreaterThan(1);

  const resourcesBySubject = indexByKey(searchResults, 'subject_area');
  await searcherUser.markDownload(resourcesBySubject['math'][0]);
  await searcherUser.markDownload(resourcesBySubject['math'][1]);
  searchResults = await models.Resource.search('', searcherUser);
  subjectSet = new Set(searchResults.slice(0, 5).map(result => result.subject_area));
  expect(subjectSet.size).toEqual(1);
  expect(searchResults[0].subject_area).toEqual('math');
});

test(`test search: prioritize by search terms`, async() => {
  const creatorUser = await utilities.createTestUser();

  const catTitle = await createTestResource({ title: 'cats', subtitle: 'dogs', description: 'bats', users_id: creatorUser.id });
  const dogTitle = await createTestResource({ title: 'dogs', subtitle: 'bats', description: 'cats', users_id: creatorUser.id });
  const batTitle = await createTestResource({ title: 'bats', subtitle: 'cats', description: 'dogs', users_id: creatorUser.id });

  let searcherUser = await utilities.createTestUser();
  // verify search terms are sorted based on relevance
  let searchResults;
  searchResults = await models.Resource.search('cats', searcherUser);
  // title is most important
  expect(searchResults[0].id).toEqual(catTitle.id);
  // subtitle is second most important
  expect(searchResults[1].id).toEqual(batTitle.id);
  // ...then description
  expect(searchResults[2].id).toEqual(dogTitle.id);

  searchResults = await models.Resource.search('dogs', searcherUser);
  expect(searchResults[0].id).toEqual(dogTitle.id);
});

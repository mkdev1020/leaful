
const { DateTime } = require('luxon');
const { QueryTypes } = require('sequelize');

const randomSequencer = require('../lib/randomSequencer');

module.exports = (sequelize) => {
  const Resource = require(__dirname + '/definitions/resources')(sequelize);

  const SiteSetting = require(__dirname + '/siteSetting')(sequelize);
  const Advertisement = require(__dirname + '/advertisement')(sequelize);

  Resource.FILTER_FOR_TYPE = {
    preferred: `
      \`curator_score\` >= 90
    `,
    featured: `
      \`created_at\` < (NOW() - INTERVAL 30 DAY)
      AND
      \`curator_score\` >= 80
      AND
      \`curator_score\` < 90
    `,
    new: `
      \`created_at\` >= (NOW() - INTERVAL 30 DAY)
      AND
      \`curator_score\` >= 80
      AND
      \`curator_score\` < 90
    `
  };

  Resource.prototype.getHomepageClassification = function() {
    const createdAt = DateTime.fromJSDate(this.created_at).toUTC();
    const resourceAgeDays = DateTime.now().toUTC().diff(createdAt).as('days');

    if (this.curator_score >= 90) {
      return 'preferred'
    }

    if (
      resourceAgeDays <= 30 &&
      this.curator_score >= 80 &&
      this.curator_score < 90
    ) {
      return 'new';
    }

    if (
      resourceAgeDays > 30 &&
      this.curator_score >= 80 &&
      this.curator_score < 90
    ) {
      return 'featured';
    }
  };

  Resource.prototype.isAdvertisement = function() {
    return false;
  };

  Resource.makePager = function() {
    return new ResourcePager();
  };

  Resource.countWithFilter = async function(filter) {
    const result = await sequelize.query(
      `
      SELECT IFNULL(COUNT(*), 0) AS \`total\`
      FROM \`resources\`
      WHERE ${filter}
      `,
      {
        type: QueryTypes.SELECT,
        plain: true,
      }
    );
    return result.total;
  };

  Resource.retrieveAtOffsets = async function(offsets, filter='1') {
    if (offsets.length < 1) {
      return [];
    }

    const selectQueries = [];
    for (const offset of offsets) {
      selectQueries.push(`(SELECT * FROM \`resources\` WHERE ${filter} LIMIT 1 OFFSET ${offset})`);
    }

    const fullQuery = selectQueries.join('\nUNION\n');

    return await sequelize.query(
      fullQuery,
      {
        model: Resource,
        mapToModel: true,
      }
    );
  };

  Resource.getAdResource = function(ad) {
    return {
      title: ad.title,
      subtitle: ad.subtitle,
      isAdvertisement() {
        return true;
      },
      getHomepageClassification() {
        return 'ad';
      },
    };
  };

  function getSqlInsertStringForWeights(table, weights) {
    const weightEntries = Object.entries(weights);
    if (weightEntries.length === 0) {
      return '';
    }

    let sqlWeights = `INSERT INTO ${table} (weight_key, weight) VALUES \n`;
    let sqlWeightInserts = [];
    for (const [key, weight] of weightEntries) {
      const normalizedWeight = Math.round(weight * 100);
      sqlWeightInserts.push(`('${key}', ${normalizedWeight})`);
    }
    sqlWeights += sqlWeightInserts.join(',\n') + ';';

    return sqlWeights;
  }

  Resource.search = async function(searchTerm, user, gradeFilter=null) {
    const userResourceWeights = await user.getResourcePreferenceWeights();

    const sqlGradeWeights   = getSqlInsertStringForWeights('tmp_grade_weights', userResourceWeights.gradeWeights);
    const sqlSubjectWeights = getSqlInsertStringForWeights('tmp_subject_weights', userResourceWeights.subjectWeights);

    let sqlGradeFilter = '';
    if (gradeFilter) {
      sqlGradeFilter = `SET @grade_filter := '${gradeFilter}';`;
    }

    const query = `
        DROP TEMPORARY TABLE IF EXISTS tmp_grade_weights;
        CREATE TEMPORARY TABLE tmp_grade_weights (
          weight_key VARCHAR(50) PRIMARY KEY,
          weight INT
        );

        ${sqlGradeWeights}

        DROP TEMPORARY TABLE IF EXISTS tmp_subject_weights;
        CREATE TEMPORARY TABLE tmp_subject_weights (
          weight_key VARCHAR(255) PRIMARY KEY,
          weight INT
        );

        ${sqlSubjectWeights}

        ${sqlGradeFilter}
        SET @search_term = :searchTerm COLLATE utf8mb4_unicode_ci;
        CALL search_resources();
    `;

    const results = await sequelize.query(
      query,
      {
        type: QueryTypes.SELECT,
        model: Resource,
        mapToModel: true,
        replacements: {
          searchTerm,
        },
      }
    );

    return results[results.length - 2];
  };

  class ResourcePager {

    constructor() {
      this.page = 0;
      this.seed = Math.random();
      this.featuredOffset = 0;
      this.user = null;

      this.batchForType = {
        ad: 1,
        new: 3,
        preferred: 1,
        featured: 7,
      };
    }

    get totalBatchSize() {
      return (
        this.batchForType.ad +
        this.batchForType.new +
        this.batchForType.preferred +
        this.batchForType.featured
      );
    }

    async loadAdminPreferences() {
      this.batchForType = await SiteSetting.getValueByName('homepage-composition', {
        ad: 1,
        new: 3,
        preferred: 1,
        featured: 7,
      });
    }

    setPage(page) {
      this.page = page;
    }

    setSeed(seed) {
      this.seed = seed;
    }

    setFeaturedOffset(offset) {
      this.featuredOffset = offset;
    }

    setAdsEnabled(enabled = true) {
      if (enabled) {
        this.batchForType.ad = 0;
        this.batchForType.featured = 8;
        return;
      }
      this.batchForType.ad = 1;
      this.batchForType.featured = 7;
    }

    async getPage() {
      const newResources       = await this.getNewResourcesForPage();
      const preferredResources = await this.getPreferredResourcesForPage();
      const featuredResources  = await this.getFeaturedResourcesForPage();
      const adResources        = await this.getAdResourcesForPage();

      const numNonFeatured = (
        newResources.length
        + preferredResources.length
        + adResources.length
      );
      const numFeatured = this.totalBatchSize - numNonFeatured;
      const extraOffset = Math.max(numFeatured - this.batchForType.featured, 0);

      const combinedResources = [].concat(
        adResources,
        newResources,
        preferredResources,
        featuredResources.slice(0, numFeatured)
      );

      return {
        resources: combinedResources,
        extraOffset: this.featuredOffset + extraOffset,
      };
    }

    async getNewResourcesForPage() {
      const batch = this.batchForType.new;

      const filter = Resource.FILTER_FOR_TYPE.new;
      return await sequelize.query(
        `
        SELECT * FROM \`resources\`
        WHERE ${filter}
        ORDER BY \`created_at\` DESC
        LIMIT :limit
        OFFSET :offset
        `,
        {
          model: Resource,
          mapToModel: true,
          replacements: {
            limit: batch,
            offset: this.page * batch,
          },
        }
      );
    }

    async getPreferredResourcesForPage () {
      let batch = this.batchForType.preferred;

      const seed = this.seed + 2;
      const sequencer = new randomSequencer();
      sequencer.initSeed(seed);

      const maxValue = await Resource.countWithFilter(Resource.FILTER_FOR_TYPE.preferred);
      batch = Math.min(batch, maxValue);

      const sequenceOffset = this.page * batch;
      if (sequenceOffset >= maxValue) {
        return [];
      }

      const offsets = sequencer.getSequenceWithoutRepeats(batch, maxValue, sequenceOffset);
      const resources = await Resource.retrieveAtOffsets(offsets, Resource.FILTER_FOR_TYPE.preferred);
      return resources;
    };

    async getFeaturedResourcesForPage () {
      let batch = this.batchForType.featured;

      const seed = this.seed + 1;
      const sequencer = new randomSequencer();
      sequencer.initSeed(seed);

      const maxValue = await Resource.countWithFilter(Resource.FILTER_FOR_TYPE.featured);
      batch = Math.min(batch, maxValue);

      let pagePeek = 0;
      let offsets = [];
      while (offsets.length < this.totalBatchSize) {
        sequencer.initSeed(seed);
        const sequenceOffset = (this.page + pagePeek) * batch + this.featuredOffset;
        if (sequenceOffset >= maxValue) {
          break;
        }
        const offsetsPeek = sequencer.getSequenceWithoutRepeats(batch, maxValue, sequenceOffset);
        if (offsetsPeek.length === 0) {
          break;
        }
        offsets = offsets.concat(offsetsPeek);
        pagePeek += 1;
      }

      const resources = await Resource.retrieveAtOffsets(offsets, Resource.FILTER_FOR_TYPE.featured);
      return resources;
    }

    async getAdResourcesForPage () {
      const adPromises = [];

      for (let i = 0; i < this.batchForType.ad; i++) {
        adPromises.push(Advertisement.chooseForUser(this.user));
      }

      const ads = await Promise.all(adPromises);

      const adResources = [];
      for (const ad of ads) {
        adResources.push(Resource.getAdResource(ad));
      }

      return adResources;
    }

  }

  return Resource;
}

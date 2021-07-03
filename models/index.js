
const configFile = process.env.NODE_ENV === 'test' ? 'config-test' : 'config';
const config = require(__dirname + `/../${configFile}`);

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  dialectOptions: {
    multipleStatements: true,
  },
  define: {
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
});
module.exports.sequelize = sequelize;

module.exports.User                     = require(__dirname + '/user')(sequelize);
module.exports.User2fa                  = require(__dirname + '/user2fa')(sequelize);
module.exports.UserFavorite             = require(__dirname + '/userFavorite')(sequelize);
module.exports.UserTransaction          = require(__dirname + '/userTransaction')(sequelize);
module.exports.UserFollowing            = require(__dirname + '/userFollowing')(sequelize);
module.exports.UserLoginToken           = require(__dirname + '/userLoginToken')(sequelize);
module.exports.UserIp                   = require(__dirname + '/userIp')(sequelize);
module.exports.Advertisement            = require(__dirname + '/advertisement')(sequelize);
module.exports.AdvertisementRecord      = require(__dirname + '/advertisementRecord')(sequelize);
module.exports.AdvertisementTargetGrade = require(__dirname + '/advertisementTargetGrade')(sequelize);
module.exports.Resource                 = require(__dirname + '/resource')(sequelize);
module.exports.ResourceDownload         = require(__dirname + '/resourceDownload')(sequelize);
module.exports.Referral                 = require(__dirname + '/referral')(sequelize);
module.exports.SiteBalance              = require(__dirname + '/siteBalance')(sequelize);
module.exports.SiteSetting              = require(__dirname + '/siteSetting')(sequelize);
module.exports.SiteStat                 = require(__dirname + '/siteStat')(sequelize);
module.exports.Donation                 = require(__dirname + '/donation')(sequelize);
module.exports.DonationOption           = require(__dirname + '/donationOption')(sequelize);
module.exports.CaptchaSolution          = require(__dirname + '/captchaSolution')(sequelize);
module.exports.CaptchaChallenge         = require(__dirname + '/captchaChallenge')(sequelize);
module.exports.TokenHeartbeat           = require(__dirname + '/tokenHeartbeat')(sequelize);
module.exports.EmailTemplate            = require(__dirname + '/emailTemplate')(sequelize);
module.exports.EmailScheduledSend       = require(__dirname + '/emailScheduledSend')(sequelize);
module.exports.EmailProxyThread         = require(__dirname + '/emailProxyThread')(sequelize);
module.exports.EmailOptOutLink          = require(__dirname + '/emailOptOutLink')(sequelize);
module.exports.ScheduledJob             = require(__dirname + '/scheduledJob')(sequelize);
module.exports.ScheduledJobLog          = require(__dirname + '/scheduledJobLog')(sequelize);
module.exports.PurgedAccount            = require(__dirname + '/purgedAccount')(sequelize);
module.exports.HelpCenterEntry          = require(__dirname + '/helpCenterEntry')(sequelize);

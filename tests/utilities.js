
const { Op } = require("sequelize");

const models = require('../models');
const { clearTestInbox } = require('../lib/mailer');

module.exports.createTestUser = async function (overrides = {}) {
  const rid = Math.random().toString().slice(2)
  return await models.User.create(Object.assign({}, {
    email: `test+${rid}@example.com`,
    first_name: 'john',
    last_name: 'doe',
    password_hash: 'xxxx',
    username: `example-user-${rid}`,
  }, overrides));
};

module.exports.clearDatabase = async function() {
  clearTestInbox();

  await models.SiteBalance.destroy({ where: {} });
  // await models.SiteSetting.destroy({ where: {} });
  await models.SiteStat.destroy({ where: {} });
  await models.SupportThreadMessage.destroy({ where: {} });

  await models.CaptchaChallenge.destroy({ where: {} });
  await models.HelpCenterEntry.destroy({ where: {} });

  await models.AdvertisementRecord.destroy({ where: {} });
  await models.AdvertisementTargetGrade.destroy({ where: {} });
  await models.Advertisement.destroy({ where: {} });

  await models.EmailTemplate.destroy({ where: {} });
  await models.EmailScheduledSend.destroy({ where: {} });
  await models.EmailProxyThread.destroy({ where: {} });
  await models.EmailOptOutLink.destroy({ where: {} });

  await models.ScheduledJobLog.destroy({ where: {} });
  await models.ScheduledJob.destroy({ where: {} });
  await models.PurgedAccount.destroy({ where: {} });

  await models.UserFavorite.destroy({ where: {} });

  await models.ResourceDownload.destroy({ where: {} });
  await models.ResourceFile.destroy({ where: {} });
  await models.ResourcePreview.destroy({ where: {} });
  await models.Resource.destroy({ where: {} });
  await models.Referral.destroy({ where: {} });

  await models.Donation.destroy({ where: {} });
  await models.DonationOption.destroy({ where: { is_default: 0 } });

  await models.TokenHeartbeat.destroy({ where: {} });
  await models.UserPermission.destroy({ where: {} });
  await models.UserLoginToken.destroy({ where: {} });
  await models.UserIp.destroy({ where: {} });
  await models.UserFollowing.destroy({ where: {} });
  await models.UserDonationOption.destroy({ where: {} });
  await models.User2fa.destroy({ where: {} });
  await models.UserTransaction.destroy({ where: {} });
  await models.User.destroy({
    where: {
      id: { [Op.not]: 1 }
    }
  });
};

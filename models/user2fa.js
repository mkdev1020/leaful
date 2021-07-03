
const bcrypt = require('bcrypt');
const { DateTime } = require('luxon');

const { PatternLock } = require('../lib/patternLock');

module.exports = (sequelize) => {
  const User2fa = require(__dirname + '/definitions/users_2fa')(sequelize);

  const EmailTemplate = require(__dirname + '/emailTemplate')(sequelize);

  User2fa.ACCESS_GRANTED = 'access_granted';
  User2fa.ACCESS_DENIED  = 'access_denied';
  User2fa.ACCESS_LOCKED  = 'access_locked';

  User2fa.STATE_UNLOCKED = 'unlocked';
  User2fa.STATE_LOCKED   = 'locked';

  User2fa.getNewSequence = function() {
    const patternLock = new PatternLock();
    patternLock.setGrid(5, 5);
    return patternLock.getRandomSequence();
  };

  User2fa.hashPassword = function(password) {
    return bcrypt.hashSync(password, 10);
  };

  User2fa.hashSequence = function(sequence) {
    return User2fa.hashPassword(User2fa.stringifySequence(sequence));
  };

  User2fa.stringifySequence = function(sequence) {
    const lock = new PatternLock();
    lock.setGrid(5, 5);
    return sequence.map(coord => lock.getCoordFriendlyIndex(coord)).join('-');
  };

  User2fa.prototype.isFresh = function() {
    if (this.state === User2fa.STATE_LOCKED) {
      return false;
    }

    const interval = this.getIntervalSinceLastVerification();
    if (!interval) {
      return false;
    }
    return interval.as('minutes') < 10;
  };

  User2fa.prototype.getIntervalSinceLastVerification = function() {
    if (!this.last_verification) {
      return null;
    }

    return DateTime.now().toUTC().diff(DateTime.fromJSDate(this.last_verification));
  };

  User2fa.prototype.notifyUserOfNewSequence = async function(sequence) {
    let email = EmailTemplate.newEmail();
    await email.setTemplate('admin-reset');
    email.setEmailAddress(this.email);
    email.setValues({
      password: User2fa.stringifySequence(sequence),
    });
    await email.send();

    if (!this.email_mobile) {
      return;
    }

    email = EmailTemplate.newEmail();
    await email.setTemplate('admin-reset-mobile');
    email.setEmailAddress(this.email_mobile);
    email.setValues({
      password: User2fa.stringifySequence(sequence),
    });
    await email.send()
  };

  User2fa.prototype.lock = async function() {
    const newSequence = User2fa.getNewSequence();
    const password       = User2fa.hashSequence(newSequence);
    const passwordUnlock = User2fa.hashSequence(newSequence.slice(0, 4));

    await this.notifyUserOfNewSequence(newSequence);

    await User2fa.update(
      {
        state: User2fa.STATE_LOCKED,
        password,
        password_unlock: passwordUnlock,
      },
      { where: { id: this.id } }
    );
  };

  User2fa.prototype.unlock = async function(unlockPassword) {
    if (!this.state === User2fa.STATE_UNLOCKED) {
      return false;
    }

    const valid = bcrypt.compareSync(unlockPassword, this.password_unlock);
    if (!valid) {
      console.log('BAD: BAD COMPARISON');
      return false;
    }

    await User2fa.update(
      {
        state: User2fa.STATE_UNLOCKED,
        recent_tries: 0,
      },
      { where: { id: this.id } }
    );

    return true;
  };

  User2fa.prototype.verify = async function(password) {
    if (this.state === User2fa.STATE_LOCKED) {
      return User2fa.ACCESS_LOCKED;
    }
    if (this.recent_tries >= 3) {
      await this.lock();
      return User2fa.ACCESS_LOCKED;
    }

    const valid = bcrypt.compareSync(password, this.password);

    const tries = valid ? 0 : this.recent_tries + 1;
    await User2fa.update(
      {
        last_verification: DateTime.now().toUTC().toISO(),
        recent_tries: tries,
      },
      { where: { id: this.id } }
    );

    return valid
      ? User2fa.ACCESS_GRANTED
      : User2fa.ACCESS_DENIED;
  };

  return User2fa;
}


const { DateTime } = require('luxon');

const throttlersForId = { };

module.exports.settings = {
  delayMultiplier: 30,
};

function clearThrottlerForId(id) {
  const throttler = throttlersForId[id];
  if (throttler === undefined) {
    return;
  }
  throttler.reset();
}
module.exports.clearThrottlerForId = clearThrottlerForId;

class Throttler {

  constructor() {
    this.lockOnMaxAttempts = false;
    this.numGraceAttempts = 3;
    this.maxAttempts = 5;
    this.init();
  }

  init() {
    this.lastFailedAttempt = null;
    this.numFailedAttempts = 0;
    this.locked = false;
  }

  reset() {
    this.init();
  }

  logFailedAttempt() {
    this.lastFailedAttempt = DateTime.now().toUTC();
    this.numFailedAttempts += 1;

    if (this.hasReachedMaxAttempts() && this.lockOnMaxAttempts) {
      this.lock();
    }
  }

  lock() {
    this.locked = true;
    this.onLockout();
  }

  onLockout() { }

  getMaxAttemptsCooldown() {
    if (this.isLocked()) {
      return null;
    }
    return this.lastFailedAttempt.plus({ hours: 12 });
  }

  isLocked() {
    return this.locked;
  }

  hasReachedMaxAttempts() {
    return (this.numFailedAttempts > (this.maxAttempts - 1));
  }

  getNextAttemptDate() {
    const graceCounter = this.numGraceAttempts - 1;

    if (this.numFailedAttempts < graceCounter) {
      return DateTime.now().toUTC();
    }

    if (this.hasReachedMaxAttempts()) {
      return this.getMaxAttemptsCooldown();
    }

    const delaySeconds = this.getDelayForPostGraceAttempts(this.numFailedAttempts - graceCounter);
    return this.lastFailedAttempt.plus({ seconds: delaySeconds });
  }

  getDelayForPostGraceAttempts(numTries) {
    return numTries * module.exports.settings.delayMultiplier;
  }

  getMillisecondsUntilNextAttempt() {
    const nextAttemptDate = this.getNextAttemptDate();
    return nextAttemptDate
      .diff(DateTime.now().toUTC())
      .as('milliseconds');
  }

  isReadyForNextAttempt() {
    if (this.isLocked()) {
      return false;
    }

    const millisecondsRemaining = this.getMillisecondsUntilNextAttempt();
    return millisecondsRemaining <= 0;
  }

}

function procureThrottler({ requesterId, ctx }) {
  if (throttlersForId[requesterId] === undefined) {
    throttlersForId[requesterId] = new Throttler();
  }
  return throttlersForId[requesterId];
}

// function procureLockoutThrottler(requesterId) {
//   if (throttlersForId[requesterId] === undefined) {
//     const throttler = new Throttler();
//     throttler.lockOnMaxAttempts = true;
//     throttlersForId[requesterId] = throttler;
//   }
//   return throttlersForId[requesterId];
// }

function throttler({ idFunction, procureThrottlerFunction }) {
  return async (ctx, next) => {
    //// XXX this would be used for throttling different routes for the same
    /// requester separately
    // const requestPath = ctx.request.path;
    // const requesterId = (idFunction(ctx) + '---' + requestPath);

    const requesterId = idFunction(ctx);
    const requesterThrottler = procureThrottlerFunction({ requesterId, ctx });

    const isReady = requesterThrottler.isReadyForNextAttempt();
    if (!isReady) {
      const isLocked = requesterThrottler.isLocked();
      const earliestRetry = requesterThrottler.getNextAttemptDate();

      ctx.status = 429;
      ctx.body = {
        earliestRetry,
        isLocked,
      };
      return;
    }

    await next();

    if (ctx.status >= 500 && ctx.status <= 599) {
      return;
    }

    // only log attempts that fail
    if (ctx.status >= 400 && ctx.status <= 499) {
      return requesterThrottler.logFailedAttempt();
    }

    // request was successful-- reset throttler
    requesterThrottler.reset();
  };
}
module.exports.throttler = throttler;

// anonymous user (ip):
//   - give 3 attempts "for free"
//   - 4th attempt: 30 second wait time
//   - 5th attempt: 60 second wait time
//     - if failed: locked for 12 hours
function ipThrottler() {
  return throttler({
    idFunction(ctx) {
      return ctx.ip;
    },
    procureThrottlerFunction: procureThrottler,
  });
}
module.exports.ipThrottler = ipThrottler;

// user specified:
//   - give 3 attempts "for free"
//   - 4th attempt: 30 second wait time
//   - 5th attempt: 60 second wait time
//     - if failed: locked permanently-- requires password email
function userIdThrottler() {
  return throttler({
    idFunction(ctx) {
      return ctx.user.id;
    },
    procureThrottlerFunction: ({ requesterId, ctx }) => {
      const throttler = procureThrottler({ requesterId, ctx });

      throttler.lockOnMaxAttempts = true;
      throttler.onLockout = function() {
        ctx.user.sendLoginLink();
      };

      return throttler;
    },
  });
}
module.exports.userIdThrottler = userIdThrottler;

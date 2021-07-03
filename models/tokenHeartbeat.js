
const crypto = require('crypto');

const { DateTime } = require('luxon');
const jwtDecode = require('jwt-decode');

module.exports = (sequelize) => {
  const TokenHeartbeat = require(__dirname + '/definitions/token_heartbeats')(sequelize);

  TokenHeartbeat.findByToken = async function(token) {
    const hash = TokenHeartbeat.getTokenHash(token);
    const heartbeat = await TokenHeartbeat.findOne({ where: { token_hash: hash } });

    return heartbeat;
  };

  TokenHeartbeat.getTokenHash = function(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  };

  TokenHeartbeat.getIntervalSinceLastHeartbeat = async function(token) {
    const heartbeat = await TokenHeartbeat.findByToken(token);
    if (!heartbeat) {
      return null;
    }
    return DateTime.now().toUTC().diff(DateTime.fromJSDate(heartbeat.last_heartbeat));
  };

  TokenHeartbeat.isFresh = async function(token) {
    const interval = await TokenHeartbeat.getIntervalSinceLastHeartbeat(token);
    if (!interval) {
      return false;
    }
    return interval.as('minutes') < 10;
  };

  TokenHeartbeat.refresh = async function(token) {
    const heartbeat = await TokenHeartbeat.findByToken(token);
    const newBeat = DateTime.now().toUTC().toISO();
    if (!heartbeat) {
      const hash = TokenHeartbeat.getTokenHash(token);
      const tokenObject = jwtDecode(token);
      return await TokenHeartbeat.create({
        users_id: tokenObject.sub,
        token_hash: hash,
        last_heartbeat: newBeat,
      });
    }

    return await TokenHeartbeat.update(
      { last_heartbeat: newBeat },
      { where: { id: heartbeat.id } }
    );
  };

  return TokenHeartbeat;
}

let config = require('../config/config.json');

const { blacklist, followBlacklist, likeBlacklist } = config.filter;

const BLACKLIST_TYPE = {
  ALL: 'ALL',
  FOLLOW: 'FOLLOW',
  LIKE: 'LIKE'
};

console.log('blacklist => ', blacklist);
console.log('followBlacklist => ', followBlacklist);
console.log('likeBlacklist => ', likeBlacklist);
console.log('----------------------------------\n\n');

function isNotAbleToFollow(list, username) {
  return list.some(blacklist => username.toLowerCase().includes(blacklist));
}

module.exports.type = BLACKLIST_TYPE;

module.exports.isBlacklisted = function(type, username) {
  if (type === BLACKLIST_TYPE.ALL) {
    return isNotAbleToFollow(blacklist, username);
  } else if (type == BLACKLIST_TYPE.FOLLOW) {
    return isNotAbleToFollow(followBlacklist, username);
  } else {
    return isNotAbleToFollow(likeBlacklist, username);
  }
};

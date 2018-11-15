const puppeteer = require('puppeteer');
const shuffle = require('shuffle-array');

let db = require('../src/pouchDB');
let config = require('../config/config.json');
const unfollowers = require('../src/Unfollowers');

const { type, isBlacklisted } = require('./FilterManager');
const driver = require('./InstagramDriver');

let run = async function() {
  // set up Puppeteer
  const page = await driver.createPage();

  // Load Instagram
  await driver.goToLoginPage(page);

  // Login
  await driver.login(page);

  // Loop through shuffled hashtags
  let hashtags = shuffle(config.hashtags);

  for (let hl = 0; hl < hashtags.length; hl++) {
    // Search for hashtags
    let currentTag = hashtags[hl];
    await driver.goToHashtagPage(page, currentTag);
    console.log('===> hashtag search: ' + hashtags[hl]);

    // Loop through the latest 9 posts
    for (let r = 1; r < 4; r++) {
      for (let c = 1; c < 4; c++) {
        //Try to select post, wait, if successful continue
        let br = false;
        await page
          .click(
            'section > main > article > div:nth-child(3) > div > div:nth-child(' +
              r +
              ') > div:nth-child(' +
              c +
              ') > a'
          )
          .catch(() => {
            br = true;
          });
        await page.waitFor(2250 + Math.floor(Math.random() * 250));
        if (br) continue;

        // Get post info
        let hasEmptyHeart = await page.$(config.selectors.post_heart_grey);
        let username = await driver.getUsername(page);
        let followStatus = await driver.getFollowStatus(page);

        console.log('---> Evaluate post from ' + username);

        let blacklisted = isBlacklisted(type.ALL, username);
        if (blacklisted) {
          console.log(`X-- ${username} blacklisted for ALL`);
          await driver.closePost(page);
          continue;
        }

        // Decide to like post

        // Check blacklist first
        let cannotLike = isBlacklisted(type.LIKE, username);
        if (cannotLike) {
          console.log(`X-- ${username} blacklisted for LIKE`);
        }

        if (
          !cannotLike &&
          hasEmptyHeart !== null &&
          Math.random() < config.settings.like_ratio
        ) {
          console.log('---> like for ' + username);
          await driver.likePost(page);
        }

        // Decide to follow user
        let isArchivedUser;
        await db
          .inArchive(username)
          .then(() => (isArchivedUser = true))
          .catch(() => (isArchivedUser = false));

        let cannotFollow = isBlacklisted(type.FOLLOW, username);
        if (cannotFollow) {
          console.log(`X-- ${username} is blacklisted for FOLLOW`);
        }

        if (
          followStatus === 'Follow' &&
          !isArchivedUser &&
          !cannotFollow &&
          Math.random() < config.settings.follow_ratio
        ) {
          await db
            .addFollow(username)
            .then(() => {
              return page.click(config.selectors.post_follow_link);
            })
            .then(() => {
              console.log('---> follow for ' + username);
              return page.waitFor(10000 + Math.floor(Math.random() * 5000));
            })
            .catch(() => {
              console.log('---> Already following ' + username);
            });
        }

        // Close post
        await driver.closePost(page);
      }
    }
  }

  // Unfollows
  if (config.settings.do_unfollows) {
    unfollowers.unfollow(true);
  }

  // Close browser
  browser.close();
};

module.exports = run;

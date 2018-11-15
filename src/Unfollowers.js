const puppeteer = require('puppeteer');

const driver = require('./InstagramDriver');
const db = require('./pouchDB');
const config = require('../config/config');
const colors = require('colors');

// Currently timed means it invoked after login
async function unfollow(timed) {
  const page = await driver.createPage();

  if (!timed) {
    // Load Instagram
    console.log(colors.green('Preparing…'));
    await driver.goToLoginPage(page);
    // Login
    console.log(colors.green('Logging in…'));
    await driver.login(page);
  }

  let cutoff =
    new Date().getTime() - config.settings.unfollow_after_days * 86400000;
  let follows = await db.getFollows();
  let unfollows = [];

  follows.rows.forEach(user => {
    let shouldAdd = !timed || user.doc.added < cutoff;
    if (shouldAdd) {
      unfollows.push(user.doc._id);
    }
  });

  for (let n = 0; n < unfollows.length; n++) {
    let user = unfollows[n];
    await driver.goToUserPage(page, user);
    await driver.unfollow(page, user);

    db.unFollow(user);

    console.log('---> unfollow ' + user);
    console.log('---> archive ' + user);
  }
}

exports.unfollow = unfollow;
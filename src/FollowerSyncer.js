const colors = require('colors');

const config = require('../config/config.json');
const driver = require('./InstagramDriver');
const db = require('./pouchDB');

exports.sync = async onlyFollow => {
  const { browser, page } = await driver.create({ width: 411, height: 731 });

  // Login
  console.log(colors.green('Loggin in…'));
  await driver.goToLoginPage(page);
  await driver.login(page);

  console.log(colors.green('Opening followers page…'));
  await driver.goToUserFollowersPage(page);

  // Collect usernames
  console.log(colors.green('Collecting usernames…'));
  await page.waitFor(5000);
  const usernames = await page.evaluate(
    ({ selector, onlyFollow }) => {
      let htmlCollections = document.getElementsByClassName(selector);
      let arr = Array.from(htmlCollections);
      let filtered = arr.filter(
        el => !onlyFollow || !el.innerText.includes('Following')
      );
      return filtered.map(el => el.innerText.trim().split('\n')[0]);
    },
    {
      selector: config.selectors.user_follower_list_div,
      onlyFollow: onlyFollow
    }
  );

  console.log('usernames to be synced', usernames, usernames.length);

  // Input usernames to DB
  console.log(colors.green('Saving data…'));
  await usernames.forEach(async value => {
    console.log('value', value);
    try {
      await db.addFollow(value);
    } catch (e) {
      if (config.debug) {
        console.log('error:', e);
      }
    }
  });

  await browser.close();
};

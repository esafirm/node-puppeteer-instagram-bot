const config = require('../config/config.json');
const driver = require('./InstagramDriver');
const db = require('./pouchDB');

exports.sync = async () => {
  const { browser, page } = await driver.create({ width: 411, height: 731 });

  // Login
  await driver.goToLoginPage(page);
  await driver.login(page);

  await driver.goToUserFollowersPage(page);

  await page.waitFor(2000);
  await page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.evaluate(selector => {
    console.log('selector: ', selector);
    console.log('evaluating...');
    let arr = Array.from(document.getElementsByClassName(selector));
    console.log('arr:', arr);
    let filtered = arr.filter(el => el.innerText.includes('Following'));
    console.log('arr filtered: ', filtered);
    let mapped = filtered.map(el => el.innerText.trim().split('\n')[0]);

    console.log('mapped size', mapped.length);
    mapped.forEach(async value => {
      console.log('value', value);
      await db.addFollow(value);
    });
  }, config.selectors.user_follower_list_div);

  // await browser.close();
};

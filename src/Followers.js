const driver = require('./InstagramDriver');
const db = require('./pouchDB');
const config = require('../config/config');
const colors = require('colors');

// Follow always create a new browser
// If [username] is provided, we will follow that particular username followers
// If not, we will follows the list of usernames in the DB

const follows = async username => {
  const { page, browser } = await driver.create({ width: 411, height: 731 });

  // Login
  console.log(colors.green('Loggin in…'));
  await driver.goToLoginPage(page);
  await driver.login(page);

  if (!username) {
    await followFromDb();
  } else {
    await followUsernameFollowers({
      page: page,
      username: username
    });
  }

  // await browser.close();
};

async function followFromDb(page) {
  console.log(colors.red('Still on development!'));
}

async function followUsernameFollowers({ page, username }) {
  await driver.goToUserPage(page, username);
  await driver.goToProfileFollowerPage(page);
  await page.waitFor(5000);

  await actualFollow(page);
}

async function actualFollow(page) {
  console.log(colors.green('Will follow now…'));
  const usernames = await page.evaluate(
    async ({ selector, blacklist }) => {
      let htmlCollections = document.getElementsByClassName(selector);
      let arr = Array.from(htmlCollections);

      console.log('arr', arr);
      let filtered = arr.filter(
        el =>
          !el.innerText.includes('Following') &&
          !el.innerText.includes('Requested')
      );

      console.log('filtered', filtered);
      let mapped = filtered
        .map(el => {
          return {
            username: el.innerText.trim().split('\n')[0],
            button: el.querySelector('button')
          };
        })
        .filter(({ username, _ }) => {
          return !username.toLowerCase().includes(blacklist);
        });

      console.log('User to follow:', mapped);

      await mapped.forEach(async ({ _, button }) => {
        try {
          await button.click();
        } catch (e) {
          console.log('Error on clicking follow button', e);
        }
        await new Promise(resolve => {
          setTimeout(resolve, Math.random() * 15000);
        });
      });

      return mapped.map(o => o.username);
    },
    {
      selector: config.selectors.user_follower_list_div,
      blacklist: config.filter.blacklist
    }
  );

  // After that, we put all the usernames to DB
  console.log(colors.green('Putting all usernames to DB…'));
  await usernames.forEach(async uname => {
    await db.addFollow(uname);
  });
}

exports.follows = follows;

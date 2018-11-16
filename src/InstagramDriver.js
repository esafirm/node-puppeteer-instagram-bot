const config = require('../config/config.json');

exports.create = async () => {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    headless: config.settings.headless,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  page.setViewport({ width: 1200, height: 764 });
  return { browser, page };
};

exports.goToLoginPage = async page => {
  // Load Instagram
  await page.goto('https://www.instagram.com');
  await page.waitFor(2500);
  await page.click(config.selectors.home_to_login_button);
  await page.waitFor(2500);
};

// Go to Hashtag page
exports.goToHashtagPage = async (page, hashtag) => {
  page.goto('https://www.instagram.com/explore/tags/' + hashtag + '/?hl=en');
};

exports.login = async page => {
  await page.click(config.selectors.username_field);
  await page.keyboard.type(config.username);
  await page.click(config.selectors.password_field);
  await page.keyboard.type(config.password);

  await page.click(config.selectors.login_button);
  await page.waitForNavigation();
};

exports.closePost = async page => {
  await page
    .click(config.selectors.post_close_button)
    .catch(() => console.log(':::> Error closing post'));
};

// Get username from user profile page
exports.getUsername = async page => {
  return await page.evaluate(x => {
    let element = document.querySelector(x);
    return Promise.resolve(element ? element.innerHTML : '');
  }, config.selectors.post_username);
};

// Get follow status from user profile
async function getFollowStatus(page) {
  return await page.evaluate(qSelector => {
    let element = document.querySelector(qSelector);
    return Promise.resolve(element ? element.innerHTML : '');
  }, config.selectors.post_follow_link);
}

exports.getFollowStatus = getFollowStatus;

// Like post
exports.likePost = async page => {
  await page.click(config.selectors.post_like_button);
  await page.waitFor(10000 + Math.floor(Math.random() * 5000));
};

// Go to Instagram user page
exports.goToUserPage = async (page, user) => {
  await page.goto('https://www.instagram.com/' + user + '/?hl=en');
  await page.waitFor(1500 + Math.floor(Math.random() * 500));
};

// Unfollow user and notify if we success
exports.unfollow = async page => {
  let followStatus = await getFollowStatus(page);

  if (followStatus === 'Following') {
    await page.click(config.selectors.user_unfollow_button);
    await page.waitFor(750);
    await page.click(config.selectors.user_unfollow_confirm_button);
    await page.waitFor(15000 + Math.floor(Math.random() * 5000));
    return true;
  } else {
    return false;
  }
};

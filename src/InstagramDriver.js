const config = require('../config/config.json');

exports.goToLoginPage = async page => {
  // Load Instagram
  await page.goto('https://www.instagram.com');
  await page.waitFor(2500);
  await page.click(config.selectors.home_to_login_button);
  await page.waitFor(2500);
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
exports.getFollowStatus = async page => {
  return await page.evaluate(x => {
    let element = document.querySelector(x);
    return Promise.resolve(element ? element.innerHTML : '');
  }, config.selectors.post_follow_link);
};

// Like post
exports.likePost = async page => {
  await page.click(config.selectors.post_like_button);
  await page.waitFor(10000 + Math.floor(Math.random() * 5000));
};

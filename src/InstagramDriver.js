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

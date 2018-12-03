#!/usr/bin/env node

const program = require('commander');
const colors = require('colors');
const config = require('./config/config');

const IS_DEBUG = config.debug;

if (IS_DEBUG) {
  program
    .command('deb')
    .option('-t, --type <type name>,', 'Debug type')
    .action(cmd => {
      if (!cmd.type) {
        console.log(colors.red('Wrong command'));
        return;
      }

      const actualName = cmd.type.trim().toLowerCase();
      console.log('Running debug command:', actualName);
      if (actualName == 'clear') {
        const db = require('./src/pouchDB');
        db.clearAll();
        console.log(colors.red('Data cleared!'));
      }
    });
}

program.command('follow <username>').action(username => {
  const followers = require('./src/Followers');
  followers.follows(username);
});

program.command('auto').action((dir, _) => {
  const bot = require('./src/puppeteer');
  const cnf = require('./config/config.json');

  bot();
  setInterval(bot, cnf.settings.run_every_x_hours * 3600000);
});

program
  .command('rm')
  .option('-r, --recursive', 'Remove recursively')
  .action(function(cmd) {
    console.log('cmd', cmd);
    console.log('remove ' + (cmd.recursive ? ' recursively' : ''));
  });

program
  .command('stat')
  .option('-d, --detail', 'Show stat detail')
  .action(async cmd => {
    let isDetail = cmd.detail;

    const db = require('./src/pouchDB');
    let docs = await db.getFollows();

    console.log('\n️ ➡ Follower registered: ', colors.green(docs.total_rows));

    if (isDetail) {
      console.log('\n');
      docs.rows.forEach((r, index) => {
        console.log(index + 1, r.id);
      });
    }

    docs = await db.getArchives();
    console.log('\n️ ➡ In Archives: ', colors.green(docs.total_rows));

    if (isDetail) {
      console.log('\n');
      docs.rows.forEach((r, index) => {
        console.log(index + 1, r.id);
      });
    }
  });

program
  .command('sync')
  .option('-of, --only-follow', 'Sync only user that not following you')
  .action(cmd => {
    const onlyFollow = cmd.onlyFollow || false;
    const syncer = require('./src/FollowerSyncer');
    syncer.sync(onlyFollow);
  });

program.command('unfollow').action((dir, _) => {
  const unfollowers = require('./src/Unfollowers');
  unfollowers.unfollow(false);
});

program.parse(process.argv);

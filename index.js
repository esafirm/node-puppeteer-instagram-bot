#!/usr/bin/env node

const program = require('commander');
const colors = require('colors');
const config = require('./config/config');

const IS_DEBUG = config.debug;

program.command('follow <username>').action((dir, _) => {
  console.log(dir);
  console.log('on development!');
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

program.command('sync').action(() => {
  const syncer = require('./src/FollowerSyncer');
  syncer.sync();
});

program.command('unfollow').action((dir, _) => {
  const unfollowers = require('./src/Unfollowers');
  unfollowers.unfollow(false);
});

if (IS_DEBUG) {
  program.command('debug [type]', 'Run debug command').action(name => {
    const actualName = name.trim().toLowerCase();
  });
}

program.parse(process.argv);

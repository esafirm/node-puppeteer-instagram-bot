#!/usr/bin/env node

const program = require('commander');
const colors = require('colors');

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
  .action(cmd => {
    const db = require('./src/pouchDB');
    db.getFollows().then(docs => {
      console.log('\n️ ➡ Follower registered: ', colors.green(docs.total_rows));

      let isDetail = cmd.detail;
      if (isDetail) {
        console.log('\n');
        docs.rows.forEach((r, index) => {
          console.log(index + 1, r.id);
        });
      }
    });
  });

program.command('sync').action(() => {});

program.command('unfollow').action((dir, _) => {
  const unfollowers = require('./src/Unfollowers');
  unfollowers.unfollow(false);
});

program.parse(process.argv);

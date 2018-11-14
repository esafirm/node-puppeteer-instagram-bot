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

program.command('stat').action((dir, _) => {
  const db = require('./src/pouchDB');
  db.getFollows().then(docs => {
    console.log('➡️  Follower registerd: ', colors.green(docs.total_rows));
  });
});

program.command('unfollow').action((dir, _) => {
  console.log(colors.red('on development!'));
});

program.parse(process.argv);

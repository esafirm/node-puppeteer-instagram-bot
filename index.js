const program = require('commander');

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

program.parse(process.argv);

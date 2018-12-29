const chalk = require('chalk');

const log = (msg='', options=null) => {
  let message;

  if (options && options.color) {
    switch (options.color.toUpperCase()) {
      case 'RED':
        message = chalk.red(msg);
        break;
      
      case 'GREEN':
        message = chalk.green(msg);
        break;

      default:
        message = msg;
    }
  } else if (options && options.bgColor) {
    switch (options.bgColor.toUpperCase()) {
      case 'RED':
        message = chalk.bgRed(msg);
        break;
      
      case 'GREEN':
        message = chalk.bgGreen(msg);
        break;

      default:
        message = msg;
    }
  } else {
    message = msg;
  }

  if (options && options.error) {
    console.error(message);
  } else {
    console.log(message);
  }
}

module.exports = log;
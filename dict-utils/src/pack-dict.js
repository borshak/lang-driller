// Imports
const os = require('os');
const fs = require('fs');
const log = require('./logger');
const arguments = require('./arguments');

if (!arguments.valid) {
  log(arguments.errorMsg);
  process.exit(1);
}

const csvFileName = arguments.frequencyList;
const dslFileName = arguments.dslDictionary;
const jsonFileName = arguments.targetFile;
const UTF8 = 'utf-8';

log();
log('Processing:');

const prepareCSV = async csvFileName => {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(csvFileName, UTF8, (error, data) => {
      if (error) {
        log(' ERROR ', {bgColor: 'red'});
        log(error, {error: true});
        process.exit(1);
      }
    
      const CSV_SEPARATOR = ';';
  
      const frequencyList = {};
      const splittedByLine = data.split(os.EOL);
  
      for (const line of splittedByLine) {
        const splittedLine = line.split(CSV_SEPARATOR);
        if (splittedLine.length == 2 && !isNaN(parseInt(splittedLine[0]))) {
          const phrase = splittedLine[1].trim();
          frequencyList[phrase] = parseInt(splittedLine[0]);
        }
      }

      log('CSV OK', {color: 'green'});
      resolve(frequencyList);
    });
  });

  return promise;
};

const main = async () => {
  const frequencyList = await prepareCSV(csvFileName);
  log(frequencyList);
};

main();

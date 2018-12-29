const minimist = require('minimist');
const args = minimist(process.argv.slice(2));

const scriptName = (() => {
  const path = require('path');
  const fullName = process.argv[1];
  const splitted = fullName.split(path.sep);
  return splitted[splitted.length - 1];
})();

const ERROR_MSG = `
(*) Wrong usage - seems like you miss some required arguments.

USAGE: ${scriptName} --frequencyList <list.csv> --dslDictionary <dict.dsl> --targetFile <file.json> [--threshold 5000]
 --frequencyList - path to file with frequency list in CSV format
 --dslDictionary - path to file with DSL dictionary
 --targetFile - path to JSON file that will be created
 --threshold [optional] limit of the words, that will be added to JSON from frequency list
`;

const isArgumentsValid = args => (
    args && args.frequencyList && typeof args.frequencyList === 'string'
    && args.dslDictionary && typeof args.dslDictionary === 'string'
    && args.targetFile && typeof args.targetFile === 'string'
);

const isThresholdSet = args => (
  args && args.threshold 
  && typeof args.threshold === 'number'
  && args.threshold > 0
);

let valid = false,
    errorMsg = null,
    frequencyList = null,
    dslDictionary = null,
    targetFile = null,
    threshold = null;

if (!isArgumentsValid(args)) {
  errorMsg = ERROR_MSG;
} else {
  valid = true;
  frequencyList = args.frequencyList;
  dslDictionary = args.dslDictionary;
  targetFile = args.targetFile;

  if (isThresholdSet(args)) {
    threshold = args.threshold;
  }
}

module.exports = {
  valid,
  errorMsg,
  frequencyList,
  dslDictionary,
  targetFile,
  threshold
}
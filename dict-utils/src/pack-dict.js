// Imports
const os = require('os');
const fs = require('fs');
const dslDicts = require('dsl-dicts');

// Local imports
const logger = require('./logger');
const arguments = require('./arguments');

const log = logger.log;
const UTF8 = 'utf-8';

const prepareCSV = csvFileName => {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(csvFileName, UTF8, (error, data) => {
      if (error) {
        log(' ERROR ', {bgColor: 'red'});
        log('Error in prepareCSV');
        log(error, {error: true});
        process.exit(1);
      }
    
      const CSV_SEPARATOR = ';';
  
      const frequencyList = {
        byName: {},
        byId: []
      };
      const splittedByLine = data.split(os.EOL);
  
      for (const line of splittedByLine) {
        const splittedLine = line.split(CSV_SEPARATOR);
        if (splittedLine.length == 2 && !isNaN(parseInt(splittedLine[0]))) {
          const phrase = splittedLine[1].trim();
          const id = parseInt(splittedLine[0]);
          frequencyList.byName[phrase] = id;
          frequencyList.byId.push({
            id,
            phrase
          });
        }
      }

      log('CSV ready', {color: 'green'});
      resolve(frequencyList);
    });
  });

  return promise;
};

const loadDSLDict = dslFileName => {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(dslFileName, UTF8, (error, data) => {
      if (error) {
        log(' ERROR ', {bgColor: 'red'});
        log('Error in loadDSLDict');
        log(error, {error: true});
        process.exit(1);
      }

      const dictionary = dslDicts.parse(data);
    
      log('DSL ready', {color: 'green'});
      resolve(dictionary);
    });
  });

  return promise;
};

const _prepareTempDict = (frequencyList, dslDictionary) => {

  const sourceLanguage = dslDictionary.meta.language.source;
  const targetLanguage = dslDictionary.meta.language.target;

  const extractImportance = (frequencyList, langEntity) => {
    const {phrase} = langEntity;
    if (frequencyList.byName[phrase]) {
      return frequencyList.byName[phrase];
    } else {
      return null;
    }
  };

  const isValidEntity = (frequencyList, langEntity, temporaryDict) => {
    const {phrase} = langEntity;
    const importance = extractImportance(frequencyList, langEntity);
    return importance !== null && !temporaryDict[importance] && langEntity.explanations.length;
  };

  const extractExamples = examples => {
    if (!examples || !examples.length) return null;

    const filteredExamples = examples.filter(example => example[sourceLanguage] && example[targetLanguage]);
    const convertedExamples = filteredExamples.map(example => ({
      source: example[sourceLanguage],
      target: example[targetLanguage]
    }));

    if (convertedExamples.length) return convertedExamples;
    else return null;
  };

  const prepareEntityBody = (langEntity, importance) => {
    const {phrase, transcription} = langEntity;
    const translations = langEntity.explanations[0].translations;
    const examples = extractExamples(langEntity.explanations[0].examples);

    const result = {
        phrase,
        importance,
        translations
    };

    if (transcription) result.transcription = transcription;
    if (examples) result.examples = examples;

    return result;
  };

  // Entry point
  const promise = new Promise(async (resolve, reject) => {
    const temporaryDict = {};
    const counter = {
      total: 0,
      hit: 0,
      miss: 0
    };

    log();
    log('Processing:');

    for (const langEntity of dslDictionary.phrase) {
      if (isValidEntity(frequencyList, langEntity, temporaryDict)) {
        const importance = extractImportance(frequencyList, langEntity);
        const phraseBody = prepareEntityBody(langEntity, importance);
        temporaryDict[importance] = phraseBody;

        counter.hit += 1;
      } else {
        counter.miss += 1;
      }
      counter.total += 1;
      logger.logProgress(`TOTAL: ${counter.total},  HIT: ${counter.hit},  MISS: ${counter.miss}`);
    }

    log(); // Drop logProgress
    log();

    resolve(temporaryDict);
  });
  return promise;
};

const _prepareResultDict = (frequencyList, temporaryDict, threshold) => {
  const promise =  new Promise((resolve, reject) => {
    const result = {};
    let counter = 0;

    for (const entity of frequencyList.byId) {
      if (entity.id in temporaryDict) {
        result[entity.phrase] = temporaryDict[entity.id];
        counter += 1;
        if (counter >= threshold) break;
      }
    }
    resolve(result);
  });
  return promise;
};

const mergeDicts = async (frequencyList, dslDictionary, threshold) => {
  const promise = new Promise(async (resolve, reject) => {
    const sourceLanguage = dslDictionary.meta.language.source;
    const targetLanguage = dslDictionary.meta.language.target;

    const temporaryDict = await _prepareTempDict(frequencyList, dslDictionary);
    const resultDict = await _prepareResultDict(frequencyList, temporaryDict, threshold);

    const resultObject = {
      meta: {
        language: {
          source: sourceLanguage,
          target: targetLanguage
        }
      },
      body: resultDict
    };

    log('DICTS merged', {color: 'green'});
    resolve(resultObject);
  });
  
  return promise;
};

const storeResult = (jsonFileName, json) => {
  const promise = new Promise((resolve, reject) => {
    fs.writeFile(jsonFileName, json, (error, result) => {
      if (error) {
        log(' ERROR ', {bgColor: 'red'});
        log('Error in storeResult');
        log(error, {error: true});
        process.exit(1);
      }

      log('JSON stored', {color: 'green'});
      resolve(true);
    });
  });

  return promise;
};

const main = async arguments => {
  if (!arguments.valid) {
    log(arguments.errorMsg);
    process.exit(1);
  }
  
  const csvFileName = arguments.frequencyList;
  const dslFileName = arguments.dslDictionary;
  const jsonFileName = arguments.targetFile;
  const threshold = arguments.threshold;

  log('--');

  const frequencyList = await prepareCSV(csvFileName); // CSV ready
  const dslDictionary = await loadDSLDict(dslFileName); // DSL ready
  const resultObject = await mergeDicts(frequencyList, dslDictionary, threshold); // DICTS merged
  const serializedJSON = JSON.stringify(resultObject);
  const jsonWritingResult = await storeResult(jsonFileName, serializedJSON);

  log(' DONE ', {bgColor: 'green'});
  log('--');
};

// Entry point
main(arguments);

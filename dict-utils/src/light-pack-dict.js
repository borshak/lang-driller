// Imports
const os = require('os');
const fs = require('fs');
const dslDicts = require('dsl-dicts');

// Local imports
const logger = require('./logger');
const arguments = require('./arguments');

const log = logger.log;
const UTF8 = 'utf-8';


// Load and parse CSV with frequency list
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


// Load DSL dictionary
const loadDSLDict = dslFileName => {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(dslFileName, 'utf16le', (error, data) => {
      if (error) {
        log(' ERROR ', {bgColor: 'red'});
        log('Error in loadDSLDict');
        log(error, {error: true});
        process.exit(1);
      }

      log('DSL loaded', {color: 'green'});
      resolve(data);
    });
  });

  return promise;
};


// Prepare DSL iterator
const prepareDSLDict = dslDictContent => {
  const promise = new Promise((resolve, reject) => {
    const dictionary = dslDicts.parse(dslDictContent);
    log('DSL iterator ready', {color: 'green'});
    resolve(dictionary);
  });

  return promise;
};


// Create temporary dictionary with entities that exist in both frequency list and DSL dict
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

    const trnanslation = translations[0];
    const example = examples && examples.length ? examples[0] : null;

    const result = {
        phr: phrase,
        imp: importance,
        trn: trnanslation
    };

    if (example) result.exm = {
      src: example.source,
      tgt: example.target 
    };

    return result;
  };

  const handleLangEntity = async (frequencyList, langEntity, temporaryDict) => {
    const promise = new Promise((resolve, reject) => {
      if (isValidEntity(frequencyList, langEntity, temporaryDict)) {
        const importance = extractImportance(frequencyList, langEntity);
        const body = prepareEntityBody(langEntity, importance);
        resolve({
          importance,
          body
        });
      } else {
        resolve(null);
      }  
    });
    return promise;
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
      const phrase = await handleLangEntity(frequencyList, langEntity, temporaryDict);
      if (phrase) {
        temporaryDict[phrase.importance] = phrase.body;
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


// Move prepeared entities from temporary dict to result due to frequency and threshold
const _prepareResultDict = (frequencyList, temporaryDict, threshold) => {
  const promise =  new Promise((resolve, reject) => {
    const result = {};
    let counter = 0;

    for (const entity of frequencyList.byId) {
      if (entity.id in temporaryDict) {
        result[entity.phrase] = temporaryDict[entity.id];
        counter += 1;
        if (threshold && counter >= threshold) break;
      }
    }
    resolve(result);
  });
  return promise;
};


// Do merge frequency list and DSL dictionary
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


// Store resulting data in file
const storeResult = (fileName, data) => {
  const promise = new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, (error, result) => {
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


// Main function
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
  const dslDictContent = await loadDSLDict(dslFileName); // DSL loaded
  const dslDictionary = await prepareDSLDict(dslDictContent); // DSL iterator ready
  const resultObject = await mergeDicts(frequencyList, dslDictionary, threshold); // DICTS merged
  
  const serializedJSON = JSON.stringify(resultObject);
  const jsonWritingResult = await storeResult(jsonFileName, serializedJSON);

  log(' DONE ', {bgColor: 'green'});
  log();
};

// Entry point
main(arguments);

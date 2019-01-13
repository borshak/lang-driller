// Imports
const os = require('os');
const fs = require('fs');
const dslDicts = require('dsl-dicts');

const UTF8 = 'utf-8';
const UTF16 = 'utf16le';

const log = console.log;

const isMaxAmountOfWordSet = function() {
  const maxAmount = parseInt(process.argv[4]);
  if (!isNaN(maxAmount) && maxAmount > 0) return true;
  return false;
};

const originJSONDict = process.argv[2];
const merdgeWithDSL = process.argv[3];
const maxAmountOfWords = isMaxAmountOfWordSet() ? parseInt(process.argv[4]) : Infinity;

if (!originJSONDict || !merdgeWithDSL) {
  console.log('Usage:');
  console.log('node merge-dicts.js <body.json> <dict.dsl> [50000]');
  process.exit(1);
}

// Load JSON dictionary
const loadJSONDict = jsonFileName => {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(jsonFileName, UTF8, (error, data) => {
      if (error) {
        log(' ERROR ');
        log('Error in loadJSONDict');
        log(error);
        process.exit(1);
      }

      log('JSON loaded');
      resolve(data);
    });
  });

  return promise;
};

// Load DSL dictionary
const loadDSLDict = dslFileName => {
  const promise = new Promise((resolve, reject) => {
    fs.readFile(dslFileName, UTF16, (error, data) => {
      if (error) {
        log(' ERROR ');
        log('Error in loadDSLDict');
        log(error);
        process.exit(1);
      }

      log('DSL loaded');
      resolve(data);
    });
  });

  return promise;
};


// Prepare DSL iterator
const prepareDSLDict = dslDictContent => {
  const promise = new Promise((resolve, reject) => {
    const dictionary = dslDicts.parse(dslDictContent);
    log('DSL iterator ready');
    resolve(dictionary);
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

const _isEntityAlreadyExist = (dict, word) => {
  return word.trim() in dict;
};

const _isValidEntity = (langEntity) => {
  const isLooksSuspicious = translation => {
    const result = ~translation.indexOf('[') || ~translation.indexOf(']');
    return result;
  };

  const {phrase} = langEntity;

  return langEntity.explanations.length
  && langEntity.explanations[0].translations
  && !isLooksSuspicious(langEntity.explanations[0].translations[0])
  && (/^[a-z]*$/.test(phrase));
};

const _preparePhraseBody = (langEntity, sourceLanguage, targetLanguage) => {
  const _extractExamples = (examples, sourceLanguage, targetLanguage) => {
    if (!examples || !examples.length) return null;

    const filteredExamples = examples.filter(example => example[sourceLanguage] && example[targetLanguage]);
    const convertedExamples = filteredExamples.map(example => ({
      source: example[sourceLanguage],
      target: example[targetLanguage]
    }));

    if (convertedExamples.length) return convertedExamples;
    else return null;
  };

  const {phrase, transcription} = langEntity;
  const translations = langEntity.explanations[0].translations;
  const examples = _extractExamples(langEntity.explanations[0].examples, sourceLanguage, targetLanguage);

  const trnanslation = translations[0];
  const example = examples && examples.length ? examples[0] : null;

  const result = {
      phr: phrase,
      trn: trnanslation
  };

  if (example) result.exm = {
    src: example.source,
    tgt: example.target 
  };

  return result;
};


// Do merge frequency list and DSL dictionary
const mergeDicts = async (jsonDict, dslDict, maxAmountOfWords) => {
  const promise = new Promise(async (resolve, reject) => {
    const currentAmountOfWords = Object.keys(jsonDict).length;

    const sourceLanguage = dslDict.meta.language.source;
    const targetLanguage = dslDict.meta.language.target;

    let counter = currentAmountOfWords;
    let processed = 0;

    for (const langEntity of dslDict.phrase) {
      // console.log(langEntity);
      if (!_isEntityAlreadyExist(jsonDict, langEntity.phrase)
        && _isValidEntity(langEntity)) {
          const phrase = langEntity.phrase.trim();
          const phraseBody = _preparePhraseBody(langEntity, sourceLanguage, targetLanguage);
          jsonDict[phrase] = phraseBody;

          // console.log('***');
          // console.log(phrase);
          // console.log(phraseBody);

          counter++;
          processed++;
        }

        // if (maxAmountOfWords && counter > maxAmountOfWords) break;
        if (maxAmountOfWords && processed > maxAmountOfWords) break;
    }

    console.log('PROCESSED WORDS:', processed);

    const resultObject = jsonDict;

    log('DICTS merged');
    resolve(resultObject);
  });
  
  return promise;
};



// Main function
const main = async () => {
  log('--');

  const jsonFile = await loadJSONDict(originJSONDict);
  const originDictBody = JSON.parse(jsonFile);

  const dslDictContent = await loadDSLDict(merdgeWithDSL); // DSL loaded
  const dslDictionary = await prepareDSLDict(dslDictContent); // DSL iterator ready
  
  const resultObject = await mergeDicts(originDictBody, dslDictionary, maxAmountOfWords); // DICTS merged

  const serializedJSON = JSON.stringify(resultObject);
  const jsonWritingResult = await storeResult(`${originJSONDict}.result`, serializedJSON);

  log(' DONE ');
  log();
};

// Entry point
main();
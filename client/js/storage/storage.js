const storage = (function() {
  
  let DICTIONARY = {};
  
  const REQUEST_ORIGIN = Object.freeze({
    SYSTEM: 'SYSTEM',
    USER: 'USER',
    DRILLER: 'DRILLER'
  });

  // TODO: refactor this
  const loadDictionary = () => {
    const promise = new Promise(function(resolve, reject) {
      fetch('./js/storage/dict.json')
      .then(response => {
          if (!response.ok) {
            reject(new Error("HTTP error " + response.status));
              // throw new Error("HTTP error " + response.status);
          }
          return response.json();
      })
      .then(dictJson => {
        if (dictJson && dictJson.body) {
          DICTIONARY = dictJson.body;
          resolve(true);
        } else {
          reject(new Error("Wrond dictionary format - can't find 'body'"));
        }
      })
      .catch(function (error) {
          reject(error);
          // this.dataError = true;
      });
    });
    return promise;
 };

  const requestsMap = Object.create(null);

  const logRequest = function(phrase, requestOrigin) {
    if (requestsMap[phrase]) {
      if (requestsMap[phrase][requestOrigin]) {
        requestsMap[phrase][requestOrigin] += 1; 
      } else {
        requestsMap[phrase][requestOrigin] = 1;
      }
    } else {
      requestsMap[phrase] = {};
      requestsMap[phrase][requestOrigin] = 1;
    }
  }

  const getStats = function() {
    return requestsMap;
  };

  const getLangEntity = function(phrase, requestOrigin) {
    if (~[REQUEST_ORIGIN.USER, REQUEST_ORIGIN.DRILLER].indexOf(requestOrigin)) {
      logRequest(phrase, requestOrigin);
    }

    return new Promise(function(resolve, reject) {
      if (DICTIONARY[phrase]) {
        resolve(DICTIONARY[phrase]);
      } else {
        resolve(null);
      }
    });
  };


  // Entry point
const isReadyPromise = loadDictionary();

  return {
    getLangEntity,
    getStats,
    isReadyPromise
  };
})();

// TODO: remove this
window.storage = storage;

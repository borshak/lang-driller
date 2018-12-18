const storage = (function() {
  const REQUEST_ORIGIN = Object.freeze({
    SYSTEM: 'SYSTEM',
    USER: 'USER',
    DRILLER: 'DRILLER'
  });

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

  return {
    getLangEntity,
    getStats
  };
})();

// TODO: remove this
window.storage = storage;

var DICTIONARY = {
  tree: {
    phrase: 'tree',
    translation: 'дерево',
    examples: ['This tree is very big.']
  },
  are: {
    phrase: 'are',
    translation: 'быть, существовать',
    examples: ['We are.', 'You are good man.']
  },
  data: {
    phrase: 'data',
    translation: 'данные',
    examples: ['Those data are very important.']
  },
  used: {
    phrase: 'used',
    translation: 'использованный',
    examples: []
  },
  structure: {
    phrase: 'structure',
    translation: 'структура',
    examples: ['The structure of this data is unclear.']
  },
  nonlinear: {
    phrase: 'nonlinear',
    translation: 'нелинейный',
    examples: ['The list data structure is nonlinear one.']
  },
  binary: {
    phrase: 'binary',
    translation: 'двоичный',
    examples: ['Binary tree is data structure often used in computer science.']
  }
};
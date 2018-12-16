const storage = (function() {
  const REQUEST_ORIGIN = Object.freeze({
    SYSTEM: 'SYSTEM',
    USER: 'USER'
  });

  const requestsMap = {};

  const logRequest = function(phrase) {
    if (requestsMap.phrase) {
      requestsMap[phrase] += 1;
    } else {
      requestsMap[phrase] = 1;
    }
  }

  const getLangEntity = function(phrase, requestOrigin) {
    if (requestOrigin === REQUEST_ORIGIN.USER) {
      logRequest(phrase);
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
    getLangEntity
  };
})();

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
  }
};
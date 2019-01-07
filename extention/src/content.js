// Language module
const languageModule = (function() {

  const DICTIONARY = {
    "be": {
      "exm": {
        "src": "I think, therefore I am.",
        "tgt": "Я мыслю, следовательно, существую."
      },
      "imp": 2,
      "phr": "be",
      "trn": "быть; быть живым, жить; существовать"
    },
    "company": {
      "exm": {
        "src": "to keep bad company",
        "tgt": "встречаться, водиться с плохими людьми, вращаться в дурной компании"
      },
      "imp": 10,
      "phr": "company",
      "trn": "общество, компания"
    },
    "henceforth": {
      "imp": 14,
      "phr": "henceforth",
      "trn": "с этого времени, впредь"
    },
    "henceforward": {
      "imp": 15,
      "phr": "henceforward",
      "trn": "впредь, отныне"
    },
    "learn": {
      "exm": {
        "src": "to learn French",
        "tgt": "учить французский язык"
      },
      "imp": 6,
      "phr": "learn",
      "trn": "учиться; учить (что-л.); научиться (чему-л.)"
    },
    "running": {
      "exm": {
        "src": "to make good one's running",
        "tgt": "не отставать; преуспевать"
      },
      "imp": 8,
      "phr": "running",
      "trn": "беганье, беготня"
    },
    "she": {
      "exm": {
        "src": "She was my mother, after all.",
        "tgt": "В конце концов, она была моей матерью."
      },
      "imp": 3,
      "phr": "she",
      "trn": "она"
    },
    "spelling": {
      "exm": {
        "src": "alternative / variant spelling of a word",
        "tgt": "вариант написания слова"
      },
      "imp": 12,
      "phr": "spelling",
      "trn": "орфография, правописание"
    },
    "that": {
      "exm": {
        "src": "that woman",
        "tgt": "та женщина"
      },
      "imp": 5,
      "phr": "that",
      "trn": "тот, та, то (иногда этот, эта, этот)"
    },
    "the": {
      "exm": {
        "src": "the door of the room",
        "tgt": "дверь (этой) комнаты"
      },
      "imp": 1,
      "phr": "the",
      "trn": "(определённый артикль)"
    },
    "word": {
      "exm": {
        "src": "archaic / obsolete words",
        "tgt": "устаревшие слова"
      },
      "imp": 4,
      "phr": "word",
      "trn": "слово"
    },
    "would": {
      "exm": {
        "src": "He told us he would come.",
        "tgt": "Он сказал нам, что придёт."
      },
      "imp": 7,
      "phr": "would",
      "trn": "вспомогательный глагол; используется для образования будущего в прошедшем во 2 и 3 лице"
    }

  };

  const getLangEntity = function(rawPhrase) {
    const phrase = rawPhrase.length ? rawPhrase : '';

    return new Promise(function(resolve, reject) {
      if (DICTIONARY[phrase]) {
        resolve(DICTIONARY[phrase]);
      } else {
        resolve(null);
      }
    });
  };

  return {
    getLangEntity: getLangEntity
  }
})();


// View module
const viewModule = (function() {
  // Add tooltip to DOM on init
  const tooltipCssClass = 'lang-driller-tooltip';
  const hiddenCssClass = 'hidden';
  const tooltipContainer = document.createElement("div");
  tooltipContainer.classList.add(tooltipCssClass, hiddenCssClass);
  document.body.appendChild(tooltipContainer);

  // Add bubble to DOM on init
  const bubbleDOM = document.createElement('div');
  bubbleDOM.setAttribute('class', 'lang-driller-selection-bubble');
  document.body.appendChild(bubbleDOM);


  const showTooltip = function(langEntity) {
    const phrase = `<p class="phrase">${langEntity.phr}</p>`;
    const translation = `<p class="translation">${langEntity.trn}</p>`;
    const example = langEntity.exm ? `<p class="example">${langEntity.exm.src} — ${langEntity.exm.tgt}</p>` : '';
    
    const layout = `
    ${phrase}
    ${translation}
    ${example}
    <i></i>
  `;
    tooltipContainer.innerHTML = layout;
    tooltipContainer.classList.remove(hiddenCssClass);
  };
  
  const showBubble = function(x, y, selectedText, langEntity) {
    bubbleDOM.innerHTML = selectedText;
    bubbleDOM.style.top = x + 'px';
    bubbleDOM.style.left = y + 'px';
    bubbleDOM.style.visibility = 'visible';

    if (langEntity) {
      bubbleDOM.classList.remove('missing');
    } else {
      bubbleDOM.classList.add('missing');
    }
  };

  const showTranslation = function(selectionPosition, selectedText, langEntity) {
    const OFFSET = 15;
    const {x, y} = selectionPosition;

    showBubble(x + OFFSET, y + OFFSET, selectedText, langEntity);
    if (langEntity) showTooltip(langEntity);
  };

  const hideTooltip = function() {
    tooltipContainer.classList.add(hiddenCssClass);
  };

  const hideBubble = function() {
    bubbleDOM.style.visibility = 'hidden';
  };

  const hideTranslation = function() {
    hideTooltip();
    hideBubble();
  };

  return {
    showTranslation,
    hideTranslation,
  };
})();


// Controller
const controller = (function() {
  // Predicate, returns true if some text selected
  // const isSomethingSelected = function(selection) {
  //   return (selection 
  //     && selection.toString
  //     && typeof selection.toString === 'function'
  //     && selection.toString().trim());
  // };

  const getTextOfSelection = function(selection) {
    return selection.toString().trim().toLowerCase();
  };

  const getPositionOfSelection = function(selection) {
    const oRange = selection.getRangeAt(0);
    const oRect = oRange.getBoundingClientRect();
    return {
      x: oRect.y,
      y: oRect.x
    };
  };


  const enableTranslation = function(event) {
    const selection = window.getSelection();
    const selectedText = getTextOfSelection(selection);

    if (selectedText) {
      const position = getPositionOfSelection(selection);
      // const oRange = selection.getRangeAt(0); //get the text range
      // const oRect = oRange.getBoundingClientRect();
      console.log('position ->', position);

      languageModule.getLangEntity(selectedText)
        .then(function(langEntity) {
        console.log('LE =>', langEntity);      
        viewModule.showTranslation(position, selectedText, langEntity);
      });
    }
  };

  const disableTranslation = function(event) {
    viewModule.hideTranslation();
  };

  const init = function() {
    document.addEventListener('mouseup', enableTranslation, false);
    document.addEventListener('mousedown', disableTranslation, false);
  };

  return {
    init
  };

})();


// Entry point
controller.init();

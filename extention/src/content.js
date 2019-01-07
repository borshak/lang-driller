const storage = (function() {

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


// Add tooltip
const tooltipCssClass = 'lang-driller-tooltip';
const hiddenCssClass = 'hidden';
const tooltipContainer = document.createElement("div");
tooltipContainer.classList.add(tooltipCssClass, hiddenCssClass);
document.body.appendChild(tooltipContainer);

function showTooltip(langEntity) {
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
}

function hideTooltip() {
  tooltipContainer.classList.add(hiddenCssClass);
}


const isSomethingSelected = function(selection) {
  if (typeof selection === 'string'
    && selection.trim()) {
      return true;
    }

    return false;
}


// Add bubble to the top of the page.
var bubbleDOM = document.createElement('div');
bubbleDOM.setAttribute('class', 'selection_bubble');
document.body.appendChild(bubbleDOM);

// Lets listen to mouseup DOM events.
document.addEventListener('mouseup', function (e) {
  var selection = window.getSelection().toString();
  if (isSomethingSelected(selection)) {

    const oRange = window.getSelection().getRangeAt(0); //get the text range
    const oRect = oRange.getBoundingClientRect();
    console.log('->', oRect);

    const selected = selection.trim().toLowerCase();
    storage.getLangEntity(selected)
      .then(function(langEntity) {
      console.log('LE =>', langEntity);
      renderBubble(e.clientX, e.clientY, selected, langEntity);
    });
  }
}, false);


// Close the bubble when we click on the screen.
document.addEventListener('mousedown', function (e) {
  bubbleDOM.style.visibility = 'hidden';
  hideTooltip();
}, false);

// Move that bubble to the appropriate location.
function renderBubble(mouseX, mouseY, selection, langEntity) {
  bubbleDOM.innerHTML = selection;
  bubbleDOM.style.top = mouseY + 'px';
  bubbleDOM.style.left = mouseX + 'px';
  bubbleDOM.style.visibility = 'visible';

  if (langEntity) {
    bubbleDOM.classList.remove('missing');
    showTooltip(langEntity);
  } else {
    bubbleDOM.classList.add('missing');
  }
}
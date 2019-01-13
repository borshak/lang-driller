class LangEntity {
  constructor(rawEntity) {
    if (!rawEntity
      || !rawEntity.phr
      || !rawEntity.trn
      || !rawEntity.precision) {
      throw new Error('Wrong data for LangEntity constructor.');
    }

    this.phrase = rawEntity.phr;
    this.translation = rawEntity.trn;
    this.example = this._unpackExample(rawEntity.exm);

    // Additional parameters
    this.precision = rawEntity.precision || 0;
  }

  _unpackExample(example) {
    if (!example
      || !example.src
      || !example.tgt) return null;

    return {
      source: example.src,
      target: example.tgt
    };
  }

  isExampleExist() {
    return !!this.example;
  }

  isExactMatchOriginRequest() {
    return this.precision === 1;
  }

  getPhrase() {
    return this.phrase;
  }

  getTranslation() {
    return this.translation;
  }

  getExampleSource() {
    return this.example.source;
  }

  getExampleTarget() {
    return this.example.target;
  }

}


// Language module
const languageModule = (function() {

  const isPlural = function(phrase) {
    return phrase.endsWith('s') || phrase.endsWith('\'s');
  };

  const removePlural = function(phrase) {
    if (phrase.endsWith('\'s')) return phrase.substring(0, phrase.length - 2);
    else if (phrase.endsWith('s')) return phrase.substring(0, phrase.length - 1);
    else return phrase;
  };

  const getLangEntity = function(rawPhrase) {
    const phrase = rawPhrase.length ? rawPhrase : '';

    return new Promise(function(resolve, reject) {
      if (DICTIONARY[phrase]) {
        const langEntity = new LangEntity({
          ...DICTIONARY[phrase],
          precision: 1
        });
        resolve(langEntity);
      } else if (isPlural(phrase) && DICTIONARY[removePlural(phrase)]) {
        const langEntity = new LangEntity({
          ...DICTIONARY[removePlural(phrase)],
          precision: 0.75
        });
        resolve(langEntity);
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
  const speechCssClass = 'speaker-icon';
  const actualPhraseCssClass = 'actual-phrase';

  // Check Speech API presence
  const isSpeechApiAvailable = window
    &&  window.speechSynthesis
    && window.speechSynthesis.speak
    && typeof window.speechSynthesis.speak === 'function';

  const addSpeakerClickHandler = function() {
    tooltipContainer.addEventListener('click', function(event) {
      if (isSpeechApiAvailable) {
        const speakerNode = tooltipContainer.getElementsByClassName(speechCssClass)[0];
        if (event.target === speakerNode) {
          const phraseContainer = tooltipContainer.getElementsByClassName(actualPhraseCssClass);
          if (phraseContainer) {
            const phrase = phraseContainer[0].innerText;
            const utterThis = new SpeechSynthesisUtterance(phrase);
            window.speechSynthesis.speak(utterThis);
          }
        }
      }
    });
  };

  // Add tooltip to DOM on init
  const tooltipCssClass = 'lang-driller-tooltip';
  const hiddenCssClass = 'hidden';
  const tooltipContainer = document.createElement("div");
  tooltipContainer.classList.add(tooltipCssClass, hiddenCssClass);
  addSpeakerClickHandler();
  document.body.appendChild(tooltipContainer);

  // Add bubble to DOM on init
  const bubbleContainer = document.createElement('div');
  bubbleContainer.setAttribute('class', 'lang-driller-selection-bubble');
  document.body.appendChild(bubbleContainer);

  const showTooltip = function(langEntity) {
    const inaccuracyMarker = !langEntity.isExactMatchOriginRequest() ? '<span class="inaccuracy-marker">~</span>' : '';
    const speakerIcon = isSpeechApiAvailable ? `<span class="${speechCssClass}">&#x1f509</span>` : '';
    const actualPhrase = `<span class="${actualPhraseCssClass}">${langEntity.getPhrase()}</span>`;
    const phrase = `<p class="phrase">${inaccuracyMarker}${actualPhrase}${speakerIcon}</p>`;
    const translation = `<p class="translation">${langEntity.getTranslation()}</p>`;
    const example = langEntity.isExampleExist() ? `<p class="example">${langEntity.getExampleSource()} — ${langEntity.getExampleTarget()}</p>` : '';
    
    const layout = `
    ${phrase}
    ${translation}
    ${example}
    <i class="tooltip-pointer"></i>
  `;
    tooltipContainer.innerHTML = layout;
    tooltipContainer.classList.remove(hiddenCssClass);
  };

  const alignTooltip = function() {
    const pointToTop = function() {
      tooltipContainer.classList.remove('point-to-bottom');
      tooltipContainer.classList.add('point-to-top');
    };

    const pointToBottom = function() {
      tooltipContainer.classList.remove('point-to-top');
      tooltipContainer.classList.add('point-to-bottom');
    };

    const OFFSET = 16;

    const bubbleGeometry = bubbleContainer.getBoundingClientRect();
    const tooltipGeometry = tooltipContainer.getBoundingClientRect();

    let tooltipTopPosition = bubbleGeometry.top + window.pageYOffset - OFFSET - tooltipContainer.offsetHeight;

    if (tooltipTopPosition >= 0) {
      tooltipContainer.style.top = tooltipTopPosition + 'px';
      pointToBottom();
    } else {
      tooltipTopPosition = bubbleGeometry.top + window.pageYOffset + OFFSET + bubbleContainer.offsetHeight;
      tooltipContainer.style.top = tooltipTopPosition + 'px';
      pointToTop();
    }

    let tooltipLeftPosition = (bubbleGeometry.left + bubbleGeometry.width / 2) - (tooltipContainer.offsetWidth / 2);

    const MIN_X_OFFSET = 6;
    if (tooltipLeftPosition < MIN_X_OFFSET) {
      const xDelta = Math.abs(tooltipLeftPosition) + MIN_X_OFFSET;
      tooltipLeftPosition += xDelta;
      tooltipContainer.style.left = tooltipLeftPosition + 'px';

      // Align pointer
      const MIN_LEFT_POSITION = 24;
      const tooltipPointer = tooltipContainer.getElementsByClassName('tooltip-pointer')[0];
      const pointerGeometry = tooltipPointer.getBoundingClientRect();
      let pointerLeftPosition = bubbleGeometry.left + (bubbleGeometry.width / 2) - (pointerGeometry.width / 4); // we divide to 4 but not to 2 due to some weirg margin in css
      if (pointerLeftPosition < MIN_LEFT_POSITION) pointerLeftPosition = MIN_LEFT_POSITION;
      tooltipPointer.style.left = pointerLeftPosition + 'px';
    } else {
      tooltipContainer.style.left = tooltipLeftPosition + 'px';
    }
  };
  
  const showBubble = function(x, y, selectedText, langEntity) {
    bubbleContainer.innerHTML = selectedText;
    bubbleContainer.style.top = (y + window.pageYOffset) +  'px';
    bubbleContainer.style.left = x + 'px';
    bubbleContainer.style.visibility = 'visible';

    if (langEntity) {
      bubbleContainer.classList.remove('missing');
    } else {
      bubbleContainer.classList.add('missing');
    }
  };

  const showTranslation = function(selectionPosition, selectedText, langEntity) {
    const OFFSET = 16;
    const {x, y} = selectionPosition;

    showBubble(x + OFFSET, y + OFFSET, selectedText, langEntity);
    if (langEntity) {
      showTooltip(langEntity);
      alignTooltip();
    }
  };

  const hideTooltip = function() {
    tooltipContainer.classList.add(hiddenCssClass);
  };

  const hideBubble = function() {
    bubbleContainer.style.visibility = 'hidden';
  };

  const _isInsideTooltipClicked = function(event) {
    return tooltipContainer === event.target || tooltipContainer.contains(event.target);
  };

  const hideTranslation = function(event) {
    if (!_isInsideTooltipClicked(event)) {
      hideTooltip();
      hideBubble();
    }
  };

  return {
    showTranslation,
    hideTranslation,
  };
})();


// Controller
const controller = (function() {
  const getTextOfSelection = function(selection) {
    return selection.toString().trim().toLowerCase();
  };

  const getPositionOfSelection = function(selection) {
    const oRange = selection.getRangeAt(0);
    const oRect = oRange.getBoundingClientRect();

    return {
      x: oRect.left,
      y: oRect.top
    };
  };


  const enableTranslation = function(event) {
    const selection = window.getSelection();
    const selectedText = getTextOfSelection(selection);

    if (selectedText) {
      const position = getPositionOfSelection(selection);

      languageModule.getLangEntity(selectedText)
        .then(function(langEntity) {
        viewModule.showTranslation(position, selectedText, langEntity);
      });
    }
  };

  const disableTranslation = function(event) {
    viewModule.hideTranslation(event);
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

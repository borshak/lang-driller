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

  const _withEnding = function(ending, precision) {
    const _removeFromEnd = function(str, subStr) {
      return str.substring(0, str.lastIndexOf(subStr));
    };
    
    return function(phrase) {
      if (!phrase.endsWith(ending)) return null;
  
      const reducedPhrase = _removeFromEnd(phrase, ending);
      const result = DICTIONARY[reducedPhrase];
      if (result) {
        return {
          ...result,
          precision
        };
      }
      
      return null;
    };
  };


  /**
   * Returns objects with raw description of language entity or null
   * @param {string} phrase
   * @returns {object|null} 
   */
  const retrieveLengEntity = function(phrase) {
    const gettersList = [
      _withEnding('', 1), // exact match
      _withEnding('\'s', 0.75),
      _withEnding('s', 0.75),
      _withEnding('ed', 0.75),
      _withEnding('ing', 0.75)
    ];

    for (let i=0, max=gettersList.length; i < max; i++) {
      const result = gettersList[i](phrase);
      if (result) return result;
    }

    return null;
  };

  /**
   * Returns Promise with result of getting lang entity
   * @param {*} rawPhrase
   * @returns {Promise} on resolve will be {LangEntity instance | null} 
   */
  const getLangEntity = function(rawPhrase) {
    const phrase = rawPhrase.length ? rawPhrase : '';
    const rawLengEntity = retrieveLengEntity(phrase);
    let langEntity;

    try {
      langEntity = new LangEntity(rawLengEntity);
    } catch(error) {
      langEntity = null;
    }

    return new Promise(function(resolve, reject) {
      resolve(langEntity);
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

  const hideTranslation = function(event) {
    hideTooltip();
    hideBubble();
  };

  const getTooltipContainer = function() {
    return tooltipContainer;
  };

  const getBubbleContainer = function() {
    return bubbleContainer;
  };

  return {
    showTranslation,
    hideTranslation,
    getTooltipContainer,
    getBubbleContainer
  };
})();


// Controller
const controller = (function() {
  const viewContainers = {};

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
    const _isInsideTooltipClicked = function(event) {
      return viewContainers.tooltipContainer === event.target 
        || viewContainers.tooltipContainer.contains(event.target);
    };

    if (!_isInsideTooltipClicked(event)) {
      viewModule.hideTranslation(event);
    }
  };

  const init = function() {
    // Get references for main view (DOM) containers
    viewContainers.tooltipContainer = viewModule.getTooltipContainer();
    viewContainers.bubbleContainer = viewModule.getBubbleContainer();

    // Add event listeners
    document.addEventListener('mouseup', enableTranslation, false);
    document.addEventListener('mousedown', disableTranslation, false);
  };

  return {
    init
  };

})();


// Entry point
controller.init();

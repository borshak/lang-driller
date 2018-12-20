const driller = (function() {

  const HIDDEN_CLASS = 'hidden';
  const EXERSISE_CONTAINER_CLASS = 'exersise-container';

  let rootDomElement;
  let successDrillCounter;

  const layout = function() {
    return `
    <h1>DRILLER</h1>
    <div class="${EXERSISE_CONTAINER_CLASS}"></div>
    <p><button class="close">Close</button></p>
    `; 
  };

  const init = function(containerToAdd) {
    rootDomElement = document.createElement('div');
    rootDomElement.className = `driller ${HIDDEN_CLASS}`;
    rootDomElement.innerHTML = layout();
    containerToAdd.appendChild(rootDomElement);
    addCloseButtonEventListener();
  };

  const runExersise = function(langEntity, exersiseContainer, exersises, currentExersise) {
    const isExersiseForbidden = function() {
      const result = exersises.length && currentExersise > exersises.length - 1;
      return result;
    };

    const isNextExesiseExist = function() {
      return currentExersise < exersises.length - 1; 
    };

    console.log(`runExersise ${exersises} - ${currentExersise}`);
    if (isExersiseForbidden()) {
      hide();
      return false;
    }
    
    exersises[currentExersise].create(langEntity, exersiseContainer);
    exersises[currentExersise].run()
    .then(result => {
      if (result) {
        successDrillCounter += 1;
        if (successDrillCounter === exersises.length) {
          console.log(`SUCCESS! Word ${langEntity.phrase} drilled!`);
        }
      }

      if (isNextExesiseExist()) {
        const nextExersise = currentExersise + 1;
        runExersise(langEntity, exersiseContainer, exersises, nextExersise);
      } else {
        hide();
      }
    });
  };

  const show = function(langEntity) {
    const exersiseContainer = rootDomElement.getElementsByClassName(EXERSISE_CONTAINER_CLASS)[0];
    const exersises = [exersise_1, exersise_2, exersise_3];
    rootDomElement.classList.remove(HIDDEN_CLASS);

    successDrillCounter = 0;
    runExersise(langEntity, exersiseContainer, exersises, 0);    
  };

  const hide = function() {
    rootDomElement.classList.add(HIDDEN_CLASS);
  };

  const addCloseButtonEventListener = function() {
    rootDomElement.addEventListener('click',
      function(event) {
        if (event.target.classList.contains('close')) {
          hide();
        }
      });
  };

  const removeCloseButtonEventListener = function() {
    rootDomElement.removeEventListener('click');
  };

  const destroy = function() {
    hide();
    removeCloseButtonEventListener();
    rootDomElement.remove();
    rootDomElement = null;
  };

  return {
    init,
    show,
    hide,
    destroy
  };
})();
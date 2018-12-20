const card = (function() {

  const layout = function(langEntity) {
    return `
    <h3>${langEntity.phrase}</h3>
    <p><i>${langEntity.translation}</i></p>
    <p>${langEntity.examples}</p>
    <p><button class="drill">Drill</button> - <button class="close">X</button></p>
    `; 
  };

  const HIDDEN_CLASS = 'hidden';

  let rootDomElement;
  let languageEntity;

  const init = function(containerToAdd) {
    rootDomElement = document.createElement('div');
    rootDomElement.className = `word-card ${HIDDEN_CLASS}`;
    containerToAdd.appendChild(rootDomElement);
  };

  const show = function(langEntity) {
    languageEntity = langEntity;
    rootDomElement.innerHTML = layout(langEntity);
    rootDomElement.classList.remove(HIDDEN_CLASS);

    console.log('Word Card:', langEntity);
  };

  const hide = function() {
    rootDomElement.classList.add(HIDDEN_CLASS);
  };

  const addDrillButtonEventListener = function(callback) {
    rootDomElement.addEventListener('click',
      function(event) {
        if (event.target.classList.contains('close')) {
          hide();
        }
        if (event.target.classList.contains('drill')) {
          hide();
          if (callback) callback(languageEntity);
        }
      });
  };

  const removeDrillButtonEventListener = function() {
    rootDomElement.removeEventListener('click');
  };

  const destroy = function() {
    hide();
    rootDomElement.remove();
    rootDomElement = null;
  };

  return {
    init,
    show,
    hide,
    addDrillButtonEventListener,
    removeDrillButtonEventListener,
    destroy
  };
})();
const driller = function(containerToAdd) {

  const layout = function(langEntity) {
    return `
    <h1>DRILLER</h1>
    <h3>${langEntity.phrase}</h3>
    <h3>${langEntity.translation}</h3>
    <p><button class="close">Close</button></p>
    `; 
  };

  const HIDDEN_CLASS = 'hidden';

  let rootDomElement;
  let languageEntity;

  const create = function() {
    rootDomElement = document.createElement('div');
    rootDomElement.className = `driller ${HIDDEN_CLASS}`;
    containerToAdd.appendChild(rootDomElement);
    addCloseButtonEventListener();
  };

  const show = function(langEntity) {
    languageEntity = langEntity;
    rootDomElement.innerHTML = layout(langEntity);
    rootDomElement.classList.remove(HIDDEN_CLASS);

    console.log('Driller:', langEntity);
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
    create,
    show,
    hide,
    destroy
  };
};
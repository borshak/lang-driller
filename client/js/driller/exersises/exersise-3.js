const exersise_3 = (function() {

  const HIDDEN_CLASS = 'hidden';

  // let containerToAdd;
  let rootDomElement;
  let resolveFn;
  
  const layout = function(langEntity) {
    return `
    <h1>Exersise 3</h1>
    <h3>${langEntity.phrase}</h3>
    <h3>${langEntity.translation}</h3>
    <p><button class="success">Success</button> ||| <button class="cancel">Cancel</button></p>
    `; 
  };

  const create = function(langEntity, containerToAdd) {
    if (rootDomElement) destroy();

    rootDomElement = document.createElement('div');
    rootDomElement.className = `drill-exersise ${HIDDEN_CLASS}`;
    rootDomElement.innerHTML = layout(langEntity);
    containerToAdd.appendChild(rootDomElement);
  };

  const run = function() {
    rootDomElement.classList.remove(HIDDEN_CLASS);
    return new Promise(function(resolve, reject) {
      resolveFn = resolve;
      addEventListeners(resolve);
    });

  };

  const clickEventHandler = function(event) {
    if (event.target.classList.contains('success')) {
      destroy();
      resolveFn(true);
    } else if (event.target.classList.contains('cancel')) {
      destroy();
      resolveFn(false);
    }
  };

  const addEventListeners = function() {
    rootDomElement.addEventListener('click', clickEventHandler);
  };

  const removeEventListeners = function() {
    rootDomElement.removeEventListener('click', clickEventHandler);
  };

  const destroy = function() {
    removeEventListeners();
    rootDomElement.remove();
    rootDomElement = null;
  };
  
  return {
    create,
    run,
    destroy
  };
})();
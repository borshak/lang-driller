const appContainer = document.getElementById('app');

// TODO: refactor this
const hideLoader = function() {
  const loader = appContainer.getElementsByClassName('loader');
  if (loader.length) {
    appContainer.removeChild(loader[0]);
  }
};

console.log('-- Reader App --'); // TODO: remove this

// INIT
pdf.init(appContainer);
card.init(appContainer);
driller.init(appContainer);

// EVENT LISTENERS
pdf.addSelectionEventListener(function(selectedText) {
  driller.hide(); // TODO (?)
  if (selectedText) {
    storage.getLangEntity(selectedText.toLowerCase(), 'USER')
      .then(function(langEntity) {
        if (langEntity) {
          card.show(langEntity);
        } else {
          console.log('MISSED: ', selectedText); // TODO: remove this
          card.hide();
        }
      });
  } else {
    card.hide();
  }
});

card.addDrillButtonEventListener(function(langEntity) {
  card.hide();
  // debugger;
  console.log('DRILL needed for:', langEntity);
  storage.getLangEntity(langEntity.phrase, 'DRILLER')
    .then(function(extendedLangEntity) {
      if (langEntity) {
        driller.show(extendedLangEntity);
      } else {
        driller.show(langEntity);
      }
    });
});


// START POINT
// TODO: refactor this
storage.isReadyPromise
  .then(function(result) {
    hideLoader();
    pdf.show();
  })
  .catch(function(error) {
    console.error('ERROR in Storage', error);
  });

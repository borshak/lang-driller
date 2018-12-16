const appContainer = document.getElementById('app');

console.log('-- Reader App --'); // TODO: remove this

// INIT
const mainStorage = storage;
const pdfReader = pdf(appContainer);
const wordCard = card(appContainer);
const drill = driller(appContainer);

pdfReader.create();
wordCard.create();
drill.create();

// EVENT LISTENERS
pdfReader.addSelectionEventListener(function(selectedText) {
  drill.hide(); // TODO (?)
  if (selectedText) {
    mainStorage.getLangEntity(selectedText.toLowerCase(), 'USER')
      .then(function(langEntity) {
        if (langEntity) {
          wordCard.show(langEntity);
        } else {
          console.log('MISSED: ', selectedText); // TODO: remove this
          wordCard.hide();
        }
      });
  } else {
    wordCard.hide();
  }
});

wordCard.addDrillButtonEventListener(function(langEntity) {
  wordCard.hide();
  // debugger;
  console.log('DRILL needed for:', langEntity);
  mainStorage.getLangEntity(langEntity.phrase, 'DRILLER')
    .then(function(extendedLangEntity) {
      if (langEntity) {
        drill.show(extendedLangEntity);
      } else {
        drill.show(langEntity);
      }
    });
});


// START POINT
pdfReader.show();
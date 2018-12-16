const appContainer = document.getElementById('app');

console.log('-- Reader App --'); // TODO: remove this

// INIT
const mainStorage = storage;
const pdfReader = pdf(appContainer);
const wordCard = card(appContainer);

pdfReader.create();
wordCard.create();


// EVENT LISTENERS
pdfReader.addSelectionEventListener(function(selectedText) {
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

wordCard.addDrillButtonEventListener(function(languageConstruction) {
  console.log('DRILL needed for:', languageConstruction);
});


// START POINT
pdfReader.show();
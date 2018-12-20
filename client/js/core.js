const appContainer = document.getElementById('app');

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
pdf.show();
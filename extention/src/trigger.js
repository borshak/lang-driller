chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.insertCSS({
    file: 'content.css'
  });

  chrome.tabs.executeScript({
    file: 'dict.js'
  });

  chrome.tabs.executeScript({
    file: 'content.js'
  });

  chrome.browserAction.setIcon({path:"icon-enabled.png"});
});
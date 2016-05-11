﻿// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({url: chrome.extension.getURL('index.html')});
});

var extension_index_url = 'chrome-extension://'+location.host+'/index.html';
function isExtensionURL(url) {
  if(url == extension_index_url) {
    return true;
  }
  return false;
}
// Find options page in all opened tabs
function goToOrOpenExtension() {
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && isExtensionURL(tab.url)) {
        chrome.tabs.update(tab.id, {selected: true});
        return;
      }
    }
    chrome.tabs.create({url: extension_index_url});
  });
}
// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  goToOrOpenExtension();
});

// Sends a coap ping to the vs0.inf.ethz.ch server
// using the CoapMessages and message passing
chrome.browserAction.onClicked.addListener(function(tab) {
  Copper.Log.registerLogger(Copper.ConsoleLogger.log);

	let clientPort = chrome.runtime.connect("mbighlecbopknoggoappifafoffcnocc");
	clientPort.onMessage.addListener(function(msg) {
		Copper.Log.logInfo(msg);
	});

	clientPort.postMessage(Copper.Event.createRegisterClientEvent("vs0.inf.ethz.ch", 5683, 0, 0));
});
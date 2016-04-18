// Sends a coap ping to the vs0.inf.ethz.ch server
// using the CoapMessages, Serialization and the ChromeUdpHandler
chrome.app.runtime.onLaunched.addListener(function() {
	
	Copper.Log.registerLogger(Copper.ConsoleLogger.log);

	let udpClient = new Copper.ChromeUdpClient("vs0.inf.ethz.ch", 5683);

	let onBind = function(successful){
		/* onBind */
		if (successful){
			let pingMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.PING);
			pingMsg.setMid(0);
			udpClient.send(Copper.CoapMessageSerializer.serialize(pingMsg));
			Copper.Log.logInfo("Sent Ping");
		}
		else {
			Copper.Log.logError("Could not bind socket");
		}
	};
	let onReceive = function(datagram, remoteAddress, remotePort){
		/* onReceive */
		Copper.Log.logInfo("Received " + datagram.byteLength + " from " + remoteAddress + ":" + remotePort);
		let result = Copper.CoapMessageSerializer.deserialize(datagram);
		if (result.message !== undefined){
			Copper.Log.logInfo("CoapMessage\n" + result.message);	
		}
		if (result.error !== undefined) {
			Copper.Log.logInfo("Deserialization Error: " + result.error);
		}
		Copper.Log.logInfo("Deserialization Warnings: " + result.warnings);
		
		udpClient.close();
	};
	let onReceiveError = function(socketOpen){
		/* onReceiveError */
		Copper.Log.logError("Error");
		udpClient.close();
	};
	
	udpClient.bind(onBind, onReceive, onReceiveError);
});
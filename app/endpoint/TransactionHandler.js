/*
* The transaction handler is the layer between the ServerEndpoint and the UdpClient. It provides reliable transport for the Coap Messages according to RFC-7252
* 
* The chart gives an overview of the different states and the methods that lead to a transition
*
*  STATE_CREATED            (Bind)
*        |
* bind   |  
*        V  
*   STATE_READY   (Send, Receive, Close)
*        |
* close  |
*        V
*   STATE_CLOSED
*/

Copper.TransactionHandler = function(udpClient, remoteAddress, remotePort, endpointId){
	if (typeof(remoteAddress) !== "string" || !Number.isInteger(remotePort) || remotePort <= 0x0 || remotePort > 0xFFFF || !Number.isInteger(endpointId)) {
		throw new Error("Illegal Arguments");
	}
	this.udpClient = udpClient;
	this.remoteAddress = remoteAddress;
	this.remotePort = remotePort;
	this.endpointId = endpointId;
	this.state = Copper.TransactionHandler.STATE_CREATED;
};

/* State Constants */
Copper.TransactionHandler.STATE_CREATED = 0;
Copper.TransactionHandler.STATE_READY = 1;
Copper.TransactionHandler.STATE_CLOSED = 2;

/* Properties */
Copper.TransactionHandler.prototype.udpClient = undefined;
Copper.TransactionHandler.prototype.remoteAddress = undefined;
Copper.TransactionHandler.prototype.remotePort = undefined;
Copper.TransactionHandler.prototype.endpointId = undefined;
Copper.TransactionHandler.prototype.state = undefined;

/* 
*  Binds the underlying socket. On success, a ClientRegisteredEvent is put on the event queue
*/
Copper.TransactionHandler.prototype.bind = function(){
	if (this.state !== Copper.TransactionHandler.STATE_CREATED){
		Copper.Event.sendEvent(Copper.Event.createErrorEvent("Illegal State", this.state === Copper.TransactionHandler.STATE_READY, this.endpointId));
	}
	else {
		let thisRef = this;
		this.udpClient.bind(function(socketReady, port, errorMsg){
								if (socketReady){
									thisRef.state = Copper.TransactionHandler.STATE_READY;
									Copper.Event.sendEvent(Copper.Event.createClientRegisteredEvent(port, thisRef.endpointId));
								}
								else {
									Copper.Event.sendEvent(Copper.Event.createErrorEvent("Error while binding socket: " + errorMsg, false, thisRef.endpointId));
									thisRef.close();
								}
							},
							function(datagram, remoteAddress, remotePort){ thisRef.onReceiveDatagram(datagram, remoteAddress, remotePort); },
							function(socketOpen, errorMsg){	thisRef.onReceiveDatagramError(socketOpen, errorMsg); }
		);
	}
};

/*
*  Creates a new transaction and starts sending the coap message
*
* @arg coapMessage: message to send
*/
Copper.TransactionHandler.prototype.sendCoapMessage = function(coapMessage){
	if (this.state !== Copper.TransactionHandler.STATE_READY){
		Copper.Event.sendEvent(Copper.Event.createErrorEvent("Illegal State", false, this.endpointId));
	}
	else {
		let thisRef = this;
		this.udpClient.send(Copper.CoapMessageSerializer.serialize(coapMessage), this.remoteAddress, this.remotePort, function(successful, bytesSent, socketOpen, errorMsg){
			if (successful){
				Copper.Event.sendEvent(Copper.Event.createCoapMessageSentEvent(coapMessage, bytesSent, thisRef.endpointId));
			}
			else {
				Copper.Event.sendEvent(Copper.Event.createErrorEvent("Error while sending: " + errorMsg, socketOpen, thisRef.endpointId));
			}
		});
	}
};

/*
*  Closes the underlying socket and cancels all remaining transactions
*/
Copper.TransactionHandler.prototype.close = function(){
	if (this.state !== Copper.TransactionHandler.STATE_CLOSED){
		this.state = Copper.TransactionHandler.STATE_CLOSED;
		this.udpClient.close();
	}
};

// -------- UDP Socket Callbacks -----------
Copper.TransactionHandler.prototype.onReceiveDatagram = function(datagram, remoteAddress, remotePort){
	if (this.state !== Copper.TransactionHandler.STATE_CLOSED){
		let result = Copper.CoapMessageSerializer.deserialize(datagram);
		Copper.Event.sendEvent(Copper.Event.createReceivedCoapMessageEvent(result.message, result.warnings, result.error, remoteAddress, remotePort, datagram.byteLength, this.endpointId));
	}
};

Copper.TransactionHandler.prototype.onReceiveDatagramError = function(socketOpen, errorMsg){
	if (this.state !== Copper.TransactionHandler.STATE_CLOSED){
		Copper.Event.sendEvent(Copper.Event.createErrorEvent("Error while receiving: " + errorMsg, socketOpen, this.endpointId));
	}
};
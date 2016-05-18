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
Copper.TransactionHandler = function(udpClient, remoteAddress, remotePort, settings, endpointId){
	if (typeof(remoteAddress) !== "string" || !Number.isInteger(remotePort) || remotePort <= 0x0 || remotePort > 0xFFFF || 
		    !(settings instanceof Copper.Settings) || !Number.isInteger(endpointId)) {
		throw new Error("Illegal Arguments");
	}
	this.udpClient = udpClient;
	this.remoteAddress = remoteAddress;
	this.remotePort = remotePort;
	this.settings = settings;
	this.endpointId = endpointId;

	let thisRef = this;
	this.transactionSet = new Copper.TransactionSet(function(transaction, retransmissionCount){ thisRef.onRetransmission(transaction, retransmissionCount); },
													function(transaction){ thisRef.onTimeout(transaction); },
													function(transaction){ thisRef.onEndOfLife(transaction); });
	
	let midStart = parseInt(Math.random()*0x10000);
	this.midGenerator = function(){
		midStart = (midStart + 1) % 0x10000;
		return midStart;
	};

	let periodicFunction = function(){
		thisRef.transactionSet.handleTransactions();
		thisRef.timer = Copper.TimeUtils.setTimeout(periodicFunction, 50);
	}
	periodicFunction();

	this.requestCallbacks = [];
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
Copper.TransactionHandler.prototype.settings = undefined;
Copper.TransactionHandler.prototype.endpointId = undefined;
Copper.TransactionHandler.prototype.transactionSet = undefined;
Copper.TransactionHandler.prototype.midGenerator = undefined;
Copper.TransactionHandler.prototype.timer = undefined;
Copper.TransactionHandler.prototype.requestCallbacks = undefined;
Copper.TransactionHandler.prototype.state = undefined;

/*
* Register a new callback that is called if a request is received
* If the callback returns a response, no further callbacks are called and the response is sent to remoteAddress:remotePort
* an ACK is also sent if a CON response is returned for a CON request 
* @arg callback: function(coapMessage, remoteAddress, remotePort) 
*/
Copper.TransactionHandler.prototype.registerRequestCallback = function(callback){
	if (!(typeof(callback) === "function")){
		throw new Error("Illegal Arguments");
	}
	if (this.requestCallbacks.indexOf(callback) > -1){
		throw new Error("Callback already registered");
	}
	this.requestCallbacks.push(callback);
};

/*
* Unregister the previously registered callback
* @arg callback: function(coapMessage, remoteAddress, remotePort) 
*/
Copper.TransactionHandler.prototype.unregisterRequestCallback = function(callback){
	if (!(typeof(callback) === "function")){
		throw new Error("Illegal Arguments");
	}
	let index = this.requestCallbacks.indexOf(callback);
	if (index > -1){
		this.requestCallbacks.splice(index, 1);
	}
};

/* 
*  Binds the underlying socket. On success, a ClientRegisteredEvent is put on the event queue
*/
Copper.TransactionHandler.prototype.bind = function(){
	if (this.state !== Copper.TransactionHandler.STATE_CREATED){
		Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_ILLEGAL_STATE, "Illegal State", this.state === Copper.TransactionHandler.STATE_READY, this.endpointId));
	}
	else {
		let thisRef = this;
		this.udpClient.bind(function(socketReady, port, errorMsg){
								if (socketReady){
									thisRef.state = Copper.TransactionHandler.STATE_READY;
									Copper.Event.sendEvent(Copper.Event.createClientRegisteredEvent(port, thisRef.endpointId));
								}
								else {
									Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_BIND, "Error while binding socket: " + errorMsg, false, thisRef.endpointId));
									thisRef.close();
								}
							},
							function(datagram, remoteAddress, remotePort){ thisRef.onReceiveDatagram(datagram, remoteAddress, remotePort); },
							function(socketOpen, errorMsg){	thisRef.onReceiveDatagramError(socketOpen, errorMsg); }
		);
	}
};

/*
*  Updates the settings
*  @arg settings: new settings
*/
Copper.TransactionHandler.prototype.updateSettings = function(settings){
	if (!(settings instanceof Copper.Settings)){
		throw new Error("Illegal Arguments");
	}
	this.settings = settings;
};

/*
*  Creates a new transaction and starts sending the coap message
*
* @arg coapMessage: message to send
*/
Copper.TransactionHandler.prototype.sendCoapMessage = function(coapMessage){
	if (this.state !== Copper.TransactionHandler.STATE_READY){
		Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_ILLEGAL_STATE, "Illegal State", false, this.endpointId));
	}
	else if (coapMessage.mid !== undefined){
		Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_ILLEGAL_ARGUMENT, "Mid must not be set", true, this.endpointId));
	}
	else {
		coapMessage.setMid(this.midGenerator());
		if (this.transactionSet.isTokenRegistered(coapMessage.token)){
			Copper.Log.logInfo("Token " + Copper.ByteUtils.convertBytesToHexString(coapMessage.token) + " is in use. Another token is used.");
			do {
				coapMessage.setToken(Copper.ByteUtils.convertUintToBytes(parseInt(Math.random()*0x10000000)));
			} while (this.transactionSet.isTokenRegistered(coapMessage.token));
		}
		let transaction = new Copper.RequestTransaction(coapMessage, this.settings.retransmission);
		this.transactionSet.addNewTransaction(transaction);
		this.sendCoapMessageInternal(transaction.coapMessage, this.remoteAddress, this.remotePort, 0);
	}
};

/*
*  Closes the underlying socket and cancels all remaining transactions
*/
Copper.TransactionHandler.prototype.close = function(){
	if (this.state !== Copper.TransactionHandler.STATE_CLOSED){
		this.state = Copper.TransactionHandler.STATE_CLOSED;
		Copper.TimeUtils.clearTimeout(this.timer);
		this.transactionSet.reset();
		this.udpClient.close();
	}
};

// -------- Implementation -------------
/*
* Sends the coap message over the udp socket
*/
Copper.TransactionHandler.prototype.sendCoapMessageInternal = function(coapMessage, remoteAddress, remotePort, retransmissionCount){
	if (!(coapMessage instanceof Copper.CoapMessage) || typeof(remoteAddress) !== "string" || !Number.isInteger(remotePort) || remotePort < 0 || 
			!Number.isInteger(retransmissionCount) || retransmissionCount < 0){
		throw new Error("Illegal Arguments");
	}
	let thisRef = this;
	this.udpClient.send(Copper.CoapMessageSerializer.serialize(coapMessage), this.remoteAddress, this.remotePort, function(successful, bytesSent, socketOpen, errorMsg){
		if (this.state !== Copper.TransactionHandler.STATE_CLOSED){
			if (successful){
				Copper.Event.sendEvent(Copper.Event.createCoapMessageSentEvent(coapMessage, bytesSent, retransmissionCount, thisRef.endpointId));
			}
			else {
				Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_SEND, "Error while sending: " + errorMsg, socketOpen, thisRef.endpointId));
			}
		}
	});
};

/*
* Handle a received message. 
* For a request (CON or NON with request code)
*   1. Collect response
*   2. Send response (and if necessary ACK) 
*   3. Add to duplicate filter
* For a response (ACK, RST, CON or NON with response code):
*   1. Stop retransmission for corresponding transaction 
*   2. Release token if content is delivered
*   3. ACK if it is necessary
*/
Copper.TransactionHandler.prototype.handleReceivedCoapMessage = function(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength){
	if (Copper.CoapMessage.Type.ACK.equals(coapMessage.type) || Copper.CoapMessage.Type.RST.equals(coapMessage.type)){
		// Matches exactly one coap message in a request
		let requestTransaction = this.transactionSet.getRequestTransaction(coapMessage.mid, coapMessage.token);
		if (requestTransaction === undefined){
			Copper.Event.sendEvent(Copper.Event.createReceivedUnknownCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
		}
		else if (requestTransaction.isConfirmed){
			Copper.Event.sendEvent(Copper.Event.createReceivedDuplicateCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
		}
		else {
			Copper.Event.sendEvent(Copper.Event.createReceivedCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
			this.confirmRequestTransaction(requestTransaction);
			if (requestTransaction.coapMessage.code.isResponseCode()){
				this.completeRequestTransaction(requestTransaction, undefined);
			}
			else if (Copper.CoapMessage.Type.RST.equals(coapMessage.type) || !Copper.CoapMessage.Code.EMPTY.equals(coapMessage.code)){
				this.completeRequestTransaction(requestTransaction, coapMessage);
			}
		}
	}
	else {
		// Either a new request or a reponse to a previous request. If request or response is determined using the code
		let responseCoapMessage = undefined; // CON-Message that is sent as a reply to a CON-Response
		let responseTransaction = this.transactionSet.getResponseTransaction(coapMessage.mid, remoteAddress, remotePort);
		if (responseTransaction !== undefined){
			// message is a duplicate
			Copper.Event.sendEvent(Copper.Event.createReceivedDuplicateCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
			responseTransaction.retransmissionCounter++;
		}
		else {
			responseTransaction = new Copper.ResponseTransaction(coapMessage, remoteAddress, remotePort);
			if (coapMessage.code.isResponseCode()) {
				// reponse to a previous request. should match using the token 
				let requestTransaction = this.transactionSet.getRequestTransaction(undefined, coapMessage.token);
				if (requestTransaction !== undefined){
					Copper.Event.sendEvent(Copper.Event.createReceivedCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
					this.completeRequestTransaction(requestTransaction, coapMessage);
					if (Copper.CoapMessage.Type.CON.equals(coapMessage.type)){
						responseTransaction.addResponse(Copper.CoapMessage.ack(coapMessage.mid, coapMessage.token));
					}
				}
				else {
					Copper.Event.sendEvent(Copper.Event.createReceivedUnknownCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
					if (this.settings.rejectUnknown){
						responseTransaction.addResponse(Copper.CoapMessage.reset(coapMessage.mid, coapMessage.token));
					}
				}
			}
			else if (coapMessage.code.isRequestCode()) {
				let res = undefined;
				let i=0;
				while (res === undefined && i < this.requestCallbacks.length){
					let tmpRes = this.requestCallbacks[i](coapMessage, remoteAddress, remotePort);
					if (tmpRes !== undefined && !(tmpRes instanceof Copper.CoapMessage)){
						throw new Error("Illegal return value from callback");
					}
					res = tmpRes;
					i++;
				}
				if (res !== undefined){
					Copper.Event.sendEvent(Copper.Event.createReceivedCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
					if (Copper.CoapMessage.Type.CON.equals(responseTransaction.coapMessage.type) && 
						      !Copper.CoapMessage.Type.ACK.equals(res.type) && !Copper.CoapMessage.Type.RST.equals(res.type)){
						// add ACK for the CON message
						responseTransaction.addResponse(Copper.CoapMessage.ack(responseTransaction.coapMessage.mid, responseTransaction.coapMessage.token));
					}
					if (Copper.CoapMessage.Type.CON.equals(res.type)){
						responseCoapMessage = res;
					}
					else {
						responseTransaction.addResponse(res);
					}
				}
				else {
					Copper.Event.sendEvent(Copper.Event.createReceivedUnknownCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
					if (this.settings.rejectUnknown){
						responseTransaction.addResponse(Copper.CoapMessage.reset(coapMessage.mid, coapMessage.token));
					}	
				}
			}
			else {
				Copper.Event.sendEvent(Copper.Event.createReceivedUnknownCoapMessageEvent(coapMessage, parserWarnings, remoteAddress, remotePort, byteLength, this.endpointId));
				if (this.settings.rejectUnknown){
					responseTransaction.addResponse(Copper.CoapMessage.reset(coapMessage.mid, coapMessage.token));
				}
			}
			this.transactionSet.addNewTransaction(responseTransaction);
		}
		for (let i=0; i<responseTransaction.responses.length; i++) {
			this.sendCoapMessageInternal(responseTransaction.responses[i], responseTransaction.remoteAddress, responseTransaction.remotePort, responseTransaction.retransmissionCounter);
		}
		if (responseCoapMessage !== undefined){
			if (!Copper.CoapMessage.Type.CON.equals(responseCoapMessage.type)){
				throw new Error("Illegal response message");
			}
			// create new transaction and send reliably
			this.sendCoapMessage(responseCoapMessage);
		}
	}
};

Copper.TransactionHandler.prototype.confirmRequestTransaction = function(requestTransaction){
	if (!(requestTransaction instanceof Copper.RequestTransaction)){
		throw new Error("Illegal Arguments");
	}
	if (!requestTransaction.isConfirmed){
		requestTransaction.isConfirmed = true;
		Copper.Event.sendEvent(Copper.Event.createMessageConfirmedEvent(requestTransaction.coapMessage, Copper.TimeUtils.now()-requestTransaction.lastTransmissionStart, this.endpointId));
	}
};

Copper.TransactionHandler.prototype.completeRequestTransaction = function(requestTransaction, response){
	if (!(requestTransaction instanceof Copper.RequestTransaction) || (response !== undefined && !(response instanceof Copper.CoapMessage))){
		throw new Error("Illegal Arguments");
	}
	if (!requestTransaction.isCompleted){
		requestTransaction.isCompleted = true;
		this.transactionSet.unregisterToken(requestTransaction.coapMessage.token);
		if (response !== undefined){
			Copper.Event.sendEvent(Copper.Event.createRequestCompletedEvent(requestTransaction.coapMessage, response, Copper.TimeUtils.now()-requestTransaction.firstTransmissionStart, this.endpointId));
		}
	}
};

// -------- Transaction Set Callbacks -----------
Copper.TransactionHandler.prototype.onRetransmission = function(transaction){
	Copper.Log.logFine("Retransmit Transaction " + transaction.coapMessage.mid + " to " + this.remoteAddress + ":" + this.remotePort);
	this.sendCoapMessageInternal(transaction.coapMessage, this.remoteAddress, this.remotePort, transaction.retransmissionCounter);
};

Copper.TransactionHandler.prototype.onTimeout = function(transaction){
	Copper.Log.logFine("Request Transaction " + transaction.coapMessage.mid + " to " + this.remoteAddress + ":" + this.remotePort + " has timeouted");
	Copper.Event.sendEvent(Copper.Event.createCoapMessageTimedOutEvent(transaction.mid, transaction.token, transaction.firstTransmissionStart, this.endpointId));
};

Copper.TransactionHandler.prototype.onEndOfLife = function(transaction){
	if (transaction instanceof Copper.RequestTransaction){
		this.transactionSet.unregisterTokenFromTransaction(transaction);
		Copper.Log.logFine("Request Transaction " + transaction.coapMessage.mid + " to " + this.remoteAddress + ":" + this.remotePort + " is end of life");
	}
	else {
		Copper.Log.logFine("Response Transaction " + transaction.coapMessage.mid + " from " + transaction.remoteAddress + ":" + transaction.remotePort + " is end of life");
	}
};

// -------- UDP Socket Callbacks -----------
Copper.TransactionHandler.prototype.onReceiveDatagram = function(datagram, remoteAddress, remotePort){
	if (this.state !== Copper.TransactionHandler.STATE_CLOSED){
		let result = Copper.CoapMessageSerializer.deserialize(datagram);
		if (result.error === undefined){
			this.handleReceivedCoapMessage(result.message, result.warnings, remoteAddress, remotePort, datagram.byteLength);
		}
		else {
			Copper.Event.sendEvent(Copper.Event.createReceivedParseErrorEvent(result.error, remoteAddress, remotePort, datagram.byteLength, this.endpointId));
		}
	}
};

Copper.TransactionHandler.prototype.onReceiveDatagramError = function(socketOpen, errorMsg){
	if (this.state !== Copper.TransactionHandler.STATE_CLOSED){
		Copper.Event.sendEvent(Copper.Event.createErrorOnServerEvent(Copper.Event.ERROR_RECEIVE, "Error while receiving: " + errorMsg, socketOpen, this.endpointId));
	}
};
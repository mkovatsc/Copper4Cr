QUnit.test("TransactionHandler: Request-Response", function(assert) {
	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let id = 1;
	let eventsReceived = 0;
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED, 
	                 Copper.Event.TYPE_REQUEST_COMPLETED];
	                 
	let callback = function(event){
		assert.deepEqual(event.type, expEvents[eventsReceived++]);
	};
	let packetHandler = function(datagram){
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		return Copper.CoapMessageSerializer.serialize(
			new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).
					setMid(request.mid).
					setToken(request.token).
					setPayload(Copper.ByteUtils.convertStringToBytes("test-content"))
				);
	};
	Copper.Event.registerCallback(callback, id);

	let settings = new Copper.Settings();
	let transactionHandler = new Copper.TransactionHandler(Copper.TestUtils.generateUdpClientMock(packetHandler), "10.0.0.1", 312, settings, id);
	Copper.TimeUtils.clearTimeout(transactionHandler.timer);
	transactionHandler.bind();

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	transactionHandler.sendCoapMessage(coapMessage);
	assert.deepEqual(transactionHandler.transactionSet.registeredTokens, new Object());

	transactionHandler.transactionSet.handleTransactions();
	elapsedTime = 1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1);
	transactionHandler.transactionSet.handleTransactions();
	assert.deepEqual(transactionHandler.transactionSet.getTransactionCount(), 0);

	transactionHandler.close();
	Copper.Event.unregisterCallback(callback, id);

	assert.deepEqual(eventsReceived, expEvents.length);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
});
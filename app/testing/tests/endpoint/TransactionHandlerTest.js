Copper.TransactionHandlerTest = function(){
};

Copper.TransactionHandlerTest.runTest = function(assert, coapMessage, expEvents, packetHandler, steps, settings){
	if (settings === undefined) settings = new Copper.Settings();

	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let id = 1;
	let eventsReceived = 0;

	let callback = function(event){
		assert.deepEqual(event.type, expEvents[eventsReceived++]);
	};
	
	Copper.Event.registerCallback(callback, id);

	let transactionHandler = new Copper.TransactionHandler(Copper.TestUtils.generateUdpClientMock(function(datagram) {return packetHandler(assert, transactionHandler, datagram);}), "10.0.0.1", 312, settings, id);
	Copper.TimeUtils.clearTimeout(transactionHandler.timer);
	transactionHandler.bind();

	if (coapMessage !== undefined){
		transactionHandler.sendCoapMessage(coapMessage);
	}

	for (let i=0; i<steps.length; i++){
		elapsedTime = steps[i][0];
		steps[i][1](assert, transactionHandler);	
	}	

	assert.deepEqual(transactionHandler.transactionSet.getTransactionCount(), 0);
	assert.deepEqual(transactionHandler.transactionSet.registeredTokens, new Object());
	assert.deepEqual(eventsReceived, expEvents.length);

	transactionHandler.close();
	Copper.Event.unregisterCallback(callback, id);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
};

QUnit.test("TransactionHandler: Request-Response", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED, 
	                 Copper.Event.TYPE_MESSAGE_CONFIRMED,
	                 Copper.Event.TYPE_REQUEST_COMPLETED];

	let packetHandler = function(assert, transactionHandler, datagram){
		assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 1);
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		return Copper.CoapMessageSerializer.serialize(
			new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).
					setMid(request.mid).
					setToken(request.token).
					setPayload(Copper.ByteUtils.convertStringToBytes("test-content"))
				);
	};

	let steps = [
		[0, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransactionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransactionHandler: Request-Reset", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_CONFIRMED, 
	                 Copper.Event.TYPE_REQUEST_COMPLETED];

	let packetHandler = function(assert, transactionHandler, datagram){
		assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 1);
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		return Copper.CoapMessageSerializer.serialize(
			new Copper.CoapMessage(Copper.CoapMessage.Type.RST, Copper.CoapMessage.Code.EMPTY).
					setMid(request.mid).
					setToken(request.token)
				);
	};

	let steps = [
		[0, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransactionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransactionHandler: Delayed-Response (with Duplicate)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_CONFIRMED, 
	                 Copper.Event.TYPE_REQUEST_COMPLETED,
	                 Copper.Event.TYPE_DUPLICATE_COAP_MESSAGE_RECEIVED];

	let count = 0;

	let lastDatagram = undefined;
	let packetHandler = function(assert, transactionHandler, datagram){
		assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 1);
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		if (count === 0){
			count++;
			return undefined;
		}
		else {
			lastDatagram = Copper.CoapMessageSerializer.serialize(
				new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).
						setMid(request.mid).
						setToken(request.token).
						setPayload(Copper.ByteUtils.convertStringToBytes("test-content"))
					);
			return lastDatagram;
		}
	};

	let steps = [
		[0, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ 
						transactionHandler.transactionSet.handleTransactions(); 
						transactionHandler.onReceiveDatagram(lastDatagram, "10.0.0.1", 312);
						}],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransactionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransactionHandler: Timeout", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_TIMED_OUT];

	let packetHandler = function(assert, transactionHandler, datagram){
		assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 1);
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		return undefined;
	};

	let steps = [
		[0, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[2*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[4*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[8*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[16*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransactionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransactionHandler: Illegal Reply", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_UNKNOWN_COAP_MESSAGE_RECEIVED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_RECEIVED_PARSE_ERROR, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED, 
	                 Copper.Event.TYPE_MESSAGE_CONFIRMED,
	                 Copper.Event.TYPE_REQUEST_COMPLETED];

	let count = 0;
	let packetHandler = function(assert, transactionHandler, datagram){
		assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 1);
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;

		if (count === 0){
			count++;
			return Copper.CoapMessageSerializer.serialize(
					new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).
						setMid(request.mid+1).
						setToken(request.token).
						setPayload(Copper.ByteUtils.convertStringToBytes("test-content"))
					);
		}
		else if (count === 1){
			count++;
			return new ArrayBuffer(1);
		}
		else {
			return Copper.CoapMessageSerializer.serialize(
					new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).
						setMid(request.mid).
						setToken(request.token).
						setPayload(Copper.ByteUtils.convertStringToBytes("test-content"))
					);
		}
		return undefined;
	};

	let steps = [
		[0, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[2*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[4*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[8*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[16*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransactionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransactionHandler: Separate CON Response (with duplicate)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_CONFIRMED,
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_REQUEST_COMPLETED,
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_DUPLICATE_COAP_MESSAGE_RECEIVED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT];

	let passed = false;
	let token = new ArrayBuffer(0);
	let packetHandler = function(assert, transactionHandler, datagram){
		if (!passed){
			assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 1);
			passed = true;
			let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
			token = request.token;
			return Copper.CoapMessageSerializer.serialize(
					new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.EMPTY).
						setMid(request.mid).
						setToken(request.token)
					);
		}
		else {
			return undefined;
		}
	};

	let contentMsg = Copper.CoapMessageSerializer.serialize(
						new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.CONTENT).
							setMid(101).
							setToken(token).
							setPayload(Copper.ByteUtils.convertStringToBytes("test-content"))
						);

	let steps = [
		[0, function(assert, transactionHandler){ 
				transactionHandler.transactionSet.handleTransactions(); 
				assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 1);
				transactionHandler.onReceiveDatagram(contentMsg, "10.0.0.1", 312);
				assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 0);
			}],
		[1, function(assert, transactionHandler){ transactionHandler.onReceiveDatagram(contentMsg, "10.0.0.1", 312); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransactionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransactionHandler: Separate CON Response (lost ack)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_REQUEST_COMPLETED,
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT];

	let passed = false;
	let packetHandler = function(assert, transactionHandler, datagram){
		if (!passed){
			assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 1);
			passed = true;
			let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
			return Copper.CoapMessageSerializer.serialize(
					new Copper.CoapMessage(Copper.CoapMessage.Type.CON,  Copper.CoapMessage.Code.CONTENT).
						setMid(101).
						setToken(request.token).
						setPayload(Copper.ByteUtils.convertStringToBytes("test-content"))
					);
		}
		else {
			return undefined;
		}
	};

	let steps = [
		[0, function(assert, transactionHandler){ 
				transactionHandler.transactionSet.handleTransactions(); 
				assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 0);
			}],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransactionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransactionHandler: Separate NON Response (with duplicate)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_CONFIRMED,
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_REQUEST_COMPLETED,
	                 Copper.Event.TYPE_DUPLICATE_COAP_MESSAGE_RECEIVED];

	let passed = false;
	let token = new ArrayBuffer(0);
	let packetHandler = function(assert, transactionHandler, datagram){
		if (!passed){
			assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 1);
			passed = true;
			let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
			token = request.token;
			return Copper.CoapMessageSerializer.serialize(
					new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.EMPTY).
						setMid(request.mid).
						setToken(request.token)
					);
		}
		else {
			assert.deepEqual(true, false);
		}
	};

	let contentMsg = Copper.CoapMessageSerializer.serialize(
						new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.CONTENT).
							setMid(101).
							setToken(token).
							setPayload(Copper.ByteUtils.convertStringToBytes("test-content"))
						);

	let steps = [
		[0, function(assert, transactionHandler){ 
				transactionHandler.transactionSet.handleTransactions(); 
				assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 1);
				transactionHandler.onReceiveDatagram(contentMsg, "10.0.0.1", 312);
				assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 0);
			}],
		[1, function(assert, transactionHandler){ transactionHandler.onReceiveDatagram(contentMsg, "10.0.0.1", 312); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET);
	Copper.TransactionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransactionHandler: Request (Unhandled)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_UNKNOWN_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT];

	let token = new ArrayBuffer(0);
	let packetHandler = function(assert, transactionHandler, datagram){
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		assert.deepEqual(request.type, Copper.CoapMessage.Type.RST);
		assert.deepEqual(request.code, Copper.CoapMessage.Code.EMPTY);
		return undefined;
	};

	let coapMessage = Copper.CoapMessageSerializer.serialize(new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET).setMid(13023));
	
	let steps = [
		[0, function(assert, transactionHandler){ 
				transactionHandler.transactionSet.handleTransactions(); 
				assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 0);
				transactionHandler.onReceiveDatagram(coapMessage, "10.0.0.1", 312);
				assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 0);
			}],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }]
	];

	Copper.TransactionHandlerTest.runTest(assert, undefined, expEvents, packetHandler, steps);
});

QUnit.test("TransactionHandler: Request (Handled)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT,
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT,
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_CONFIRMED];

	let token = new ArrayBuffer(0);
	let first = true;
	let packetHandler = function(assert, transactionHandler, datagram){
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		if (first){
			first = false;
			assert.deepEqual(request.type, Copper.CoapMessage.Type.ACK);
			assert.deepEqual(request.code, Copper.CoapMessage.Code.EMPTY);
			return undefined;
		}
		else {
			assert.deepEqual(request.type, Copper.CoapMessage.Type.CON);
			return Copper.CoapMessageSerializer.serialize(
					new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.EMPTY).
						setMid(request.mid).
						setToken(request.token)
					);
		}
	};

	let coapMessage = Copper.CoapMessageSerializer.serialize(new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET).setMid(13023));
	
	let steps = [
		[0, function(assert, transactionHandler){ 
				transactionHandler.transactionSet.handleTransactions();
				transactionHandler.registerRequestCallback(function(coapMessage, remoteAddress, remotePort){
					return new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.CONTENT).setPayload(new ArrayBuffer(3));
				});
				assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 0);
				transactionHandler.onReceiveDatagram(coapMessage, "10.0.0.1", 312);
				assert.deepEqual(Object.keys(transactionHandler.transactionSet.registeredTokens).length, 0);
			}],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+2), function(assert, transactionHandler){ transactionHandler.transactionSet.handleTransactions(); }]
	];

	Copper.TransactionHandlerTest.runTest(assert, undefined, expEvents, packetHandler, steps);
});
Copper.TransmissionHandlerTest = function(){
};

Copper.TransmissionHandlerTest.runTest = function(assert, coapMessage, expEvents, packetHandler, steps, settings){
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

	let transmissionHandler = new Copper.TransmissionHandler(Copper.TestUtils.generateUdpClientMock(function(datagram) {return packetHandler(assert, transmissionHandler, datagram);}), "10.0.0.1", 312, settings, id);
	Copper.TimeUtils.clearTimeout(transmissionHandler.timer);
	transmissionHandler.bind();

	if (coapMessage !== undefined){
		new Copper.SingleRequestHandler(coapMessage, transmissionHandler, settings, id);
	}

	for (let i=0; i<steps.length; i++){
		elapsedTime = steps[i][0];
		steps[i][1](assert, transmissionHandler);	
	}	

	assert.deepEqual(transmissionHandler.messagesInTransmissionSet.getTransmissionCount(), 0);
	assert.deepEqual(transmissionHandler.messagesInTransmissionSet.registeredTokens, new Object());
	assert.deepEqual(eventsReceived, expEvents.length);

	transmissionHandler.close();
	Copper.Event.unregisterCallback(callback, id);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
};

QUnit.test("TransmissionHandler: Request-Response", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED, 
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_CONFIRMED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_COMPLETED];

	let packetHandler = function(assert, transmissionHandler, datagram){
		assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 1);
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		return Copper.CoapMessageSerializer.serialize(
			new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).
					setMid(request.mid).
					setToken(request.token).
					setPayload(Copper.ByteUtils.convertStringToBytes("test-content"))
				);
	};

	let steps = [
		[0, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransmissionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransmissionHandler: Request-Reset", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_CONFIRMED, 
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_COMPLETED];

	let packetHandler = function(assert, transmissionHandler, datagram){
		assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 1);
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		return Copper.CoapMessageSerializer.serialize(
			new Copper.CoapMessage(Copper.CoapMessage.Type.RST, Copper.CoapMessage.Code.EMPTY).
					setMid(request.mid).
					setToken(request.token)
				);
	};

	let steps = [
		[0, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransmissionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransmissionHandler: Delayed-Response (with Duplicate)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_CONFIRMED, 
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_COMPLETED,
	                 Copper.Event.TYPE_DUPLICATE_COAP_MESSAGE_RECEIVED];

	let count = 0;

	let lastDatagram = undefined;
	let packetHandler = function(assert, transmissionHandler, datagram){
		assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 1);
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
		[0, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ 
						transmissionHandler.messagesInTransmissionSet.handleTransmissions(); 
						transmissionHandler.onReceiveDatagram(lastDatagram, "10.0.0.1", 312);
						}],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransmissionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransmissionHandler: Timeout", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_TIMED_OUT];

	let packetHandler = function(assert, transmissionHandler, datagram){
		assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 1);
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		return undefined;
	};

	let steps = [
		[0, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[2*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[4*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[8*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[16*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransmissionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransmissionHandler: Illegal Reply", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_UNKNOWN_COAP_MESSAGE_RECEIVED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_RECEIVED_PARSE_ERROR, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED, 
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_CONFIRMED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_COMPLETED];

	let count = 0;
	let packetHandler = function(assert, transmissionHandler, datagram){
		assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 1);
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
		[0, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[2*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[4*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[8*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[16*1000*Copper.CoapConstants.ACK_TIMEOUT*Copper.CoapConstants.ACK_RANDOM_FACTOR, function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransmissionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransmissionHandler: Separate CON Response (with duplicate)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_CONFIRMED,
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_COMPLETED,
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_DUPLICATE_COAP_MESSAGE_RECEIVED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT];

	let passed = false;
	let token = new ArrayBuffer(0);
	let packetHandler = function(assert, transmissionHandler, datagram){
		if (!passed){
			assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 1);
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
		[0, function(assert, transmissionHandler){ 
				transmissionHandler.messagesInTransmissionSet.handleTransmissions(); 
				assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 1);
				transmissionHandler.onReceiveDatagram(contentMsg, "10.0.0.1", 312);
				assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 0);
			}],
		[1, function(assert, transmissionHandler){ transmissionHandler.onReceiveDatagram(contentMsg, "10.0.0.1", 312); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransmissionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransmissionHandler: Separate CON Response (lost ack)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_COMPLETED,
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT];

	let passed = false;
	let packetHandler = function(assert, transmissionHandler, datagram){
		if (!passed){
			assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 1);
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
		[0, function(assert, transmissionHandler){ 
				transmissionHandler.messagesInTransmissionSet.handleTransmissions(); 
				assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 0);
			}],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	Copper.TransmissionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransmissionHandler: Separate NON Response (with duplicate)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_CONFIRMED,
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_COMPLETED,
	                 Copper.Event.TYPE_DUPLICATE_COAP_MESSAGE_RECEIVED];

	let passed = false;
	let token = new ArrayBuffer(0);
	let packetHandler = function(assert, transmissionHandler, datagram){
		if (!passed){
			assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 1);
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
		[0, function(assert, transmissionHandler){ 
				transmissionHandler.messagesInTransmissionSet.handleTransmissions(); 
				assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 1);
				transmissionHandler.onReceiveDatagram(contentMsg, "10.0.0.1", 312);
				assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 0);
			}],
		[1, function(assert, transmissionHandler){ transmissionHandler.onReceiveDatagram(contentMsg, "10.0.0.1", 312); }],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }]
	];

	let coapMessage = new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET);
	Copper.TransmissionHandlerTest.runTest(assert, coapMessage, expEvents, packetHandler, steps);
});

QUnit.test("TransmissionHandler: Request (Unhandled)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_UNKNOWN_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT];

	let token = new ArrayBuffer(0);
	let packetHandler = function(assert, transmissionHandler, datagram){
		let request = Copper.CoapMessageSerializer.deserialize(datagram).message;
		assert.deepEqual(request.type, Copper.CoapMessage.Type.RST);
		assert.deepEqual(request.code, Copper.CoapMessage.Code.EMPTY);
		return undefined;
	};

	let coapMessage = Copper.CoapMessageSerializer.serialize(new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET).setMid(13023));
	
	let steps = [
		[0, function(assert, transmissionHandler){ 
				transmissionHandler.messagesInTransmissionSet.handleTransmissions(); 
				assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 0);
				transmissionHandler.onReceiveDatagram(coapMessage, "10.0.0.1", 312);
				assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 0);
			}],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+1), function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }]
	];

	Copper.TransmissionHandlerTest.runTest(assert, undefined, expEvents, packetHandler, steps);
});

QUnit.test("TransmissionHandler: Request (Handled)", function(assert) {
	let expEvents = [Copper.Event.TYPE_CLIENT_REGISTERED, 
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT,
	                 Copper.Event.TYPE_COAP_MESSAGE_SENT,
	                 Copper.Event.TYPE_COAP_MESSAGE_RECEIVED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_CONFIRMED,
	                 Copper.Event.TYPE_MESSAGE_TRANSMISSION_COMPLETED];

	let token = new ArrayBuffer(0);
	let first = true;
	let packetHandler = function(assert, transmissionHandler, datagram){
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
		[0, function(assert, transmissionHandler){ 
				transmissionHandler.messagesInTransmissionSet.handleTransmissions();
				transmissionHandler.registerRequestCallback(function(coapMessage, remoteAddress, remotePort){
					return new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.CONTENT).setPayload(new ArrayBuffer(3));
				});
				assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 0);
				transmissionHandler.onReceiveDatagram(coapMessage, "10.0.0.1", 312);
				assert.deepEqual(Object.keys(transmissionHandler.messagesInTransmissionSet.registeredTokens).length, 0);
			}],
		[1000*(Copper.CoapConstants.EXCHANGE_LIFETIME+2), function(assert, transmissionHandler){ transmissionHandler.messagesInTransmissionSet.handleTransmissions(); }]
	];

	Copper.TransmissionHandlerTest.runTest(assert, undefined, expEvents, packetHandler, steps);
});
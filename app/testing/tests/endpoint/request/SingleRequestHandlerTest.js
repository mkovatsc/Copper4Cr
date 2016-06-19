Copper.SingleRequestHandlerTest = function(){
};

Copper.SingleRequestHandlerTest.runTest = function(assert, firstRequest, responses, settings, beforeClose){
	if (settings === undefined) settings = new Copper.Settings();

	// Test
	let id = 1;
	let lastEvent = undefined;
	let nextResponseIdx = 0;

	let callback = function(event){
		lastEvent = event;
	};
	
	Copper.Event.registerCallback(callback, id);

	let transmissionHandler = new Copper.TransmissionHandler(
		Copper.TestUtils.generateUdpClientMock(function(datagram) {
			let req = Copper.CoapMessageSerializer.deserialize(datagram).message;
			let res = responses[nextResponseIdx++];
			if (res instanceof Copper.CoapMessage){
				return Copper.CoapMessageSerializer.serialize(res.setMid(req.mid).setToken(req.token));	
			}
			else {
				return Copper.CoapMessageSerializer.serialize(res(req));
			}
		}), "10.0.0.1", 312, settings, id);
	Copper.TimeUtils.clearTimeout(transmissionHandler.timer);
	transmissionHandler.bind();

	let requestHandler = new Copper.SingleRequestHandler(firstRequest, transmissionHandler, settings, id);
	requestHandler.start();

	assert.deepEqual(responses.length, nextResponseIdx);

	if (beforeClose !== undefined){
		for (let i=0; i<beforeClose.length; i++){
			beforeClose[i](requestHandler, lastEvent);
		}
	}

	assert.deepEqual(transmissionHandler.isTokenRegistered(requestHandler.coapMessage.token), false);
	transmissionHandler.close();
	Copper.Event.unregisterCallback(callback, id);
	return lastEvent;
};

QUnit.test("SingleRequestHandler: Simple Request", function(assert) {
	let firstRequest = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	let responses = [new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).setPayload(new ArrayBuffer(10))];
	let lastEvent = Copper.SingleRequestHandlerTest.runTest(assert, firstRequest, responses);
	assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_COMPLETED);
	Copper.TestUtils.checkCoapMessageEquality(assert, lastEvent.data.responseCoapMessage, responses[0]);
});

QUnit.test("SingleRequestHandler: Block Receive", function(assert) {
	let firstRequest = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	let responses = [
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).addOption(Copper.CoapMessage.OptionHeader.BLOCK2, new Copper.CoapMessage.BlockOption(0, 6, true)).setPayload(new ArrayBuffer(64)),
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).addOption(Copper.CoapMessage.OptionHeader.BLOCK2, new Copper.CoapMessage.BlockOption(1, 6, false)).setPayload(new ArrayBuffer(10))];
	let lastEvent = Copper.SingleRequestHandlerTest.runTest(assert, firstRequest, responses);
	assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_COMPLETED);
	assert.deepEqual(lastEvent.data.responseCoapMessage.payload.byteLength, 74);
});

QUnit.test("SingleRequestHandler: Block Receive Wrong Block", function(assert) {
	let firstRequest = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	let responses = [
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).addOption(Copper.CoapMessage.OptionHeader.BLOCK2, new Copper.CoapMessage.BlockOption(0, 6, true)).setPayload(new ArrayBuffer(64)),
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).addOption(Copper.CoapMessage.OptionHeader.BLOCK2, new Copper.CoapMessage.BlockOption(2, 6, false)).setPayload(new ArrayBuffer(10))];
	let lastEvent = Copper.SingleRequestHandlerTest.runTest(assert, firstRequest, responses);
	assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_RECEIVE_ERROR);
});

QUnit.test("SingleRequestHandler: Block Option Is Missing", function(assert) {
	let firstRequest = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET);
	let responses = [
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).addOption(Copper.CoapMessage.OptionHeader.BLOCK2, new Copper.CoapMessage.BlockOption(0, 6, true)).setPayload(new ArrayBuffer(64)),
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).setPayload(new ArrayBuffer(10))];
	let lastEvent = Copper.SingleRequestHandlerTest.runTest(assert, firstRequest, responses);
	assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_RECEIVE_ERROR);
});

QUnit.test("SingleRequestHandler: Blockwise Send", function(assert) {
	let firstRequest = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.PUT).setPayload(new ArrayBuffer(80));
	let responses = [
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTINUE).addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption(0, 6, true)),
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CHANGED).addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption(1, 6, false))];
	let lastEvent = Copper.SingleRequestHandlerTest.runTest(assert, firstRequest, responses);
	assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_COMPLETED);
});

QUnit.test("SingleRequestHandler: Blockwise Send Reduce Size", function(assert) {
	let firstRequest = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.PUT).setPayload(new ArrayBuffer(80));
	let responses = [
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTINUE).addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption(0, 5, true)),
		function(req){
			assert.deepEqual(req.getOption(Copper.CoapMessage.OptionHeader.BLOCK1)[0].num, 2);
			return new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CHANGED).setMid(req.mid).setToken(req.token).addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption(2, 5, false))}];
	let lastEvent = Copper.SingleRequestHandlerTest.runTest(assert, firstRequest, responses);
	assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_COMPLETED);
});

QUnit.test("SingleRequestHandler: Blockwise Send Request Entity too Large", function(assert) {
	let firstRequest = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.PUT).setPayload(new ArrayBuffer(80));
	let responses = [
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.REQUEST_ENTITY_TOO_LARGE).addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption(0, 5, true)),
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTINUE).addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption(0, 5, true)),
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTINUE).addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption(1, 5, true)),
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CHANGED).addOption(Copper.CoapMessage.OptionHeader.BLOCK1, new Copper.CoapMessage.BlockOption(2, 5, false))];
	let lastEvent = Copper.SingleRequestHandlerTest.runTest(assert, firstRequest, responses);
	assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_COMPLETED);
});

QUnit.test("SingleRequestHandler: Get Using Observe", function(assert) {
	let firstRequest = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET).addOption(Copper.CoapMessage.OptionHeader.OBSERVE, 0, true);
	let responses = [
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).setPayload(new ArrayBuffer(3))];
	let lastEvent = Copper.SingleRequestHandlerTest.runTest(assert, firstRequest, responses);
	assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_COMPLETED);
});

QUnit.test("SingleRequestHandler: Get Using Observe Accepted", function(assert) {
	let firstRequest = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET).addOption(Copper.CoapMessage.OptionHeader.OBSERVE, 0, true);
	let responses = [
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).addOption(Copper.CoapMessage.OptionHeader.OBSERVE, 3000, true).setPayload(new ArrayBuffer(3))];
	let settings = new Copper.Settings();
	let beforeClose = [
		function(requestHandler, lastEvent){
			assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_COMPLETED);
			requestHandler.handleResponse(firstRequest, new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).setPayload(new ArrayBuffer(3)));
		}];
	let lastEvent = Copper.SingleRequestHandlerTest.runTest(assert, firstRequest, responses, settings, beforeClose);
	assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_COMPLETED);
});

QUnit.test("SingleRequestHandler: Get Using Observe Canceled", function(assert) {
	let firstRequest = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET).addOption(Copper.CoapMessage.OptionHeader.OBSERVE, 0, true);
	let responses = [
		new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).addOption(Copper.CoapMessage.OptionHeader.OBSERVE, 3000, true).setPayload(new ArrayBuffer(3))];
	let settings = new Copper.Settings();
	let beforeClose = [
		function(requestHandler, lastEvent){
			assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_COMPLETED);
			requestHandler.cancel();
		}];
	let lastEvent = Copper.SingleRequestHandlerTest.runTest(assert, firstRequest, responses, settings, beforeClose);
	assert.deepEqual(lastEvent.type, Copper.Event.TYPE_REQUEST_CANCELED);
});
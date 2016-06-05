QUnit.test("ResponseMessageTransmission: General", function(assert) {
	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let conMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET).setMid(20466).setToken(Copper.ByteUtils.convertUintToBytes(234));
	let transmission = new Copper.ResponseMessageTransmission(conMsg, "10.3.2.1", 7832);
	let ackMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).setMid(20466).setToken(Copper.ByteUtils.convertUintToBytes(234)).setPayload(new ArrayBuffer(20));
	assert.deepEqual(transmission.addResponse(ackMsg).responses[0].payload.byteLength, 20);

	assert.deepEqual(transmission.isEndOfLife(), false);

	elapsedTime = 1000*Copper.CoapConstants.EXCHANGE_LIFETIME;
	assert.deepEqual(transmission.isEndOfLife(), false);
	elapsedTime++;
	assert.deepEqual(transmission.isEndOfLife(), true);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
});
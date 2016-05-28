QUnit.test("CoapMessage: Object", function(assert) {
	let conType = new Copper.CoapMessage.Type(0, "CON");
	let getCode = new Copper.CoapMessage.Code(1, "GET");
	let mid = 0x342;
	let token = Copper.ByteUtils.convertToByteArray("token");
	let payload = new ArrayBuffer(100);

	let msg = new Copper.CoapMessage(conType, getCode);
	msg.setMid(mid).setToken(token).setPayload(payload);
	
	assert.deepEqual(msg.type, conType);
	assert.deepEqual(msg.code, getCode);
	assert.deepEqual(msg.mid, mid);
	assert.deepEqual(msg.token, token);
	assert.deepEqual(msg.payload, payload);

	assert.throws(function(){
		msg.setMid(0x1FFFF);
	});
	assert.throws(function(){
		msg.setToken(new ArrayBuffer(10));
	});


	let uriOptionHeader = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 1, 255, false);
	let etagHeader = new Copper.CoapMessage.OptionHeader(4, "Etag", Copper.CoapMessage.OptionHeader.TYPE_OPAQUE, 1, 8, true);
	let maxAgeHeader = new Copper.CoapMessage.OptionHeader(14, "Max-Age", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 4, false, 60);

	assert.deepEqual(msg.getOption(uriOptionHeader), undefined);
	assert.deepEqual(msg.getOption(etagHeader), undefined);
	assert.deepEqual(msg.getOption(maxAgeHeader), 60); // default value

	msg.addOption(etagHeader, "0x4444");
	assert.deepEqual(msg.getOption(etagHeader), ["0x4444"]);

	msg.addOption(etagHeader, "0xF3F2F1F0");
	assert.deepEqual(msg.getOption(etagHeader), ["0x4444", "0xF3F2F1F0"]);

	msg.addOption(uriOptionHeader, "vs0.inf.ethz.ch").addOption(uriOptionHeader, "vs1.inf.ethz.ch", true);
	assert.deepEqual(msg.getOption(uriOptionHeader), ["vs1.inf.ethz.ch"]);

	assert.deepEqual(msg.getOptions(), [msg.options[uriOptionHeader.number], msg.options[etagHeader.number]]);
	assert.ok(msg.toString());

	// Empty message must not contain payload
	assert.throws(function(){
		new Copper.CoapMessage(conType, Copper.CoapMessage.Code.EMPTY).setToken(token);
	});
	assert.throws(function(){
		new Copper.CoapMessage(conType, Copper.CoapMessage.Code.EMPTY).addOption(etagHeader, "0x33");
	});
	assert.throws(function(){
		new Copper.CoapMessage(conType, Copper.CoapMessage.Code.EMPTY).setPayload(payload);
	});
});
QUnit.test("CoapMessageOption: Object, addByteValue", function(assert) {
	let optionHeader = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 2, 255, false);

	assert.deepEqual(new Copper.CoapMessage.Option(optionHeader), new Copper.CoapMessage.Option(optionHeader));
	assert.ok(new Copper.CoapMessage.Option(optionHeader).addByteValue(new ArrayBuffer(3)));

	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).addByteValue(new ArrayBuffer(3)).addByteValue(new ArrayBuffer(3));
	});
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).addByteValue(null);
	});
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).addByteValue("teststring");
	});
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).addByteValue(new ArrayBuffer(1));
	});


	optionHeader = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 0, 8, true);
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).addByteValue(new ArrayBuffer(10));
	});
	assert.ok(new Copper.CoapMessage.Option(optionHeader).addByteValue(new ArrayBuffer(3)).addByteValue(new ArrayBuffer(3)));
	assert.ok(new Copper.CoapMessage.Option(optionHeader).addByteValue(null));
});

QUnit.test("CoapMessageOption: values", function(assert) {
	let emptyHeader = new Copper.CoapMessage.OptionHeader(5, "If-None-Match", Copper.CoapMessage.OptionHeader.TYPE_EMPTY, 0, 0, false);
	assert.deepEqual(new Copper.CoapMessage.Option(emptyHeader).getValue(), []);
	assert.deepEqual(new Copper.CoapMessage.Option(emptyHeader).setValue(null).getValue(), [null]);
	assert.deepEqual(new Copper.CoapMessage.Option(emptyHeader).setValue(0).getValue(), [null]);
	assert.throws(function(){
		new Copper.CoapMessage.Option(emptyHeader).setValue("test");
	});

	let stringHeader = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 1, 255, false);
	assert.deepEqual(new Copper.CoapMessage.Option(stringHeader).setValue("http://vs0.inf.ethz.ch").getValue(), ["http://vs0.inf.ethz.ch"]);
	
	let opaqueHeader = new Copper.CoapMessage.OptionHeader(4, "Etag", Copper.CoapMessage.OptionHeader.TYPE_OPAQUE, 1, 8, true);
	assert.deepEqual(new Copper.CoapMessage.Option(opaqueHeader).getValue(), []);
	assert.deepEqual(new Copper.CoapMessage.Option(opaqueHeader).setValue("0x33").getValue(), ["0x33"]);
	assert.deepEqual(new Copper.CoapMessage.Option(opaqueHeader).setValue("0x33").addValue("0x34").getValue(), ["0x33", "0x34"]);

	let uintHeader = new Copper.CoapMessage.OptionHeader(7, "Uri-Port", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 2, false);
	assert.throws(function(){
		new Copper.CoapMessage.Option(uintHeader).setValue("0x33");
	});
	assert.deepEqual(new Copper.CoapMessage.Option(uintHeader).setValue(0x33).setValue(0x34).getValue(), [0x34]);

	let blockHeader = new Copper.CoapMessage.OptionHeader(23, "Block2", Copper.CoapMessage.OptionHeader.TYPE_BLOCK, 0, 3, false);
	let blockOption = new Copper.CoapMessage.BlockOption(0, 6, 1);
	assert.deepEqual(new Copper.CoapMessage.Option(blockHeader).setValue(blockOption).getValue(), [blockOption]);
	blockOption = new Copper.CoapMessage.BlockOption(0, 4, 0);
	assert.deepEqual(new Copper.CoapMessage.Option(blockHeader).setValue(blockOption).getValue(), [blockOption]);
	assert.throws(function(){
		new Copper.CoapMessage.Option(blockHeader).setValue(0);
	});
});

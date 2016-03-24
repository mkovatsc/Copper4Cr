QUnit.test("Option", function(assert) {
	let optionHeader = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 2, 255, false);

	assert.deepEqual(new Copper.CoapMessage.Option(optionHeader), new Copper.CoapMessage.Option(optionHeader));
	assert.ok(new Copper.CoapMessage.Option(optionHeader).setValue(new ArrayBuffer(3)));

	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).setValue(new ArrayBuffer(3)).addValue(new ArrayBuffer(3));
	});
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).setValue(null);
	});
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).setValue("teststring");
	});
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).setValue(new ArrayBuffer(1));
	});


	optionHeader = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 0, 8, true);
	assert.throws(function(){
		new Copper.CoapMessage.Option(optionHeader).setValue(new ArrayBuffer(10));
	});
	assert.ok(new Copper.CoapMessage.Option(optionHeader).setValue(new ArrayBuffer(3)).addValue(new ArrayBuffer(3)));
	assert.ok(new Copper.CoapMessage.Option(optionHeader).setValue(null));
});
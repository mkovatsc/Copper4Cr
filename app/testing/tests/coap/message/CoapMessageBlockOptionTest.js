QUnit.test("CoapMessageBlockOption: Object", function(assert) {
	let blockOption1 = new Copper.CoapMessage.BlockOption(10, 4, 1);
	assert.deepEqual(blockOption1.toString(), "10/16/1");

	assert.throws(function(){
		new Copper.CoapMessage.BlockOption(10, 3, 1);
	});
	assert.throws(function(){
		new Copper.CoapMessage.BlockOption(10, 5, 2);
	});

	assert.deepEqual(Copper.CoapMessage.BlockOption.convertUintToBlockOption(Copper.CoapMessage.BlockOption.convertBlockOptionToUint(blockOption1)), blockOption1);

	blockOption1 = new Copper.CoapMessage.BlockOption(0, 4, 0);
	assert.deepEqual(Copper.CoapMessage.BlockOption.convertBlockOptionToUint(blockOption1), 0);
	assert.deepEqual(Copper.CoapMessage.BlockOption.convertUintToBlockOption(Copper.CoapMessage.BlockOption.convertBlockOptionToUint(blockOption1)), blockOption1);

	blockOption1 = new Copper.CoapMessage.BlockOption(55, 10, 0);
	assert.deepEqual(Copper.CoapMessage.BlockOption.convertUintToBlockOption(Copper.CoapMessage.BlockOption.convertBlockOptionToUint(blockOption1)), blockOption1);
});
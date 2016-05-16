QUnit.test("CoapMessageSerializer: serialization", function(assert) {

	Copper.TestUtils.applyTestsOnDifferentCoapMessages([function(msg){
		let deserializeResult = Copper.CoapMessageSerializer.deserialize(Copper.CoapMessageSerializer.serialize(msg));
		assert.deepEqual(deserializeResult.error, undefined);
		assert.deepEqual(deserializeResult.warnings.length, 0);
		Copper.TestUtils.checkCoapMessageEquality(assert, deserializeResult.message, msg);
	}]);

    let msg = Copper.TestUtils.createCoapMessage();
    let ifNoneMatchHeader = new Copper.CoapMessage.OptionHeader(5, "If-None-Match", Copper.CoapMessage.OptionHeader.TYPE_EMPTY, 0, 0, false);
    let uriPortHeader = new Copper.CoapMessage.OptionHeader(7, "Uri-Port", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 2, true)
    
    msg.addOption(ifNoneMatchHeader);
    msg.addOption(uriPortHeader, 333);
    msg.addOption(uriPortHeader, 334);

    let deserializeResult = Copper.CoapMessageSerializer.deserialize(Copper.CoapMessageSerializer.serialize(msg));
    // set option of the message to the expected result (specified from the protocol)
    msg.removeOption(uriPortHeader);
    msg.addOption(new Copper.CoapMessage.OptionHeader(7, "Uri-Port", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 2, false), 333);

    Copper.TestUtils.checkCoapMessageEquality(assert, deserializeResult.message, msg);
    assert.deepEqual(deserializeResult.warnings.length, 1);
});
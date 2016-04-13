QUnit.test("CoapMessageType: getMessageType", function(assert) {
	assert.deepEqual(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Type.getType(0));
	assert.deepEqual(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Type.getTypeForName("ACK"));

	assert.throws(function(){
		Copper.CoapMessage.Type.getType(-1)
	});
	assert.throws(function(){
		Copper.CoapMessage.Type.getType("10");
	});
	assert.throws(function(){
		Copper.CoapMessage.Type.getTypeForName("CONFIRM");
	});
});
QUnit.test("ResponseTransaction: General", function(assert) {
	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let transaction = new Copper.ResponseTransaction(10, "10.3.2.1", 7832);
	assert.deepEqual(transaction.addResponse(new ArrayBuffer(2)).responses[0].byteLength, 2);

	assert.deepEqual(transaction.isEndOfLife(), false);

	elapsedTime = 1000*Copper.CoapConstants.EXCHANGE_LIFETIME;
	assert.deepEqual(transaction.isEndOfLife(), false);
	elapsedTime++;
	assert.deepEqual(transaction.isEndOfLife(), true);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
});
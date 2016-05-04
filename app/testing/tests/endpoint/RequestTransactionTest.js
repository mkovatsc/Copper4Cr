QUnit.test("RequestTransaction: NON-Transaction", function(assert) {
	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let transaction = new Copper.RequestTransaction(10, "0x0332", false, new ArrayBuffer(10));
	assert.deepEqual(transaction.isRetransmissionNecessary(), false);
	assert.throws(function(){
		transaction.increaseRetransmissionCounter();
	});
	assert.deepEqual(transaction.isTimeout(), false);
	assert.deepEqual(transaction.isEndOfLife(), false);

	elapsedTime = 1 + 500*Copper.CoapConstants.NON_TIMEOUT;
	assert.deepEqual(transaction.isTimeout(), false);
	assert.deepEqual(transaction.isEndOfLife(), false);

	elapsedTime = 1 + 1000*Copper.CoapConstants.NON_TIMEOUT;
	assert.deepEqual(transaction.isTimeout(), true);
	assert.deepEqual(transaction.isEndOfLife(), false);

	elapsedTime = 1 + 1000*Copper.CoapConstants.NON_LIFETIME;
	assert.deepEqual(transaction.isTimeout(), true);
	assert.deepEqual(transaction.isEndOfLife(), true);

	transaction.isCompleted = true;
	assert.deepEqual(transaction.isTimeout(), false);
	assert.deepEqual(transaction.isEndOfLife(), true);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
});

QUnit.test("RequestTransaction: CON-Transaction", function(assert) {
	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let transaction = new Copper.RequestTransaction(10, "0x0332", true, new ArrayBuffer(10));
	let minTimeout = 1000 * Copper.CoapConstants.ACK_TIMEOUT;
	let maxTimeout = 1000 * Copper.CoapConstants.ACK_TIMEOUT * Copper.CoapConstants.ACK_RANDOM_FACTOR;

	for (let i=0;i<Copper.CoapConstants.MAX_RETRANSMIT;i++){
		assert.deepEqual(transaction.isRetransmissionNecessary(), false);
		assert.deepEqual(transaction.timeout <= maxTimeout && transaction.timeout >= minTimeout, true);
		assert.deepEqual(transaction.isTimeout(), false);
		assert.deepEqual(transaction.isEndOfLife(), false);

		elapsedTime += transaction.timeout + 1;

		transaction.isCompleted = true;
		assert.deepEqual(transaction.isRetransmissionNecessary(), false);
		
		transaction.isCompleted = false;
		assert.deepEqual(transaction.isRetransmissionNecessary(), true);
		transaction.increaseRetransmissionCounter()
		assert.deepEqual(transaction.retransmissionCounter, i+1);
		minTimeout *= 2;
		maxTimeout *= 2;
	}
	assert.deepEqual(transaction.isTimeout(), false);
	assert.deepEqual(transaction.isEndOfLife(), false);
	assert.deepEqual(transaction.isRetransmissionNecessary(), false);
	
	elapsedTime += transaction.timeout/2 + 1;
	assert.deepEqual(transaction.isRetransmissionNecessary(), false);
	assert.deepEqual(transaction.isTimeout(), true);
	assert.deepEqual(transaction.isEndOfLife(), false);

	transaction.isCompleted = true;
	assert.deepEqual(transaction.isTimeout(), false);
	assert.deepEqual(transaction.isEndOfLife(), false);

	elapsedTime = 1000*Copper.CoapConstants.EXCHANGE_LIFETIME + 1;
	assert.deepEqual(transaction.isRetransmissionNecessary(), false);
	assert.deepEqual(transaction.isTimeout(), false);
	assert.deepEqual(transaction.isEndOfLife(), true);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
});
QUnit.test("TransactionSet: General", function(assert) {
	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let nonTransaction = new Copper.RequestTransaction(10, "0x03323", false, new ArrayBuffer(10));
	let conTransaction = new Copper.RequestTransaction(11, "0x033245", true, new ArrayBuffer(10));
	let resTransaction = new Copper.ResponseTransaction(12, "10.3.2.1", 7832);
	resTransaction.addResponse(new ArrayBuffer(2)).addResponse(new ArrayBuffer(5));

	let retransmissionCounter = 0;
	let timeoutCounter = 0;
	let endOfLifeCounter = 0;

	let transactionSet = new Copper.TransactionSet(function(transaction){retransmissionCounter++;}, function(transaction){timeoutCounter++;},
		                                           function(transaction){endOfLifeCounter++;})

	transactionSet.addNewTransaction(nonTransaction);
	transactionSet.addNewTransaction(conTransaction);
	transactionSet.addNewTransaction(resTransaction);

	assert.deepEqual(transactionSet.getTransactionCount(), 3);

	assert.throws(function(){
		transactionSet.addNewTransaction(new Copper.RequestTransaction(20, "0x03323", true, new ArrayBuffer(10)));
	});	
	assert.throws(function(){
		transactionSet.addNewTransaction(new Copper.RequestTransaction(11, "0x0332366", true, new ArrayBuffer(10)));
	});
	assert.throws(function(){
		transactionSet.addNewTransaction(new Copper.ResponseTransaction(12, "10.3.2.1", 7832));
	});		
	assert.deepEqual(transactionSet.isTokenRegistered("0x03323"), true);
	assert.throws(function(){
		transactionSet.unregisterToken("0x033245");
	});	
	transactionSet.unregisterToken("0x32");

	transactionSet.handleTransactions();
	assert.deepEqual(retransmissionCounter, 0);
	assert.deepEqual(timeoutCounter, 0);
	assert.deepEqual(endOfLifeCounter, 0);

	
	elapsedTime = 1 + conTransaction.timeout;

	for (let i=0; i<Copper.CoapConstants.MAX_RETRANSMIT; i++){
		transactionSet.handleTransactions();
		assert.deepEqual(retransmissionCounter, i + 1);
		assert.deepEqual(timeoutCounter, (elapsedTime > 1000*Copper.CoapConstants.NON_TIMEOUT ? 1 : 0));
		assert.deepEqual(endOfLifeCounter, 0);

		elapsedTime += 1 + conTransaction.timeout;
	}

	elapsedTime += conTransaction.timeout/2 + 1;
	transactionSet.handleTransactions();
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(timeoutCounter, 2);
	assert.deepEqual(endOfLifeCounter, 0);
	assert.deepEqual(transactionSet.getTransactionCount(), 3);

	elapsedTime = 1 + 1000*Copper.CoapConstants.NON_LIFETIME;
	transactionSet.handleTransactions();
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(timeoutCounter, 2);
	assert.deepEqual(endOfLifeCounter, 1);
	assert.deepEqual(transactionSet.getTransactionCount(), 2);


	elapsedTime = 1 + 1000*Copper.CoapConstants.EXCHANGE_LIFETIME;
	transactionSet.handleTransactions();
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(timeoutCounter, 2);
	assert.deepEqual(endOfLifeCounter, 3);

	transactionSet.unregisterToken("0x033245");
	assert.deepEqual(transactionSet.isTokenRegistered("0x033245"), false);

	elapsedTime = 0;

	conTransaction.isCompleted = false;
	transactionSet.addNewTransaction(conTransaction);
	transactionSet.getRequestTransaction(11, "0x033245").isCompleted = false;

	transactionSet.handleTransactions();
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	elapsedTime = 1 + conTransaction.timeout;

	transactionSet.handleTransactions();
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(transactionSet.getTransactionCount(), 1);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
});
QUnit.test("TransactionSet: General", function(assert) {
	// custom timer
	let oldNowFunction = Copper.TimeUtils.now;
	let timestamp = Copper.TimeUtils.now();
	let elapsedTime = 0;
	Copper.TimeUtils.now = function() {return timestamp + elapsedTime;};

	// Test
	let nonMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET).setMid(20465);
	let token = Copper.ByteUtils.convertUintToBytes(234);
	let conMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.CON, Copper.CoapMessage.Code.GET).setMid(20466).setToken(token);
	let ackMsg = new Copper.CoapMessage(Copper.CoapMessage.Type.ACK, Copper.CoapMessage.Code.CONTENT).setMid(20466).setToken(token).setPayload(new ArrayBuffer(20));
	let nonTransaction = new Copper.RequestTransaction(nonMsg);
	let conTransaction = new Copper.RequestTransaction(conMsg);
	let resTransaction = new Copper.ResponseTransaction(conMsg, "10.3.2.1", 7832);
	resTransaction.addResponse(ackMsg);

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
		// MID must not exist
		transactionSet.addNewTransaction(new Copper.RequestTransaction(new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET).setMid(20465).setToken(Copper.ByteUtils.convertUintToBytes(2535))));
	});	
	assert.throws(function(){
		// token must not exist
		transactionSet.addNewTransaction(new Copper.RequestTransaction(new Copper.CoapMessage(Copper.CoapMessage.Type.NON, Copper.CoapMessage.Code.GET).setMid(51).setToken(token)));
	});
	assert.throws(function(){
		// MID must not exist
		transactionSet.addNewTransaction(new Copper.ResponseTransaction(conMsg, "10.3.2.1", 7832));
	});		
	assert.deepEqual(transactionSet.isTokenRegistered(token), true);
	assert.throws(function(){
		transactionSet.unregisterToken(token);
	});	
	transactionSet.unregisterToken(Copper.ByteUtils.convertUintToBytes(25353));

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
	transactionSet.unregisterTokenFromTransaction(nonTransaction);
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(timeoutCounter, 2);
	assert.deepEqual(endOfLifeCounter, 1);
	assert.deepEqual(transactionSet.getTransactionCount(), 2);


	elapsedTime = 1 + 1000*Copper.CoapConstants.EXCHANGE_LIFETIME;
	transactionSet.handleTransactions();
	transactionSet.unregisterTokenFromTransaction(conTransaction);
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(timeoutCounter, 2);
	assert.deepEqual(endOfLifeCounter, 3);
	assert.deepEqual(transactionSet.registeredTokens, new Object());

	transactionSet.unregisterToken(token);
	assert.deepEqual(transactionSet.isTokenRegistered(token), false);

	elapsedTime = 0;

	conTransaction.isCompleted = false;
	transactionSet.addNewTransaction(conTransaction);
	transactionSet.getRequestTransaction(20466, token).isCompleted = false;

	transactionSet.handleTransactions();
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	elapsedTime = 1 + conTransaction.timeout;

	transactionSet.handleTransactions();
	assert.deepEqual(retransmissionCounter, Copper.CoapConstants.MAX_RETRANSMIT);
	assert.deepEqual(transactionSet.getTransactionCount(), 1);

	// reset timer
	Copper.TimeUtils.now = oldNowFunction;
});
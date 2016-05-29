/*
* Creates a new transaction set which is capable of handling the different transactions. Handlers for the different
* events can be passed, but are optional 
* @arg onRetransmission: function(transaction, retransmissionCount) --> called for a transaction that should be retransmitted
* @arg onTimeout: function(transaction) --> called for a transaction that has timeouted
* @arg onEndOfLife: function(transaction) --> called for a transaction that is end of life and thus removed
*/
Copper.TransactionSet = function(onRetransmission, onTimeout, onEndOfLife){
	if ((onRetransmission !== undefined && typeof(onRetransmission) !== "function") ||
		    (onTimeout !== undefined && typeof(onTimeout) !== "function") ||
		    (onEndOfLife !== undefined && typeof(onEndOfLife) !== "function")){
		throw new Error("Illegal Argument")
	}
	this.onRetransmission = onRetransmission;
	this.onTimeout = onTimeout;
	this.onEndOfLife = onEndOfLife;
	this.reset();
	this.isHandlingTransactions = false;
};

/* Prototype */
Copper.TransactionSet.prototype.onRetransmission = undefined;
Copper.TransactionSet.prototype.onTimeout = undefined;
Copper.TransactionSet.prototype.onEndOfLife = undefined;
Copper.TransactionSet.prototype.registeredTokens = undefined;
Copper.TransactionSet.prototype.activeRequestTransactions = undefined;
Copper.TransactionSet.prototype.timeoutedRequestTransactions = undefined;
Copper.TransactionSet.prototype.responseTransactions = undefined;
Copper.TransactionSet.prototype.isHandlingTransactions = undefined;

/*
* Clears the transaction set
*/
Copper.TransactionSet.prototype.reset = function(){
	this.registeredTokens = new Object();
	this.activeRequestTransactions = [];
	this.timeoutedRequestTransactions = [];
	this.responseTransactions = [];
};

/**
* Registers a token with a given object
*/
Copper.TransactionSet.prototype.registerToken = function(token, objectToRegister){
	if (!(token instanceof ArrayBuffer) || objectToRegister === undefined){
		throw new Error("Illegal Argument");
	}
	this.registeredTokens[Copper.ByteUtils.convertBytesToHexString(token)] = objectToRegister;
};

/**
* @arg token as ArrayBuffer
* @return: whether the token is in use
*/
Copper.TransactionSet.prototype.isTokenRegistered = function(token){
	if (!(token instanceof ArrayBuffer)){
		throw new Error("Illegal Argument");
	}
	return this.registeredTokens[Copper.ByteUtils.convertBytesToHexString(token)] !== undefined;
};

/**
* @arg token as ArrayBuffer
* @return: object registered with the given token
*/
Copper.TransactionSet.prototype.getRegisteredObjectForToken = function(token){
	if (!(token instanceof ArrayBuffer)){
		throw new Error("Illegal Argument");
	}
	return this.registeredTokens[Copper.ByteUtils.convertBytesToHexString(token)];
};

/**
* Removes the token from the set of registered tokens. Is only allowed if the transaction has finished.
* @arg token
*/
Copper.TransactionSet.prototype.unregisterToken = function(token){
	if (!(token instanceof ArrayBuffer)){
		throw new Error("Illegal Argument");
	}
	let tokenStr = Copper.ByteUtils.convertBytesToHexString(token);
	if (this.registeredTokens[tokenStr] !== undefined){
		delete this.registeredTokens[tokenStr];
	}
};

/**
* Adds a new transaction to this set and registers the token.
* @arg transaction: Transaction which is not end of life and has a unique token and a unique mid
*/
Copper.TransactionSet.prototype.addNewTransaction = function(transaction){
	if ((!(transaction instanceof Copper.RequestTransaction) && !(transaction instanceof Copper.ResponseTransaction)) || transaction.isEndOfLife()){
		throw new Error("Illegal Argument");
	}
	if (transaction instanceof Copper.RequestTransaction){
		if (this.getRequestTransaction(transaction.coapMessage.mid, undefined) !== undefined){
			throw new Error("Duplicate MID");
		}
		this.activeRequestTransactions.push(transaction);
	}
	else {
		if (this.getResponseTransaction(transaction.coapMessage.mid, transaction.remoteAddress, transaction.remotePort) !== undefined){
			throw new Error("Duplicate Transaction");
		}
		this.responseTransactions.push(transaction);
	}
};

/**
* @arg mid: message id
* @arg token: token as an ArrayBuffer (optional)
* @return: first transaction that matches mid and token.
*/
Copper.TransactionSet.prototype.getRequestTransaction = function(mid, token){
	if (!Number.isInteger(mid) || mid < 0 || mid > 0xFFFF){
		throw new Error("Illegal Argument");
	}
	let tokenStr = token !== undefined ? Copper.ByteUtils.convertBytesToHexString(token) : undefined;
	let transactions = this.activeRequestTransactions.concat(this.timeoutedRequestTransactions);
	for (let i=0; i<transactions.length; i++){
		if (mid === transactions[i].coapMessage.mid && (tokenStr === undefined || tokenStr === Copper.ByteUtils.convertBytesToHexString(transactions[i].coapMessage.token))){
			return transactions[i];
		}
	}
	return undefined;
};

/**
* @arg mid: message id
* @arg remoteAddress: remoteAddress
* @arg remotePort: remotePort
* @return: first matching transaction, undefined if none matches
*/
Copper.TransactionSet.prototype.getResponseTransaction = function(mid, remoteAddress, remotePort){
	if (!Number.isInteger(mid) || mid < 0 || mid > 0xFFFF || typeof(remoteAddress) !== "string" 
		     || !Number.isInteger(remotePort) || remotePort <= 0x0 || remotePort > 0xFFFF){
		throw new Error("Illegal argument");
	}
	for (let i=0; i<this.responseTransactions.length; i++){
		if (mid === this.responseTransactions[i].coapMessage.mid && remoteAddress === this.responseTransactions[i].remoteAddress && remotePort === this.responseTransactions[i].remotePort){
			return this.responseTransactions[i];
		}
	}
	return undefined;
};

/*
* @return number of transactions in this set
*/
Copper.TransactionSet.prototype.getTransactionCount = function(){
	return this.activeRequestTransactions.length + this.timeoutedRequestTransactions.length + this.responseTransactions.length;
};


/*
* Checks each transaction if an action is necessary and calls the callback if this is the case
*/
Copper.TransactionSet.prototype.handleTransactions = function(){
	if (!this.isHandlingTransactions){
		this.isHandlingTransactions = true;
		try {
			this.handleRetransmissionNecessaryTransactions();
			this.handleTimeoutedTransactions();
			this.handleEndOfLifeTransactions();
		} finally {
			this.isHandlingTransactions = false;
		}
	}
};

/** Implementation **/
// Calls the onRetransmission callback for each transaction that needs retransmission and increases the retransmission counter
Copper.TransactionSet.prototype.handleRetransmissionNecessaryTransactions = function(){
	for (let i=0; i<this.activeRequestTransactions.length;i++){
		if (this.activeRequestTransactions[i].isRetransmissionNecessary()){
			this.activeRequestTransactions[i].increaseRetransmissionCounter();
			if (this.onRetransmission !== undefined) this.onRetransmission(this.activeRequestTransactions[i]);
		}
	}
};

// Calls the onTimeout callback on each transaction that timeouted
Copper.TransactionSet.prototype.handleTimeoutedTransactions = function(){
	let oldActiveRequestTransactions = this.activeRequestTransactions;
	this.activeRequestTransactions = [];
	for (let i=0; i<oldActiveRequestTransactions.length;i++){
		if (!oldActiveRequestTransactions[i].isTimeout()){
			this.activeRequestTransactions.push(oldActiveRequestTransactions[i]);
		}
		else {
			this.timeoutedRequestTransactions.push(oldActiveRequestTransactions[i]);
			if (this.onTimeout !== undefined) this.onTimeout(oldActiveRequestTransactions[i]);
		}
	}
};

// Removes the transactions which are endOfLife after calling the endOfLife callback 
Copper.TransactionSet.prototype.handleEndOfLifeTransactions = function(){
	this.activeRequestTransactions = this.getNonEndOfLifeTransactions(this.activeRequestTransactions);
	this.timeoutedRequestTransactions = this.getNonEndOfLifeTransactions(this.timeoutedRequestTransactions);
	this.responseTransactions = this.getNonEndOfLifeTransactions(this.responseTransactions);
};

// Returns the transactions from transactionList which are not endOfLife. Calls the onEndOfLife callback on the others
Copper.TransactionSet.prototype.getNonEndOfLifeTransactions = function(transactionList){
	let nonEndOfLifeTransactions = [];
	for (let i=0; i<transactionList.length; i++){
		if (!transactionList[i].isEndOfLife()){
			nonEndOfLifeTransactions.push(transactionList[i]);
		}
		else {
			if (this.onEndOfLife !== undefined) {this.onEndOfLife(transactionList[i]);}
		}
	}
	return nonEndOfLifeTransactions;
};
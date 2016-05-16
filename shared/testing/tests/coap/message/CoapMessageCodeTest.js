QUnit.test("CoapMessageCode: RequestCode", function(assert) {
	let post = new Copper.CoapMessage.Code(2, "POST");
	
	assert.deepEqual(post.getName(), "POST");
	assert.deepEqual(post.getShortcode(), "POST");
	assert.deepEqual(post.isRequestCode(), true);
	assert.deepEqual(post.isResponseCode(), false);
	assert.deepEqual(post.isSuccessCode(), false);
	assert.deepEqual(post.isClientErrorCode(), false);
	assert.deepEqual(post.isServerErrorCode(), false);

	assert.deepEqual(Copper.CoapMessage.Code.getCode(2), post);
	assert.deepEqual(Copper.CoapMessage.Code.getCode(2).equals(post), true);
	assert.deepEqual(Copper.CoapMessage.Code.getCodeForName("POST"), post);
	assert.deepEqual(Copper.CoapMessage.Code.getCodeForShortcode("POST"), post);

	assert.throws(function() {
		Copper.CoapMessage.Code.getCode(8);
	});
});

QUnit.test("CoapMessageCode: SuccessCode", function(assert) {
	let deleted = new Copper.CoapMessage.Code(66, "Deleted");
	
	assert.deepEqual(deleted.getName(), "2.02 Deleted");
	assert.deepEqual(deleted.getShortcode(), "2.02");
	assert.deepEqual(deleted.isRequestCode(), false);
	assert.deepEqual(deleted.isResponseCode(), true);
	assert.deepEqual(deleted.isSuccessCode(), true);
	assert.deepEqual(deleted.isClientErrorCode(), false);
	assert.deepEqual(deleted.isServerErrorCode(), false);

	assert.deepEqual(Copper.CoapMessage.Code.getCode(66), deleted);
	assert.deepEqual(Copper.CoapMessage.Code.getCodeForName("2.02 Deleted"), deleted);
	assert.deepEqual(Copper.CoapMessage.Code.getCodeForShortcode("2.02"), deleted);

	assert.deepEqual(Copper.CoapMessage.Code.getCode(75), new Copper.CoapMessage.Code(64, "Success (Unknown Code)"));

	assert.throws(function() {
		Copper.CoapMessage.Code.getCodeForName("Success");
	});
	assert.throws(function() {
		Copper.CoapMessage.Code.getCodeForShortcode("Success");
	});
	assert.throws(function() {
		Copper.CoapMessage.Code.getCode(97);
	});
	assert.throws(function() {
		Copper.CoapMessage.Code.getCode(225);
	});
});

QUnit.test("CoapMessageCode: ClientErrorCode", function(assert) {
	let forbidden = new Copper.CoapMessage.Code(131, "Forbidden");
	
	assert.deepEqual(forbidden.isRequestCode(), false);
	assert.deepEqual(forbidden.isResponseCode(), true);
	assert.deepEqual(forbidden.isSuccessCode(), false);
	assert.deepEqual(forbidden.isClientErrorCode(), true);
	assert.deepEqual(forbidden.isServerErrorCode(), false);

	assert.deepEqual(Copper.CoapMessage.Code.getCode(131), forbidden);

	assert.deepEqual(Copper.CoapMessage.Code.getCode(145), new Copper.CoapMessage.Code(128, "Bad Request"));
});

QUnit.test("CoapMessageCode: ServerErrorCode", function(assert) {
	let badGateway = new Copper.CoapMessage.Code(162, "Bad Gateway");
	
	assert.deepEqual(badGateway.isRequestCode(), false);
	assert.deepEqual(badGateway.isResponseCode(), true);
	assert.deepEqual(badGateway.isSuccessCode(), false);
	assert.deepEqual(badGateway.isClientErrorCode(), false);
	assert.deepEqual(badGateway.isServerErrorCode(), true);

	assert.deepEqual(Copper.CoapMessage.Code.getCode(162), badGateway);

	assert.deepEqual(Copper.CoapMessage.Code.getCode(175), new Copper.CoapMessage.Code(160, "Internal Server Error"));
});

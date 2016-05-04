QUnit.test("TimeUtils: general", function(assert) {
	let oldTimestamp = new Date().getTime();
	assert.deepEqual(Copper.TimeUtils.now() >= oldTimestamp, true);

	let done = assert.async(1);
	Copper.TimeUtils.setTimeout(function(){
		assert.deepEqual(Copper.TimeUtils.isOlderThan(oldTimestamp, 1), true);
		done();
	}, 2);

	let callbackId = Copper.TimeUtils.setTimeout(function(){
		done();
	}, 2);
	Copper.TimeUtils.clearTimeout(callbackId);
});
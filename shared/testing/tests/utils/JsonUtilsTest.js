QUnit.test("JsonUtils: ArrayBuffer", function(assert) {
	let data = new Uint8Array([23, 21, 42, 254]).buffer;
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
});

QUnit.test("JsonUtils: Settings", function(assert) {
	let data = new Copper.Settings();
	data.blockSize = 0;
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
	assert.deepEqual((Copper.JsonUtils.parse(json) instanceof Copper.Settings), true);
});

QUnit.test("JsonUtils: CoapMessage", function(assert) {
	Copper.TestUtils.applyTestsOnDifferentCoapMessages([function(msg){
		Copper.TestUtils.checkCoapMessageEquality(assert, Copper.JsonUtils.parse(Copper.JsonUtils.stringify(msg)), msg);
	}]);
	let msg = Copper.TestUtils.createCoapMessage();
	msg.mid = undefined;
	Copper.TestUtils.checkCoapMessageEquality(assert, Copper.JsonUtils.parse(Copper.JsonUtils.stringify(msg)), msg);
});

QUnit.test("JsonUtils: General", function(assert) {
	let data = {
		t1: 2,
		t2: "blah",
		t3: null,
		t4: {
			t10: 2,
			t11: 3.132,
			t12: null
		}
	};
	let json = Copper.JsonUtils.stringify(data);
	assert.deepEqual(Copper.JsonUtils.parse(json), data);
});
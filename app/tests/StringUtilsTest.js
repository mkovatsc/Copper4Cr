QUnit.test("lpadTest", function(assert) {
	assert.deepEqual(Copper.StringUtils.lpad("teststring", 3), "tes");
	assert.deepEqual(Copper.StringUtils.lpad("Teststring", 3), "Tes");
	assert.deepEqual(Copper.StringUtils.lpad("", 3), "000");
	assert.deepEqual(Copper.StringUtils.lpad(null, 3), "000");
	assert.deepEqual(Copper.StringUtils.lpad(null, 3, "a"), "aaa");
	assert.deepEqual(Copper.StringUtils.lpad("test", 0), "");
	assert.deepEqual(Copper.StringUtils.lpad("12", 3), "012");
	assert.deepEqual(Copper.StringUtils.lpad("12", 4), "0012");
	assert.deepEqual(Copper.StringUtils.lpad("12", 4, "a"), "aa12");
	assert.deepEqual(Copper.StringUtils.lpad("12", 4, ""), "0012");
	assert.deepEqual(Copper.StringUtils.lpad("12", 4, null), "0012");

	assert.throws(function(){
		Copper.StringUtils.lpad("12", "b", "a")
	});
	assert.throws(function(){
		Copper.StringUtils.lpad("12", 4, "ab")
	});
});

QUnit.test("GetDateTimeTest", function(assert) {
	assert.ok(Copper.StringUtils.getDateTime().match("^\\d\\d\\.\\d\\d\\.20\\d\\d [0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d\\d\\d$"), "getDateTime format");
});
QUnit.test("CoapMessageOptionHeader: Object", function(assert) {
	let uriHost = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 1, 255, false);
	let etag = new Copper.CoapMessage.OptionHeader(4, "Etag", Copper.CoapMessage.OptionHeader.TYPE_OPAQUE, 1, 8, true);
	let size1 = new Copper.CoapMessage.OptionHeader(60, "Size1", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 4, false);

	assert.deepEqual(uriHost.isCritical(), true);
	assert.deepEqual(etag.isCritical(), false);

	assert.deepEqual(uriHost.isUnsafe(), true);
	assert.deepEqual(etag.isUnsafe(), false);

	assert.deepEqual(uriHost.isNoCacheKey(), false);
	assert.deepEqual(size1.isNoCacheKey(), true);

	assert.deepEqual(uriHost.clone(), uriHost);
});

QUnit.test("CoapMessageOptionHeader: getOptionHeader", function(assert) {
	assert.deepEqual(Copper.CoapMessage.OptionHeader.IF_MATCH, Copper.CoapMessage.OptionHeader.getOptionHeader(1));
	assert.deepEqual(Copper.CoapMessage.OptionHeader.SIZE1, Copper.CoapMessage.OptionHeader.getOptionHeader(60));
	assert.deepEqual("Unknown", Copper.CoapMessage.OptionHeader.getOptionHeader(10).name);

	let size1 = new Copper.CoapMessage.OptionHeader(60, "Size1", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 4, false);
	let regSize1 = Copper.CoapMessage.OptionHeader.getOptionHeader(60);
	regSize1.name = "UpdateSize1";
	assert.notEqual(size1, regSize1);
	assert.deepEqual(size1, Copper.CoapMessage.OptionHeader.getOptionHeader(60));

	assert.throws(function(){
		Copper.CoapMessage.OptionHeader.getOptionHeader(-1);
	});
	assert.throws(function(){
		Copper.CoapMessage.OptionHeader.getOptionHeader("10");
	});
});

QUnit.test("CoapMessageOptionHeader: getOptionHeaderForName", function(assert) {
	assert.deepEqual(Copper.CoapMessage.OptionHeader.IF_MATCH, Copper.CoapMessage.OptionHeader.getOptionHeaderForName("If-Match"));
	assert.deepEqual("Unknown", Copper.CoapMessage.OptionHeader.getOptionHeaderForName("Something").name);
	assert.deepEqual(Copper.CoapMessage.OptionHeader.SIZE1, Copper.CoapMessage.OptionHeader.getOptionHeaderForName("Size1"));
});	
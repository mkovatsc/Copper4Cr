QUnit.test("ByteUtils: mergeByteArrays", function(assert) {
	assert.deepEqual(Copper.ByteUtils.mergeByteArrays([null, null]), new ArrayBuffer(0));
	assert.deepEqual(Copper.ByteUtils.mergeByteArrays([new ArrayBuffer(3), null, new ArrayBuffer(5)]), new ArrayBuffer(8));

	assert.throws(function(){
		Copper.ByteUtils.mergeByteArrays(3.3);
	});
	assert.throws(function(){
		Copper.ByteUtils.mergeByteArrays([new ArrayBuffer(3), 3.3]);
	});
});

QUnit.test("ByteUtils: toByteArray", function(assert) {
	
	assert.throws(function(){
		Copper.ByteUtils.toByteArray(3.3);
	});
});

QUnit.test("ByteUtils: convertUintToBytes", function(assert) {
	
	let b3 = Copper.ByteUtils.convertUintToBytes(3);
	let b0 = Copper.ByteUtils.convertUintToBytes(0);
	let b53534786 = Copper.ByteUtils.convertUintToBytes(53534786);
	let bfff3 = Copper.ByteUtils.convertUintToBytes(0xF3F2F1F0);

	assert.deepEqual(Copper.ByteUtils.convertBytesToUint(b3), 3);
	assert.deepEqual(Copper.ByteUtils.convertBytesToUint(b0), 0);
	assert.deepEqual(Copper.ByteUtils.convertBytesToUint(b53534786), 53534786);
	assert.deepEqual(Copper.ByteUtils.convertBytesToUint(bfff3), 0xF3F2F1F0);
	
	let b0b3 = Copper.ByteUtils.mergeByteArrays([b0, b3]);
	assert.deepEqual(Copper.ByteUtils.convertBytesToUint(b0b3, 0), 3);
	
	assert.throws(function(){
		Copper.ByteUtils.convertBytesToUint(b0b3, 8);
	});
	assert.throws(function(){
		Copper.ByteUtils.convertUintToBytes("test");
	});
	assert.throws(function(){
		Copper.ByteUtils.convertUintToBytes(-1);
	});
	assert.throws(function(){
		Copper.ByteUtils.convertBytesToUint("test");
	});
});


QUnit.test("ByteUtils: convertStringToBytes", function(assert) {
	
	let asciiString = "Test//{}  " + String.fromCharCode(127) + String.fromCharCode(0); 
	let utf8String = "Mit Sönderzeichen: r!èÌਬ䊬" + String.fromCharCode(127) + String.fromCharCode(128) + String.fromCharCode(2047) + String.fromCharCode(2048) + String.fromCharCode(65535) + String.fromCharCode(65536);

	let asciiBytes = Copper.ByteUtils.convertStringToBytes(asciiString);
	let utf8Bytes = Copper.ByteUtils.convertStringToBytes(utf8String);

	assert.deepEqual(Copper.ByteUtils.convertBytesToString(asciiBytes), asciiString);
	assert.deepEqual(Copper.ByteUtils.convertBytesToString(utf8Bytes), utf8String);

	asciiBytes = Copper.ByteUtils.convertStringToBytes(asciiString, true, true);
	assert.deepEqual(Copper.ByteUtils.convertBytesToString(asciiBytes, undefined, undefined, true, true), asciiString);

	assert.throws(function(){
		Copper.ByteUtils.convertStringToBytes(utf8String, true, true);
	});
	assert.throws(function(){
		Copper.ByteUtils.convertBytesToString(utf8Bytes, undefined, undefined, true, true);
	});

	assert.deepEqual(Copper.ByteUtils.convertBytesToString(utf8Bytes, 4), utf8String.substring(4));
	assert.deepEqual(Copper.ByteUtils.convertBytesToString(utf8Bytes, 4, 3), utf8String.substring(4, 6));
	assert.deepEqual(Copper.ByteUtils.convertBytesToString(utf8Bytes, 4, 2), utf8String.substring(4, 5));

	assert.throws(function(){
		Copper.ByteUtils.convertBytesToString(utf8Bytes, 4, 2, false, true);
	});

	utf8String = "M!èÌਬ䊬.";
	utf8Bytes = Copper.ByteUtils.convertStringToBytes(utf8String, undefined, undefined, true, false);	
	assert.deepEqual(Copper.ByteUtils.convertBytesToString(utf8Bytes, undefined, undefined, true, false), "M!.");

	let invBytes1 = new Uint8Array(1);
	invBytes1[0] = 0xBF;
	let invBytes2 = new Uint8Array(2);
	invBytes2[0] = 0xC4;
	invBytes2[1] = 0xC4;
	let invBytes3 = new Uint8Array(2);
	invBytes3[0] = 0xC4;
	invBytes3[1] = 0x64;
	let corruptUtf8 = Copper.ByteUtils.mergeByteArrays([invBytes1.buffer, asciiBytes, invBytes2.buffer, utf8Bytes, invBytes3.buffer]);

	assert.deepEqual(Copper.ByteUtils.convertBytesToString(corruptUtf8), asciiString + utf8String + String.fromCharCode(0x64));

	assert.throws(function(){
		Copper.ByteUtils.convertBytesToString(corruptUtf8, 0, 2, false, true);
	});
	assert.throws(function(){
		Copper.ByteUtils.convertBytesToString(corruptUtf8, 0, 2, false, true);
	});
	assert.throws(function(){
		Copper.ByteUtils.convertBytesToString(corruptUtf8, 2, 15, false, true);
	});
	assert.throws(function(){
		Copper.ByteUtils.convertBytesToString(corruptUtf8, 16, undefined, false, true);
	});
});

QUnit.test("ByteUtils: convertBytesToHexString", function(assert) {
	let str = String.fromCharCode(127) + String.fromCharCode(128) + String.fromCharCode(2047);
	assert.deepEqual(Copper.ByteUtils.convertBytesToHexString(Copper.ByteUtils.convertStringToBytes(str)), "0x7FC280DFBF");
	let num = 232414325;
	assert.deepEqual(Copper.ByteUtils.convertBytesToHexString(Copper.ByteUtils.convertUintToBytes(num)), "0x" + num.toString(16).toUpperCase());
});
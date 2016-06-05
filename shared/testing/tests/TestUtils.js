Copper.TestUtils = function(){
};

Copper.TestUtils.checkCoapMessageEquality = function(assert, res, exp){
	// general elements
	assert.deepEqual((res instanceof Copper.CoapMessage), true);
	assert.deepEqual(res, exp);
	assert.deepEqual(Copper.ByteUtils.convertBytesToHexString(res.token), Copper.ByteUtils.convertBytesToHexString(exp.token));

	// options
	let resOpts = res.getOptions();
	let origOpts = exp.getOptions();
	assert.deepEqual(resOpts, origOpts);
	for (let i=0; i<resOpts.length; i++){
		assert.deepEqual(resOpts[i].getValue(), origOpts[i].getValue());
	}

	// payload
	assert.deepEqual(Copper.ByteUtils.convertBytesToHexString(res.payload), Copper.ByteUtils.convertBytesToHexString(exp.payload));		
};

Copper.TestUtils.createCoapMessage = function(){
	return new Copper.CoapMessage(
						new Copper.CoapMessage.Type(0, "CON"), 
						new Copper.CoapMessage.Code(1, "GET")).
						setMid(0x33).
						setToken(Copper.ByteUtils.convertToByteArray("token")).
						setPayload(new Uint8Array([2, 10, 3, 5, 245, 10, 244]).buffer);
};

Copper.TestUtils.applyTestsOnDifferentCoapMessages = function(tests){
	let creator = function(){
		return Copper.TestUtils.createCoapMessage();
	};
	let applier = function(msg){
		for (let i=0; i<tests.length; i++){
			tests[i](msg);
		}
	};
	applier(creator().setPayload(new ArrayBuffer(0)));
	applier(creator().setToken(new ArrayBuffer(0)));
	applier(creator().setToken(new Uint8Array([2, 4, 5, 6, 1, 2, 3, 4]).buffer));

	let uriOptionHeader = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 1, 255, false);
	let etagHeader = new Copper.CoapMessage.OptionHeader(4, "Etag", Copper.CoapMessage.OptionHeader.TYPE_OPAQUE, 1, 8, true);
	let maxAgeHeader = new Copper.CoapMessage.OptionHeader(14, "Max-Age", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 4, false, 60);
	let bigHeader = new Copper.CoapMessage.OptionHeader(305, "Unknown", Copper.CoapMessage.OptionHeader.TYPE_OPAQUE, 0, Number.MAX_VALUE, true);
	let ifNoneMatchHeader = new Copper.CoapMessage.OptionHeader(5, "If-None-Match", Copper.CoapMessage.OptionHeader.TYPE_EMPTY, 0, 0, false);
    let uriPortHeader = new Copper.CoapMessage.OptionHeader(7, "Uri-Port", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 2, true);
    let block2Header = new Copper.CoapMessage.OptionHeader(23, "Block2", Copper.CoapMessage.OptionHeader.TYPE_BLOCK, 0, 3, false);

    applier(creator().addOption(etagHeader, "0x4444"));
    applier(creator().addOption(uriOptionHeader, "vs0.inf.ethz.ch").addOption(uriOptionHeader, "vs1.inf.ethz.ch", true).addOption(etagHeader, "0xF3F2F1F0"));
	applier(creator().addOption(bigHeader, new ArrayBuffer(306)).addOption(bigHeader, new ArrayBuffer(400)));
	
	applier(creator().addOption(etagHeader, "0x42312").addOption(ifNoneMatchHeader));
	applier(creator().addOption(block2Header, new Copper.CoapMessage.BlockOption(1, 4, 1)));
};

/**
* Generates a mocking udp client
* packetHandler: function(datagram) -> datagram: 
*    transforms the received packet into a response (should be undefined if no response is set)
*/
Copper.TestUtils.generateUdpClientMock = function(packetHandler){
	return {
		bind: function(onBind, onReceive, onReceiveError){
		      	this.onReceive = onReceive;
		      	this.onReceiveError = onReceiveError;
		      	onBind(true, 1234, undefined);
		      },
		send: function(datagram, remoteAddress, remotePort, onSent){
				if (onSent !== undefined) onSent(true, datagram.byteLength, true, undefined);
				let response = packetHandler(datagram);
				if (response !== undefined) this.onReceive(response, remoteAddress, remotePort);
			  },
	    close: function(){
	    	  }
	};
};

Copper.TestUtils.generateRequestHandlerMock = function(){
	return {
		handleResponse: function(sentCoapMessage, receivedCoapMessage, responseTransmission){
			if (Copper.CoapMessage.Type.CON.equals(receivedCoapMessage.type)){
				responseTransmission.addResponse(Copper.CoapMessage.ack(receivedCoapMessage.mid, receivedCoapMessage.token));
			}
		},
		onTimeout: function(){
			
		}
	};
};
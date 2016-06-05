Copper.PayloadAdapter = function(){
};

Copper.PayloadAdapter.visiblePane = undefined;
Copper.PayloadAdapter.currentBlockNumber = undefined;

Copper.PayloadAdapter.setVisiblePane = function(element){
	if (Copper.PayloadAdapter.visiblePane !== element){
		Copper.PayloadAdapter.visiblePane.classList.add("hidden");
		Copper.PayloadAdapter.visiblePane.classList.remove("visible");
		element.classList.add("visible");
		element.classList.remove("hidden");
		Copper.PayloadAdapter.visiblePane = element;
	}
};

Copper.PayloadAdapter.init = function(){
	Copper.PayloadAdapter.visiblePane = document.getElementById("copper-payload-tab-in");

	document.getElementById("copper-payload-btn-in").onclick = function(){
		Copper.PayloadAdapter.setVisiblePane(document.getElementById("copper-payload-tab-in"));
	};
	document.getElementById("copper-payload-btn-rendered").onclick = function(){
		Copper.PayloadAdapter.setVisiblePane(document.getElementById("copper-payload-tab-rendered"));
	};
	document.getElementById("copper-payload-btn-out").onclick = function(){
		Copper.PayloadAdapter.setVisiblePane(document.getElementById("copper-payload-tab-out"));
		document.getElementById("copper-payload-tab-out").focus();
	};
};

Copper.PayloadAdapter.onEvent = function(event){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			Copper.PayloadAdapter.updateIncomingPayload(event.data.coapMessage);
	}
};

Copper.PayloadAdapter.updateIncomingPayload = function(coapMessage){
	let append = false;

	let block2Option = coapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2);
	if (block2Option.length === 1){
		if (Copper.PayloadAdapter.currentBlockNumber === block2Option[0].num && block2Option[0].num > 0){
			append = true;
		}
		Copper.PayloadAdapter.currentBlockNumber = block2Option[0].num + 1;
	}

	let incomingTextElement = document.getElementById("copper-payload-tab-in");
	if (!append){
		while (incomingTextElement.firstChild) {
		    incomingTextElement.removeChild(incomingTextElement.firstChild);
		}
	}

	let payloadString = Copper.ByteUtils.convertBytesToString(coapMessage.payload);
	if (payloadString !== undefined && payloadString !== ""){
		let texts = payloadString.split(/\r\n|\n/);
		incomingTextElement.appendChild(document.createTextNode(texts[0]));
		for (let i=1; i<texts.length; i++){
			incomingTextElement.appendChild(document.createElement("br"));
			incomingTextElement.appendChild(document.createTextNode(texts[i]));
		}
	}
};
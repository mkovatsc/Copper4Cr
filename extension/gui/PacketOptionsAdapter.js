Copper.PacketOptionsAdapter = function(){
};

Copper.PacketOptionsAdapter.onEvent = function(event){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			Copper.PacketOptionsAdapter.updatePacketOptions(event.data.coapMessage);
	}
};

Copper.PacketOptionsAdapter.updatePacketOptions = function(coapMessage){
	let rootElement = document.getElementById("copper-packet-options-table");

	while (rootElement.firstChild) {
	    rootElement.removeChild(rootElement.firstChild);
	}
	let options = coapMessage.getOptions();
	for (let i=0; i<options.length; i++){
		let optionHeader = options[i].header;
		let value = options[i].getValue();
		let rawValue = options[i].val;
		for (let j=0; j<value.length; j++){
			let optionRowElement = document.createElement("div");
			optionRowElement.classList.add("table-body-row");
			
			let optionElement = document.createElement("span");
			optionElement.classList.add("packet-option");
			optionElement.innerHTML = optionHeader.name + " (" + optionHeader.number + ")";
			optionRowElement.appendChild(optionElement);

			let valueElement = document.createElement("span");
			valueElement.classList.add("packet-value");
			valueElement.innerHTML = "" + value[j];
			optionRowElement.appendChild(valueElement);

			let rawElement = document.createElement("span");
			rawElement.classList.add("packet-raw");
			rawElement.innerHTML = Copper.ByteUtils.convertBytesToHexString(rawValue[j]);
			optionRowElement.appendChild(rawElement);
			
			rootElement.appendChild(optionRowElement);
		}
	}
};
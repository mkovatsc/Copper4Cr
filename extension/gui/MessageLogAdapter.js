Copper.MessageLogAdapter = function(){
};

Copper.MessageLogAdapter.onEvent = function(event){
	switch(event.type){
		case Copper.Event.TYPE_COAP_MESSAGE_SENT:
			Copper.MessageLogAdapter.addLogEntry(event.data.coapMessage, false, event.data.retransmissionCount);
			break;
		case Copper.Event.TYPE_COAP_MESSAGE_RECEIVED:
			Copper.MessageLogAdapter.addLogEntry(event.data.coapMessage, true);
			break;
	}
};

Copper.MessageLogAdapter.addLogEntry = function(coapMessage, isReceived, retransmissionCount){
	let rootElement = document.getElementById("copper-coap-message-log-table");

	let logElement = document.createElement("div");
	logElement.classList.add("table-body-row");
	logElement.classList.add(isReceived ? "received" : "sent");

	let timeElement = document.createElement("span");
	timeElement.classList.add("coap-message-time");
	timeElement.textContent = Copper.StringUtils.getTime();
	logElement.appendChild(timeElement);

	let typeElement = document.createElement("span");
	typeElement.classList.add("coap-message-type");
	typeElement.textContent = coapMessage.type.name;
	logElement.appendChild(typeElement);

	let codeElement = document.createElement("span");
	codeElement.classList.add("coap-message-code");
	codeElement.textContent = coapMessage.code.getName();
	logElement.appendChild(codeElement);

	let midElement = document.createElement("span");
	midElement.classList.add("coap-message-mid");
	let mid = coapMessage.mid;
	if (!isReceived && Copper.CoapMessage.Type.CON.equals(coapMessage.type)){
		mid = mid + " (" + retransmissionCount + ")";
	}
	midElement.textContent = mid;
	logElement.appendChild(midElement);

	let tokenElement = document.createElement("span");
	tokenElement.classList.add("coap-message-token");
	tokenElement.textContent = Copper.ByteUtils.convertBytesToHexString(coapMessage.token);
	logElement.appendChild(tokenElement);

	let optionsElement = document.createElement("span");
	optionsElement.classList.add("coap-message-options");
	let options = coapMessage.getOptions();
	for (let i=0; i<options.length; i++){
		let optionHeader = options[i].header;
		let value = options[i].getValue();
		for (let j=0; j<value.length; j++){
			let optionElement = document.createElement("span");
			optionElement.classList.add("no-wrap");
			let optionText = optionHeader.name + ": " + value[j];
			if ((i+1) < options.length || (j+1) < value.length){
				optionText = optionText + ", ";
			}
			optionElement.textContent = optionText;
			optionsElement.appendChild(optionElement);
		}
	}
	logElement.appendChild(optionsElement);

	let payloadElement = document.createElement("span");
	payloadElement.classList.add("coap-message-payload");
	payloadElement.textContent = Copper.ByteUtils.convertBytesToString(coapMessage.payload);
	logElement.appendChild(payloadElement);

	rootElement.insertBefore(logElement, rootElement.firstChild);
};
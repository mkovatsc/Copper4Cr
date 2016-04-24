/*
* Creates e new message given the type and the code
*/
Copper.CoapMessage = function(type, code){
	if (!(type instanceof Copper.CoapMessage.Type) || !(code instanceof Copper.CoapMessage.Code)){
		throw new Error("Illegal arguments");
	}
	this.type = type;
	this.code = code;
	this.mid = undefined;
	this.token = new ArrayBuffer(0);
	this.options = new Object();
	this.payload = new ArrayBuffer(0);
};

Copper.CoapMessage.prototype.version = Copper.CoapConstants.VERSION;

/*
* Sets a message identifier
* @return: this for method chaining
*/
Copper.CoapMessage.prototype.setMid = function(mid){
	if (mid !== undefined && (!Number.isInteger(mid) || mid < 0 || mid > 0xFFFF)){
		throw new Error("Illegal argument");
	}
	this.mid = mid;
	return this;
};

/*
* Sets the message token
* @return: this for method chaining
*/
Copper.CoapMessage.prototype.setToken = function(token){
	if (token === undefined || !(token instanceof ArrayBuffer) || token.byteLength > 8){
		throw new Error("Illegal argument");	
	}
	if (this.code === Copper.CoapMessage.Code.EMPTY && token.byteLength > 0){
		throw new Error("Empty message cannot have a token");
	}
	this.token = token;
	return this;
};

/*
* Adds val to an option creating it if not existing
* @arg optionHeader: header of the option to be set
* @arg val: value of the option
* @arg replace: true if a current option should be overridden
* @return: this for method chaining
*/
Copper.CoapMessage.prototype.addOption = function(optionHeader, val, replace){
	if (!(optionHeader instanceof Copper.CoapMessage.OptionHeader)){
		throw new Error("Illegal argument");
	}
	if (this.code === Copper.CoapMessage.Code.EMPTY){
		throw new Error("Empty message cannot have options");
	}
	if (!this.options[optionHeader.number]){
		this.options[optionHeader.number] = new Copper.CoapMessage.Option(optionHeader);
	}
	if (val instanceof ArrayBuffer){
		if (replace){
			this.options[optionHeader.number].setByteValue(val);	
		}
		else {
			this.options[optionHeader.number].addByteValue(val);		
		}
	}
	else {
		if (replace){
			this.options[optionHeader.number].setValue(val);	
		}
		else {
			this.options[optionHeader.number].addValue(val);		
		}
	}
	return this;
};

/**
* Removes all option values for the given header
* @arg optionHeader: header of the option to be removed
*/
Copper.CoapMessage.prototype.removeOption = function(optionHeader){
	if (!(optionHeader instanceof Copper.CoapMessage.OptionHeader)){
		throw new Error("Illegal argument");
	}
	delete this.options[optionHeader.number];
};

/*
* @arg optionHeader: header of the option of which the values should be retrieved
* @return if option is not set: default value (which may be undefined)
*         if multi-valued option: array containing the converted option values. Empty array if option contains no value
*         if single-valued option: converted value of the option (or undefined if no value is set)
*/
Copper.CoapMessage.prototype.getOption = function(optionHeader){
	if (!(optionHeader instanceof Copper.CoapMessage.OptionHeader)){
		throw new Error("Illegal argument");
	}
	if (this.options[optionHeader.number]){
		return this.options[optionHeader.number].getValue();
	}
	else {
		return optionHeader.defaultValue;
	}
};

/**
* @return: an array containing all options set (options are sorted asc according to their number)
*/
Copper.CoapMessage.prototype.getOptions = function(){
	let optionNos = Object.keys(this.options);
	optionNos.sort(function(a, b){return Number.parseInt(a) - Number.parseInt(b)});
	let res = [];
	for (let i=0; i<optionNos.length; i++){
		res.push(this.options[optionNos[i]]);
	}
	return res;
};

/*
* Sets the payload of the message
* @arg payload: payload in form of an array buffer
* @return: this for method chaining
*/
Copper.CoapMessage.prototype.setPayload = function(payload){
	if (payload === undefined || !(payload instanceof ArrayBuffer)){
		throw new Error("Illegal argument");	
	}
	if (this.code === Copper.CoapMessage.Code.EMPTY && payload.byteLength > 0){
		throw new Error("Empty message cannot have a payload");
	}
	this.payload = payload;
	return this;
};

/*
* @return: String describing the message
*/
Copper.CoapMessage.prototype.toString = function(){
	let ret = [];
	ret.push("Type: " + this.type.name);
	ret.push("Code: " + this.code.name);
	ret.push("MID: " + this.mid);
	ret.push("Token: " + Copper.ByteUtils.convertBytesToHexString(this.token));
	ret.push("Options: " + this.getOptions().length);
	ret.push("Payload: " + this.payload.byteLength);
	return ret.join("\n");
};
/**
* Creates a new option object.
* @header: option header
*/
Copper.CoapMessage.Option = function(header){
	if (!(header instanceof Copper.CoapMessage.OptionHeader)) throw new Error("Illegal Arguments");
	this.header = header;
	this.resetValue();	
};

/**
* Resets the value of this option to empty
* @return: option (for method chaining)
*/
Copper.CoapMessage.Option.prototype.resetValue = function() {
	if (this.header.multipleValues){
		this.val = [];
	}
	else {
		this.val = undefined;
	}
	return this;
};

/**
* Sets the option value or adds a value in case of options that support multiple values. 
* @byteVal: ArrayBuffer containing the data
* @return: option (for method chaining)
*/
Copper.CoapMessage.Option.prototype.addValue = function(byteVal) {
	if (byteVal !== null && !(byteVal instanceof ArrayBuffer)){
		throw new Error("Option value must be a byte array");
	}
	if (byteVal !== null && (this.header.minLen > byteVal.byteLength || this.header.maxLen < byteVal.byteLength)){
		throw new Error("Invalid option value size");
	}
	if (byteVal === null && this.header.minLen > 0){
		throw new Error("Invalid option value size");	
	}
	if (this.header.multipleValues) {
		this.val.push(byteVal);
	}
	else {
		if (this.val !== undefined) {
			throw new Error("Option value already set");
		}
		this.val = byteVal;
	}
	return this;
};

/*
* Sets or overwrites the option value
* @byteVal: ArrayBuffer containing the data
* @return: option (for method chaining)
*/
Copper.CoapMessage.Option.prototype.setValue = function(byteVal) {
	if (this.val !== undefined && this.val !== []){
		this.resetValue();
	}
	return this.addValue(byteVal);
};
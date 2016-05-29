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
	this.val = [];
	return this;
};

Copper.CoapMessage.Option.prototype.clone = function() {
	let res = new Copper.CoapMessage.Option(this.header.clone());
	res.val = this.val.slice(0);
};

/**
* Sets the option value or adds a value in case of options that support multiple values. 
* @byteVal: ArrayBuffer containing the data
* @return: option (for method chaining)
*/
Copper.CoapMessage.Option.prototype.addByteValue = function(byteVal) {
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
		if (this.val.length > 0) {
			throw new Error("Option value already set");
		}
		this.val.push(byteVal);
	}
	return this;
};

/*
* Sets or overwrites the option value
* @val: ArrayBuffer containing the data
* @return: option (for method chaining)
*/
Copper.CoapMessage.Option.prototype.setByteValue = function(val) {
	if (this.val.length > 0){
		this.resetValue();
	}
	return this.addByteValue(val);
};


/**
* Sets the option value or adds a value in case of options that support multiple values. 
* @val: Data in the right format
* @arg opts: object with optional options. The following can be set:
*             useUtf8 --> set to false if ascii encoding should be used
*             strict --> set to true in order to throw errors instead of skipping error parts
* @return: option (for method chaining)
*/
Copper.CoapMessage.Option.prototype.addValue = function(val, opts) {
	let ascii = opts !== undefined && opts.useUtf8 === false;
	let strict = opts !== undefined && opts.strict === true;
	let Types = Copper.CoapMessage.OptionHeader;
	switch(this.header.type) {
		case Types.TYPE_EMPTY:
			if (val === undefined || val === null || val === 0){
				this.addByteValue(new ArrayBuffer(0));
				break;
			}
			throw new Error("Illegal Argument");
		case Types.TYPE_OPAQUE:
			this.addByteValue(Copper.ByteUtils.convertToByteArray(val));
			break;
		case Types.TYPE_UINT:
			if (Number.isInteger(val) && val >= 0){
				this.addByteValue(Copper.ByteUtils.convertUintToBytes(val));
				break;
			}
			throw new Error("Illegal Argument");
		case Types.TYPE_STRING:
			if (typeof(val) === "string"){
				this.addByteValue(Copper.ByteUtils.convertStringToBytes(val, ascii, strict));
				break;
			}
			throw new Error("Illegal Argument");
		case Types.TYPE_BLOCK:
			if (val instanceof Copper.CoapMessage.BlockOption) {
				this.addByteValue(Copper.ByteUtils.convertUintToBytes(Copper.CoapMessage.BlockOption.convertBlockOptionToUint(val)));
				break;
			}
			throw new Error("Illegal Argument");
		default:
			throw new Error("Illegal Argument");
	}
	return this;
};

/*
* Sets or overwrites the option value
* @val: Data in the right format (depending on the option header)
* @arg opts: object with optional options. The following can be set:
*             useUtf8 --> set to false if ascii encoding should be used
*             strict --> set to true in order to throw errors instead of skipping error parts
* @return: option (for method chaining)
*/
Copper.CoapMessage.Option.prototype.setValue = function(val, opts) {
	if (this.val.length > 0){
		this.resetValue();
	}
	return this.addValue(val, opts);
};


/*
* @arg opts: object with optional options. The following can be set:
*             useUtf8 --> set to false if ascii encoding should be used
*             strict --> set to true in order to throw errors instead of skipping error parts
* @return: array containing all converted values, empty if no value set
*/
Copper.CoapMessage.Option.prototype.getValue = function(opts) {
	let ascii = opts !== undefined && opts.useUtf8 === false;
	let strict = opts !== undefined && opts.strict === true;
	let val = this.val;
	if (val.length === 0){
		return [];
	}
	else {
		let Types = Copper.CoapMessage.OptionHeader;
		let res = [];
		for (let i=0; i<val.length; i++){
			switch(this.header.type) {
				case Types.TYPE_EMPTY:
					res.push(null);
					break;
				case Types.TYPE_OPAQUE:
					res.push(Copper.ByteUtils.convertBytesToHexString(val[i]));
					break;
				case Types.TYPE_STRING:
					res.push(Copper.ByteUtils.convertBytesToString(val[i], ascii, strict));
					break;
				case Types.TYPE_UINT:
					res.push(Copper.ByteUtils.convertBytesToUint(val[i]));
					break;
				case Types.TYPE_BLOCK:
					res.push(Copper.CoapMessage.BlockOption.convertUintToBlockOption(
						Copper.ByteUtils.convertBytesToUint(val[i])));
					break;
				default:
					throw new Error("Unknown Type");
			}
		}
		return res;
	}
};
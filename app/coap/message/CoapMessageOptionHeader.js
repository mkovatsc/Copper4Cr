Copper.CoapMessage.OptionHeader = function(number, name, type, minLen, maxLen, multipleValues, defaultValue){
	if ((minLen && !Number.isInteger(minLen)) || (maxLen && !Number.isInteger(maxLen))){
		throw new Error("Invalid Arguments");
	}
	if (type !== Copper.CoapMessage.OptionHeader.TYPE_EMPTY && type !== Copper.CoapMessage.OptionHeader.TYPE_OPAQUE && type !== Copper.CoapMessage.OptionHeader.TYPE_UINT
		&& type !== Copper.CoapMessage.OptionHeader.TYPE_STRING && type !== Copper.CoapMessage.OptionHeader.TYPE_BLOCK){
		throw new Error("Invalid Type");
	}
	this.number = number;
	this.name = name;
	this.type = type;
	this.minLen = minLen ? minLen : 0;
	this.maxLen = maxLen ? maxLen : 0;
	this.multipleValues = multipleValues ? true : false;
	this.defaultValue = defaultValue !== undefined ? defaultValue : undefined;
};

/* Constants */
Copper.CoapMessage.OptionHeader.TYPE_EMPTY = 0;
Copper.CoapMessage.OptionHeader.TYPE_OPAQUE = 1;
Copper.CoapMessage.OptionHeader.TYPE_UINT = 2;
Copper.CoapMessage.OptionHeader.TYPE_STRING = 3;
Copper.CoapMessage.OptionHeader.TYPE_BLOCK = 4;

/* Prototype */
Copper.CoapMessage.OptionHeader.prototype.isCritical = function() {
	return (this.number & 0x1) == 0x1;
};

Copper.CoapMessage.OptionHeader.prototype.isUnsafe = function() {
	return (this.number & 0x2) == 0x2;
};

Copper.CoapMessage.OptionHeader.prototype.isNoCacheKey = function() {
	return (this.number & 0x1E) == 0x1C;
};

Copper.CoapMessage.OptionHeader.prototype.clone = function() {
	return new Copper.CoapMessage.OptionHeader(this.number, this.name, this.type, this.minLen, this.maxLen, this.multipleValues, this.defaultVal);
};

/********************************************************************/

/* Option Registry */
/* RFC 7252 */
Copper.CoapMessage.OptionHeader.IF_MATCH = new Copper.CoapMessage.OptionHeader(1, "If-Match", Copper.CoapMessage.OptionHeader.TYPE_OPAQUE, 0, 8, true);
Copper.CoapMessage.OptionHeader.URI_HOST = new Copper.CoapMessage.OptionHeader(3, "Uri-Host", Copper.CoapMessage.OptionHeader.TYPE_STRING, 1, 255, false);
Copper.CoapMessage.OptionHeader.ETAG = new Copper.CoapMessage.OptionHeader(4, "Etag", Copper.CoapMessage.OptionHeader.TYPE_OPAQUE, 1, 8, true);
Copper.CoapMessage.OptionHeader.IF_NONE_MATCH = new Copper.CoapMessage.OptionHeader(5, "If-None-Match", Copper.CoapMessage.OptionHeader.TYPE_EMPTY, 0, 0, false);
Copper.CoapMessage.OptionHeader.URI_PORT = new Copper.CoapMessage.OptionHeader(7, "Uri-Port", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 2, false);
Copper.CoapMessage.OptionHeader.LOCATION_PATH = new Copper.CoapMessage.OptionHeader(8, "Location-Path", Copper.CoapMessage.OptionHeader.TYPE_STRING, 0, 255, true);
Copper.CoapMessage.OptionHeader.URI_PATH = new Copper.CoapMessage.OptionHeader(11, "Uri-Path", Copper.CoapMessage.OptionHeader.TYPE_STRING, 0, 255, true);
Copper.CoapMessage.OptionHeader.CONTENT_FORMAT = new Copper.CoapMessage.OptionHeader(12, "Content-Format", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 2, false);
Copper.CoapMessage.OptionHeader.MAX_AGE = new Copper.CoapMessage.OptionHeader(14, "Max-Age", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 4, false, 60);
Copper.CoapMessage.OptionHeader.URI_QUERY = new Copper.CoapMessage.OptionHeader(15, "Uri-Query", Copper.CoapMessage.OptionHeader.TYPE_STRING, 0, 255, true);
Copper.CoapMessage.OptionHeader.ACCEPT = new Copper.CoapMessage.OptionHeader(17, "Accept", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 2, false);
Copper.CoapMessage.OptionHeader.LOCATION_QUERY = new Copper.CoapMessage.OptionHeader(20, "Location-Query", Copper.CoapMessage.OptionHeader.TYPE_STRING, 0, 255, true);
Copper.CoapMessage.OptionHeader.PROXY_URI = new Copper.CoapMessage.OptionHeader(35, "Proxy-Uri", Copper.CoapMessage.OptionHeader.TYPE_STRING, 1, 1034, false);
Copper.CoapMessage.OptionHeader.PROXY_SCHEME = new Copper.CoapMessage.OptionHeader(39, "Proxy-Scheme", Copper.CoapMessage.OptionHeader.TYPE_STRING, 1, 255, false);
Copper.CoapMessage.OptionHeader.SIZE1 = new Copper.CoapMessage.OptionHeader(60, "Size1", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 4, false);

/* RFC 7641 */
Copper.CoapMessage.OptionHeader.OBSERVE = new Copper.CoapMessage.OptionHeader(6, "Observe", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 3, false);

/* draft-ietf-core-block-19 */
Copper.CoapMessage.OptionHeader.BLOCK2 = new Copper.CoapMessage.OptionHeader(23, "Block2", Copper.CoapMessage.OptionHeader.TYPE_BLOCK, 0, 3, false);
Copper.CoapMessage.OptionHeader.BLOCK1 = new Copper.CoapMessage.OptionHeader(27, "Block1", Copper.CoapMessage.OptionHeader.TYPE_BLOCK, 0, 3, false);
Copper.CoapMessage.OptionHeader.SIZE2 = new Copper.CoapMessage.OptionHeader(28, "Size2", Copper.CoapMessage.OptionHeader.TYPE_UINT, 0, 4, false);


/* Registry containing all options */
Copper.CoapMessage.OptionHeader.Registry = [
	Copper.CoapMessage.OptionHeader.IF_MATCH,
	Copper.CoapMessage.OptionHeader.URI_HOST,
	Copper.CoapMessage.OptionHeader.ETAG,
	Copper.CoapMessage.OptionHeader.IF_NONE_MATCH,
	Copper.CoapMessage.OptionHeader.URI_PORT,
	Copper.CoapMessage.OptionHeader.LOCATION_PATH,
	Copper.CoapMessage.OptionHeader.URI_PATH,
	Copper.CoapMessage.OptionHeader.CONTENT_FORMAT,
	Copper.CoapMessage.OptionHeader.MAX_AGE,
	Copper.CoapMessage.OptionHeader.URI_QUERY,
	Copper.CoapMessage.OptionHeader.ACCEPT,
	Copper.CoapMessage.OptionHeader.LOCATION_QUERY,
	Copper.CoapMessage.OptionHeader.PROXY_URI,
	Copper.CoapMessage.OptionHeader.PROXY_SCHEME,
	Copper.CoapMessage.OptionHeader.SIZE1,
	Copper.CoapMessage.OptionHeader.OBSERVE,
	Copper.CoapMessage.OptionHeader.BLOCK2,
	Copper.CoapMessage.OptionHeader.BLOCK1,
	Copper.CoapMessage.OptionHeader.SIZE2
];

/********************************************************************/

/**
* Header for unknown options
*/
Copper.CoapMessage.OptionHeader.getUnknownOptionHeader = function(optionNo){
	return new Copper.CoapMessage.OptionHeader((optionNo ? optionNo : -1), "Unknown", Copper.CoapMessage.OptionHeader.TYPE_OPAQUE, 0, Number.MAX_VALUE, true);
};

/*
* @return OptionHeader for a given option number
*/
Copper.CoapMessage.OptionHeader.getOptionHeader = function(optionNo){
	if (!Number.isInteger(optionNo) || optionNo < 0){
		throw new Error("Illegal Arguments");
	}
	let reg = Copper.CoapMessage.OptionHeader.Registry;
	for (let i = 0; i < reg.length; i++) {
		if (reg[i].number === optionNo){
			return reg[i].clone();
		}
	}
	return Copper.CoapMessage.OptionHeader.getUnknownOptionHeader(optionNo);
};

/*
* @return OptionHeader for a given name
*/
Copper.CoapMessage.OptionHeader.getOptionHeaderForName = function(name){
	if (!name || typeof(name) !== "string"){
		throw new Error("Illegal Arguments");
	}
	let reg = Copper.CoapMessage.OptionHeader.Registry;
	for (let i = 0; i < reg.length; i++) {
		if (reg[i].name === name){
			return reg[i].clone();
		}
	}
	return Copper.CoapMessage.OptionHeader.getUnknownOptionHeader();
};
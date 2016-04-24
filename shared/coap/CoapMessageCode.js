/**
* Creates a new code object.
*/
Copper.CoapMessage.Code = function(number, name) {
	if (!Number.isInteger(number) || number < 0 || typeof(name) !== 'string'){
		throw new Error("Illegal argument");
	}
	this.number = number;
	this.name = name;
};

Copper.CoapMessage.Code.prototype.getName = function(){
	if (this.number < 32){
		return this.name;
	}
	else {
		return this.getShortcode() + " " + this.name;
	}
};

Copper.CoapMessage.Code.prototype.getShortcode = function(){
	if (this.number < 32){
		return this.name;
	}
	else {
		return Math.floor(this.number/32).toString() + "." + Copper.StringUtils.lpad((this.number%32).toString(), 2);
	}
};

Copper.CoapMessage.Code.prototype.isRequestCode = function(){
	return this.number < 32;
};

Copper.CoapMessage.Code.prototype.isResponseCode = function(){
	return this.number >= 32;
};

Copper.CoapMessage.Code.prototype.isSuccessCode = function(){
	return 64 <= this.number && this.number < 96;
};

Copper.CoapMessage.Code.prototype.isClientErrorCode = function(){
	return 128 <= this.number && this.number < 160;
};

Copper.CoapMessage.Code.prototype.isServerErrorCode = function(){
	return 160 <= this.number && this.number < 192;
};

Copper.CoapMessage.Code.prototype.clone = function() {
	return new Copper.CoapMessage.Code(this.number, this.name);
};

/* Registry */
/* Request Codes */
Copper.CoapMessage.Code.EMPTY = new Copper.CoapMessage.Code(0, "EMPTY");
Copper.CoapMessage.Code.GET = new Copper.CoapMessage.Code(1, "GET");
Copper.CoapMessage.Code.POST = new Copper.CoapMessage.Code(2, "POST");
Copper.CoapMessage.Code.PUT = new Copper.CoapMessage.Code(3, "PUT");
Copper.CoapMessage.Code.DELETE = new Copper.CoapMessage.Code(4, "DELETE");

/* Success Codes */
Copper.CoapMessage.Code._UNKNOWN_SUCCESS_CODE = new Copper.CoapMessage.Code(64, "Success (Unknown Code)"); // 2.00 is undefined -- only used to identify class
Copper.CoapMessage.Code.CREATED = new Copper.CoapMessage.Code(65, "Created");
Copper.CoapMessage.Code.DELETED = new Copper.CoapMessage.Code(66, "Deleted");
Copper.CoapMessage.Code.VALID = new Copper.CoapMessage.Code(67, "Valid");
Copper.CoapMessage.Code.CHANGED = new Copper.CoapMessage.Code(68, "Changed");
Copper.CoapMessage.Code.CONTENT = new Copper.CoapMessage.Code(69, "Content");
Copper.CoapMessage.Code.CONTINUE = new Copper.CoapMessage.Code(95, "Continue");

/* Client Error Codes */
Copper.CoapMessage.Code.BAD_REQUEST = new Copper.CoapMessage.Code(128, "Bad Request");
Copper.CoapMessage.Code.UNAUTHORIZED = new Copper.CoapMessage.Code(129, "Unauthorized");
Copper.CoapMessage.Code.BAD_OPTION = new Copper.CoapMessage.Code(130, "Bad Option");
Copper.CoapMessage.Code.FORBIDDEN = new Copper.CoapMessage.Code(131, "Forbidden");
Copper.CoapMessage.Code.NOT_FOUND = new Copper.CoapMessage.Code(132, "Not Found");
Copper.CoapMessage.Code.METHOD_NOT_ALLOWED = new Copper.CoapMessage.Code(133, "Method Not Allowed");
Copper.CoapMessage.Code.NOT_ACCEPTABLE = new Copper.CoapMessage.Code(134, "Not Acceptable");
Copper.CoapMessage.Code.REQUEST_ENTITY_INCOMPLETE = new Copper.CoapMessage.Code(136, "Request Entity Incomplete");
Copper.CoapMessage.Code.PRECONDITION_FAILED = new Copper.CoapMessage.Code(140, "Precondition Failed");
Copper.CoapMessage.Code.REQUEST_ENTITY_TOO_LARGE = new Copper.CoapMessage.Code(141, "Request Entity Too Large");
Copper.CoapMessage.Code.UNSUPPORTED_CONTENT_FORMAT = new Copper.CoapMessage.Code(143, "Unsupported Content Format");

/* Server Error Codes */
Copper.CoapMessage.Code.INTERNAL_SERVER_ERROR = new Copper.CoapMessage.Code(160, "Internal Server Error");
Copper.CoapMessage.Code.NOT_IMPLEMENTED = new Copper.CoapMessage.Code(161, "Not Implemented");
Copper.CoapMessage.Code.BAD_GATEWAY = new Copper.CoapMessage.Code(162, "Bad Gateway");
Copper.CoapMessage.Code.SERVICE_UNAVAILABLE = new Copper.CoapMessage.Code(163, "Service Unavailable");
Copper.CoapMessage.Code.GATEWAY_TIMEOUT = new Copper.CoapMessage.Code(164, "Gateway Timeout");
Copper.CoapMessage.Code.PROXY_NOT_SUPPORTED = new Copper.CoapMessage.Code(165, "Proxy Not Supported");

Copper.CoapMessage.Code.Registry = [
	Copper.CoapMessage.Code.EMPTY,
	Copper.CoapMessage.Code.GET,
	Copper.CoapMessage.Code.POST,
	Copper.CoapMessage.Code.PUT,
	Copper.CoapMessage.Code.DELETE,

	Copper.CoapMessage.Code._UNKNOWN_SUCCESS_CODE,
	Copper.CoapMessage.Code.CREATED,
	Copper.CoapMessage.Code.DELETED,
	Copper.CoapMessage.Code.VALID,
	Copper.CoapMessage.Code.CHANGED,
	Copper.CoapMessage.Code.CONTENT,
	Copper.CoapMessage.Code.CONTINUE,

	Copper.CoapMessage.Code.BAD_REQUEST,
	Copper.CoapMessage.Code.UNAUTHORIZED,
	Copper.CoapMessage.Code.BAD_OPTION,
	Copper.CoapMessage.Code.FORBIDDEN,
	Copper.CoapMessage.Code.NOT_FOUND,
	Copper.CoapMessage.Code.METHOD_NOT_ALLOWED,
	Copper.CoapMessage.Code.NOT_ACCEPTABLE,
	Copper.CoapMessage.Code.REQUEST_ENTITY_INCOMPLETE,
	Copper.CoapMessage.Code.PRECONDITION_FAILED,
	Copper.CoapMessage.Code.REQUEST_ENTITY_TOO_LARGE,
	Copper.CoapMessage.Code.UNSUPPORTED_CONTENT_FORMAT,

	Copper.CoapMessage.Code.INTERNAL_SERVER_ERROR,
	Copper.CoapMessage.Code.NOT_IMPLEMENTED,
	Copper.CoapMessage.Code.BAD_GATEWAY,
	Copper.CoapMessage.Code.SERVICE_UNAVAILABLE,
	Copper.CoapMessage.Code.GATEWAY_TIMEOUT,
	Copper.CoapMessage.Code.PROXY_NOT_SUPPORTED
];


/*
* @return MessageCode for a given number
*/
Copper.CoapMessage.Code.getCode = function(number){
	if (!Number.isInteger(number) || number < 0){
		throw new Error("Illegal argument");
	}
	let reg = Copper.CoapMessage.Code.Registry;
	for (let i = 0; i < reg.length; i++) {
		if (reg[i].number === number){
			return reg[i].clone();
		}
	}
	if (number >= 32 && number%32 !== 0){
		return Copper.CoapMessage.Code.getCode(Math.floor(number/32)*32);
	}
	else {
		throw new Error("No matching message code");
	}
};

/*
* @return MessageCode for a given name (e.g. 2.01 Success)
*/
Copper.CoapMessage.Code.getCodeForName = function(name){
	if (typeof(name) !== "string"){
		throw new Error("Illegal argument");
	}
	let reg = Copper.CoapMessage.Code.Registry;
	for (let i = 0; i < reg.length; i++) {
		if (reg[i].getName() === name){
			return reg[i].clone();
		}
	}
	throw new Error("No matching message code");
};

/*
* @return MessageCode for a given shortcode (e.g. 2.01)
*/
Copper.CoapMessage.Code.getCodeForShortcode = function(shortcode){
	if (typeof(shortcode) !== "string"){
		throw new Error("Illegal argument");
	}
	let reg = Copper.CoapMessage.Code.Registry;
	for (let i = 0; i < reg.length; i++) {
		if (reg[i].getShortcode() === shortcode){
			return reg[i].clone();
		}
	}
	throw new Error("No matching message code");
};
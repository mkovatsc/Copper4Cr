/*
* Creates a new block option value 
* @num: block number
* @szExp: exponent of the size of the block 4 <= szExp <= 10
* @more: if another block is available (true, false) 
*/
Copper.CoapMessage.BlockOption = function(num, szExp, more){
	if (!Number.isInteger(num) || num < 0 
		|| !Number.isInteger(szExp) || szExp < 4 || szExp > 10
		|| (more !== 0 && more !== 1 && more !== true && more !== false)){
		throw new Error("Illegal Arguments");
	}
	this.num = num;
	this.szExp = szExp;
	this.more = more ? true : false;
};

/*
* @return number of bytes for a given exponent
*/
Copper.CoapMessage.BlockOption.szExpToSize = function(szExp){
	if (!Number.isInteger(szExp)){
		throw new Error("Illegal Arguments");
	}
	return 1 << szExp; 
};

/*
* @return: size of the block
*/
Copper.CoapMessage.BlockOption.prototype.getSize = function(){
	return Copper.CoapMessage.BlockOption.szExpToSize(this.szExp);
};

Copper.CoapMessage.BlockOption.prototype.toString = function(){
	return this.num + "/" + this.getSize() + "/" + (this.more ? "1" : "0"); 
};

Copper.CoapMessage.BlockOption.prototype.equals = function(other){
	return (other instanceof Copper.CoapMessage.BlockOption) && this.num === other.num && this.szExp === other.szExp && this.more === other.more;
};

/*
* @blockVal: integer representing the block option
* @return: block option object
*/
Copper.CoapMessage.BlockOption.convertUintToBlockOption = function(blockVal){
	if (!Number.isInteger(blockVal) || blockVal < 0){
		throw new Error("Illegal Argument");
	}
	return new Copper.CoapMessage.BlockOption(blockVal >> 4, 4 + (blockVal & 0x7), (blockVal & 0x8) === 0x8);
};

/*
* @blockOption: block option to convert
* @return: integer representing the block option
*/
Copper.CoapMessage.BlockOption.convertBlockOptionToUint = function(blockOption){
	if (!(blockOption instanceof Copper.CoapMessage.BlockOption)){
		throw new Error("Illegal Argument");
	}
	return (blockOption.num << 4) | (blockOption.more ? 0x8 : 0x0) | (blockOption.szExp - 4);
};
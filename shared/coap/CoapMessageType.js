/**
* Creates a new type object.
*/
Copper.CoapMessage.Type = function(number, name) {
	if (!Number.isInteger(number) || typeof(name) !== 'string'){
		throw new Error("Illegal argument");
	}
	this.number = number;
	this.name = name;
};

Copper.CoapMessage.Type.prototype.clone = function() {
	return new Copper.CoapMessage.Type(this.number, this.name);
};

Copper.CoapMessage.Type.prototype.equals = function(other){
	return (other instanceof Copper.CoapMessage.Type) && this.number === other.number && this.name === other.name;
};

/* Registry */
Copper.CoapMessage.Type.CON = new Copper.CoapMessage.Type(0, "CON");
Copper.CoapMessage.Type.NON = new Copper.CoapMessage.Type(1, "NON");
Copper.CoapMessage.Type.ACK = new Copper.CoapMessage.Type(2, "ACK");
Copper.CoapMessage.Type.RST = new Copper.CoapMessage.Type(3, "RST");

Copper.CoapMessage.Type.Registry = [
	Copper.CoapMessage.Type.CON,
	Copper.CoapMessage.Type.NON,
	Copper.CoapMessage.Type.ACK,
	Copper.CoapMessage.Type.RST
];


/*
* @return MessageType for a given number
*/
Copper.CoapMessage.Type.getType = function(number){
	if (!Number.isInteger(number)){
		throw new Error("Illegal argument");
	}
	let reg = Copper.CoapMessage.Type.Registry;
	for (let i = 0; i < reg.length; i++) {
		if (reg[i].number === number){
			return reg[i].clone();
		}
	}
	throw new Error("Illegal message type");
};

/*
* @return MessageType for a given name
*/
Copper.CoapMessage.Type.getTypeForName = function(name){
	if (typeof(name) !== "string"){
		throw new Error("Illegal argument");
	}
	let reg = Copper.CoapMessage.Type.Registry;
	for (let i = 0; i < reg.length; i++) {
		if (reg[i].name === name){
			return reg[i].clone();
		}
	}
	throw new Error("Illegal message type");
};
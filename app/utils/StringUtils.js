Copper.StringUtils = function(){
};

/**
* @return current datetime formatted as 23.03.2016 15:29:33.214
*/
Copper.StringUtils.getDateTime = function() {
	let currentdate = new Date(); 
	let dd = currentdate.getDate().toString();
	let mm = (currentdate.getMonth()+1).toString();
	let yyyy = currentdate.getFullYear().toString();
	let hh = currentdate.getHours().toString();
	let mi = currentdate.getMinutes().toString();
	let ss = currentdate.getSeconds().toString();
	let ms = currentdate.getMilliseconds().toString();
    return this.lpad(dd, 2) + "." + this.lpad(mm, 2) + "." + yyyy +
        " " + this.lpad(hh, 2) + ":" + this.lpad(mi, 2) + ":" + this.lpad(ss, 2) + "." + this.lpad(ms, 3);
};

/**
* @return String of length len using the first len characters of str optionally left padding it with pad (default 0)
*/
Copper.StringUtils.lpad = function(str, len, pad){
	if (!pad) pad = "0";
	if (pad.length > 1) throw new Error("Length of padding <> 1");
	if (typeof(len) !== "number" || (str !== null && typeof(str) !== "string")) throw new Error("Illegal Arguments");
	if (str && str.length === len) {
		return str;
	}
	else {
		let res = [];
		for (let i = 0; i < len - (str ? str.length : 0); i++){
			res.push(pad);
		}
		res.push(str ? (str.len < len ? str : str.substring(0, len)) : "");
		return res.join("");
	}
};
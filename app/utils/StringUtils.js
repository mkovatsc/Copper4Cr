Copper.StringUtils = function(){
};

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

Copper.StringUtils.lpad = function(str, len, pad){
	if (typeof(pad) === "undefined") pad = "0";
	if (str.length === len) {
		return str;
	}
	else {
		res = [];
		for (var i = 0; i < len - str.length; i++){
			res.push(pad);
		}
		res.push(str);
		return res.join("");
	}
};
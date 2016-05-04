Copper.TimeUtils = function(){
};

Copper.TimeUtils.now = function(){
	return Date.now ? Date.now() : new Date().getTime();
};

Copper.TimeUtils.isOlderThan = function(timestamp, milliseconds){
	if (!Number.isInteger(timestamp) || timestamp < 0 || !Number.isInteger(milliseconds) || milliseconds < 0){
		throw new Error("Illegal argument");
	}
	return Copper.TimeUtils.now() - timestamp > milliseconds;
};

Copper.TimeUtils.setTimeout = function(callback, milliseconds) {
	return window.setTimeout(callback, milliseconds);
};

Copper.TimeUtils.clearTimeout = function(timeoutId){
	return window.clearTimeout(timeoutId);
};
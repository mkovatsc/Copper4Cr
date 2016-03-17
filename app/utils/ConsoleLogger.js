Copper.ConsoleLogger = function(){
}

Copper.ConsoleLogger.prototype.log = function(logLevel, text, options) {
	console.log("[" + Copper.LogUtil.getLogLevelText(logLevel) + "] " + Copper.StringUtils.getDateTime() + ": " + text)
};
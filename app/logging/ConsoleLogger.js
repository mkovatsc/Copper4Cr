Copper.ConsoleLogger = {
	log : function(logLevel, text) {
			console.log("[" + Copper.Log.getLogLevelText(logLevel) + "] " + Copper.StringUtils.getDateTime() + ": " + text);
		}
};
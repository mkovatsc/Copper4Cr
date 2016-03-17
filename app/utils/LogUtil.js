Copper.LogUtil = function() {

};

Copper.LogUtil.LogLevels = [ /* ALL */, "FINE", "INFO", "WARNING", "ERROR", /* NONE */];

Copper.LogUtil.LEVEL_ALL = 0; // Only used for setting allowed level
Copper.LogUtil.LEVEL_FINE = 1;
Copper.LogUtil.LEVEL_INFO = 2;
Copper.LogUtil.LEVEL_WARNING = 3;
Copper.LogUtil.LEVEL_ERROR = 4;
Copper.LogUtil.LEVEL_NONE = 5; // Only used for setting allowed level

Copper.LogUtil.getLogLevelText = function(level){
	return Copper.LogUtil.LogLevels[level];
};

Copper.LogUtil.logFine = function(text, options){
	this.log(this.LEVEL_FINE, text, options);
};

Copper.LogUtil.logInfo = function(info, options){
	this.log(this.LEVEL_INFO, info, options);
};

Copper.LogUtil.logWarning = function(warning, options){
	this.log(this.LEVEL_WARNING, warning, options);
};

Copper.LogUtil.logError = function(error, options){
	this.log(this.LEVEL_ERROR, error, options);
};

Copper.LogUtil.log = function(logLevel, text, options) {
	let loggers = options.loggers;
	if (options.logLevel <= logLevel){
		for (var i = 0; i < loggers.length; i++){
			loggers[i].log(logLevel, text, options);
		}
	}
};
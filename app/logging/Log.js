Copper.Log = function() {
};

// ------- Log Levels -----------
Copper.Log.logLevels = [ /* ALL */, "FINE", "INFO", "WARNING", "ERROR", /* NONE */];

Copper.Log.LEVEL_ALL = 0; // Only used for setting allowed level
Copper.Log.LEVEL_FINE = 1;
Copper.Log.LEVEL_INFO = 2;
Copper.Log.LEVEL_WARNING = 3;
Copper.Log.LEVEL_ERROR = 4;
Copper.Log.LEVEL_NONE = 5; // Only used for setting allowed level

Copper.Log.getLogLevelText = function(level){
	return Copper.Log.logLevels[level];
};

// ------- Setup -----------
Copper.Log.logLevel = Copper.Log.LEVEL_INFO;
Copper.Log.loggers = [];

Copper.Log.registerLogger = function(logger){
	if (!(typeof(logger.log) === "function")){
		throw new Error("Illegal Arguments");
	}
	this.loggers.push(logger);
};


// ------- Logging -----------
Copper.Log.logFine = function(text){
	this.log(this.LEVEL_FINE, text);
};

Copper.Log.logInfo = function(info){
	this.log(this.LEVEL_INFO, info);
};

Copper.Log.logWarning = function(warning){
	this.log(this.LEVEL_WARNING, warning);
};

Copper.Log.logError = function(error){
	this.log(this.LEVEL_ERROR, error);
};

Copper.Log.log = function(logLevel, text) {
	if (this.logLevel <= logLevel){
		for (let i = 0; i < this.loggers.length; i++){
			this.loggers[i].log(logLevel, text);
		}
	}
};
/*******************************************************************************
 * Copyright (c) 2016, Institute for Pervasive Computing, ETH Zurich.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the Institute nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE INSTITUTE AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE INSTITUTE OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 * 
 * This file is part of the Copper (Cu) CoAP user-agent.
 ******************************************************************************/
 
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
Copper.Log.logLevel = Copper.Log.LEVEL_ALL;
Copper.Log.loggers = [];

Copper.Log.registerLogger = function(logger){
	if (!(typeof(logger) === "function")){
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
			this.loggers[i](logLevel, text);
		}
	}
};
/* Settings object. Set a pref to override the default behavior */
Copper.Settings = function() {
};

// Message type to use (0 -> CON). See Copper.CoapMessage.Type object for different values
Copper.Settings.prototype.requests = 0; 

// Retransmit messages after timeout (up to MAX_RETRANSMIT)
Copper.Settings.prototype.retransmission = true;

// Do not increase MID to send duplicates
// TODO: in FF-Copper not used...
Copper.Settings.prototype.sendDuplicates = false;

// Show unknown messages in the message log
Copper.Settings.prototype.showUnknown = true;

// Reject unknown messages using a RST message
Copper.Settings.prototype.rejectUnknown = true;

// Send URI-Host Option
Copper.Settings.prototype.sendUriHost = false;

// Send size1 option
Copper.Settings.prototype.sendSize1 = false;

// Choose block size
// 0 --> late block negotiation, otherwise 4 - 10 (32 - 1024)
Copper.Settings.prototype.blockSize = 6;

// Do blockwise transfers automatically
Copper.Settings.prototype.blockwiseEnabled = true;

// Use token for observe
Copper.Settings.prototype.observeToken = true;

// Observe cancellation (get, rst, lazy)
Copper.Settings.prototype.observeCancellation = "lazy";
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


Copper.Settings.prototype.payloadMode = "text";
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
 
/* Stub of a simple UDP Client interface for sending and receiving plain datagrams. 
*  The following methods are provided:
*
*  -> bind(function onBind, function onReceive, function onReceiveError)
*  -> send(ArrayBuffer datagram, string remoteAddress, int remotePort, function onSent)
*  -> close()
*/

Copper.UdpClient = function(){
	throw new Error("not implemented");
}

/* Binds the socket to a local port. Calls onBind function once the socket is bound.
*  @arg function onBind(boolean socketReady, int port, string errorMsg)
*  @arg function onReceive(ArrayBuffer datagram, string remoteAddress, int remotePort)
*  @arg function onReceiveError(boolean socketReady, string errorMsg)
*/
Copper.UdpClient.prototype.bind = function(onBind, onReceive, onReceiveError){
		throw new Error("not implemented");
};

/**
* Sends a datagram 
* @arg datagram: array buffer to send
* @arg onSent(boolean successful, int bytesSent, boolean socketOpen, string errorMsg)
*/
Copper.UdpClient.prototype.send = function(datagram, remoteAddress, remotePort, onSent){
	throw new Error("not implemented");
};

/* Closes the socket, releases resources */
Copper.UdpClient.prototype.close = function() {
	throw new Error("not implemented");
};
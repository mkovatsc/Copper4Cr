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
/*
* Holder for the different profiles and the profile options (e.g. selected profile)
*/
Copper.Profiles = function() {
    this.profiles = new Object();
    this.profiles[Copper.Profiles.DEFAULT_PROFILE_KEY] = {
        settings: new Copper.Settings(),
        options: new Copper.Options(),
        payload: new Copper.Payload(),
        layout: new Copper.Layout()
    };
    this.selectedProfile = Copper.Profiles.DEFAULT_PROFILE_KEY;
};

Copper.Profiles.DEFAULT_PROFILE_KEY = "";

Copper.Profiles.prototype.profiles = undefined;
Copper.Profiles.prototype.autoStore = true;
Copper.Profiles.prototype.selectedProfile = undefined;

Copper.Profiles.prototype.addProfile = function(name, settings, options, payload, layout) {
    if (typeof(name) !== "string" || name === Copper.Profiles.DEFAULT_PROFILE_KEY || !(settings instanceof Copper.Settings) ||
          !(options instanceof Copper.Options) || !(payload instanceof Copper.Payload) || !(layout instanceof Copper.Layout)) {
        throw new Error("Illegal arguments");
    }
    if (this.profiles[name] !== undefined){
        throw new Error("Profile " + name + " exists already");
    }
    this.profiles[name] = {
        settings: settings.clone(),
        options: options.clone(),
        payload: payload.clone(),
        layout: layout.clone()
    };
};

Copper.Profiles.prototype.renameProfile = function(oldName, newName) {
    if (typeof(oldName) !== "string" || oldName === Copper.Profiles.DEFAULT_PROFILE_KEY || typeof(newName) !== "string" || newName === Copper.Profiles.DEFAULT_PROFILE_KEY) {
        throw new Error("Illegal arguments");
    }
    if (this.profiles[oldName] === undefined){
        throw new Error("Old profile does not exist");
    }
    if (this.profiles[newName] !== undefined){
        throw new Error("New profile does already exist");
    }
    if (this.selectedProfile === oldName) this.selectedProfile = newName;
    this.profiles[newName] = this.profiles[oldName];
    delete this.profiles[oldName];
};

Copper.Profiles.prototype.deleteProfile = function(name) {
    if (typeof(name) !== "string" || name === Copper.Profiles.DEFAULT_PROFILE_KEY){
        throw new Error("Illegal profile name");
    }
    if (this.profiles[name] === undefined){
        throw new Error("Profile does not exist");
    }
    if (name === this.selectedProfile){
        throw new Error("Selected profile must not be deleted");
    }
    delete this.profiles[name];
};

Copper.Profiles.prototype.getProfile = function(name) {
    if (typeof(name) !== "string"){
        throw new Error("Illegal profile name");
    }
    return this.profiles[name];
};

Copper.Profiles.prototype.getSelectedProfile = function() {
    return this.getProfile(this.selectedProfile);
};

Copper.Profiles.prototype.getAllProfileNames = function() {
    let ret = [Copper.Profiles.DEFAULT_PROFILE_KEY];
    let names = Object.keys(this.profiles);
    for (let i=0; i<names.length; i++){
        if (names[i] !== Copper.Profiles.DEFAULT_PROFILE_KEY) ret.push(names[i]);
    }
    return ret;
};

Copper.Profiles.prototype.selectProfile = function(name) {
    if (typeof(name) !== "string"){
        throw new Error("Illegal profile name");
    }
    if (this.profiles[name] === undefined){
        throw new Error("Profile does not exist");
    }
    this.selectedProfile = name;
    return this.getSelectedProfile();
};

Copper.Profiles.prototype.updateSelectedProfile = function(newSettings, newOptions, newPayload, newLayout, forceUpdate) {
    if (!(newSettings instanceof Copper.Settings) || !(newOptions instanceof Copper.Options) || !(newPayload instanceof Copper.Payload) || !(newLayout instanceof Copper.Layout)) {
        throw new Error("Illegal arguments");
    }
    if (forceUpdate || this.autoStore) {
        let profile = this.getSelectedProfile();
        profile.settings = newSettings.clone();
        profile.options = newOptions.clone();
        profile.payload = newPayload.clone();
        profile.layout = newLayout.clone();
        return true;
    }
    else {
        return false;
    }
};
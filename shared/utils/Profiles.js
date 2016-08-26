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
Copper.Profiles = function() {
    this.allProfiles = {};
    this.selectedProfile = "";
};

Copper.Profiles.prototype.allProfiles = undefined;

Copper.Profiles.prototype.selectedProfile = "";

Copper.Profiles.defaultProfile = "default_profile";

Copper.Profiles.profilesKey = "profiles";

Copper.Profiles.prototype.addNewProfile = function(name, settings, options) {
    if (!(name in this.allProfiles)) {
        this.allProfiles[name] = {settings: settings, options: options};
        let profileSettings = {settings: settings, options: options};
        let newStorageObj = Copper.JsonUtils.stringify(Copper.Session.profiles);
        Copper.ChromeComponentFactory.storeLocally(Copper.Profiles.profilesKey, newStorageObj);
    }
};

Copper.Profiles.prototype.deleteProfile = function(name) {
    if (name in this.allProfiles) {
        delete this.allProfiles[name];
        let newStorageObj = Copper.JsonUtils.stringify(Copper.Session.profiles);
        Copper.ChromeComponentFactory.storeLocally(Copper.Profiles.profilesKey, newStorageObj);
    }
};

Copper.Profiles.prototype.createAndSelectDefaultProfile = function(name) {
    if (!(Copper.Profiles.defaultProfile in this.allProfiles)) {

        this.allProfiles = {};
        this.addNewProfile(Copper.Profiles.defaultProfile, Copper.Session.settings, Copper.Session.options);
        this.loadProfile(Copper.Profiles.defaultProfile);
    }
};


Copper.Profiles.prototype.loadProfile = function(name) {
    if (!(name in this.allProfiles)) {
        return;
    }
    this.selectedProfile = name;
    let profile = this.allProfiles[name];
    Copper.Session.settings = profile.settings;
    Copper.Session.options = profile.options;
    if (Copper.Session.settings.requests === 0) {
        Copper.Session.settings.requests = Copper.CoapMessage.Type.CON;
    } else {
        Copper.Session.settings.requests = (Copper.Session.settings.requests.number === 0 ? Copper.CoapMessage.Type.CON : Copper.CoapMessage.Type.NON);
    }
    Copper.Session.clientEndpoint.updateSettings(Copper.Session.settings);

    let guiAdapters = Copper.Session.guiAdapters;

    // init
    for (let i=0; i<guiAdapters.length; i++){
        if (typeof(guiAdapters[i].onProfileLoaded) === "function"){
            guiAdapters[i].onProfileLoaded();
        }
    }
    this.updateCurrentProfile();
};

Copper.Profiles.prototype.updateCurrentProfile = function() {
    let profileSettings = {settings: Copper.Session.settings, options:  Copper.Session.options};
    this.allProfiles[this.selectedProfile] = profileSettings;
    let newStorageObj = Copper.JsonUtils.stringify(this);
    Copper.ChromeComponentFactory.storeLocally(Copper.Profiles.profilesKey, newStorageObj);
};



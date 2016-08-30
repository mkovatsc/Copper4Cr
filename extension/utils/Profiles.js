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
 
Copper.Profiles = function() {
    this.allProfiles = {};
};

Copper.Profiles.prototype.allProfiles = undefined;
Copper.Profiles.prototype.autoStore = false;

Copper.Profiles.defaultProfile = "default_profile";

Copper.Profiles.profilesKey = "profiles";

Copper.Profiles.selectedProfileKey = "selected_profile";



Copper.Profiles.prototype.addNewProfile = function(name, settings, options) {
    if (!(name in this.allProfiles)) {
        this.allProfiles[name] = {settings: settings, options: options};
        let newStorageObj = Copper.JsonUtils.stringify(Copper.Session.profiles);
        Copper.Storage.storeLocally(Copper.Profiles.profilesKey, newStorageObj, function () {
            Copper.Storage.retrieveLocally(Copper.Profiles.profilesKey, function (id, items) {
                let profiles = items[id];

                Copper.Session.profiles = Copper.JsonUtils.parse(profiles);
            });
        });
    }
};

Copper.Profiles.prototype.deleteProfile = function(name) {
    if (name in this.allProfiles) {
        delete this.allProfiles[name];
        let newStorageObj = Copper.JsonUtils.stringify(Copper.Session.profiles);
        Copper.Storage.storeLocally(Copper.Profiles.profilesKey, newStorageObj);
    }
};

Copper.Profiles.prototype.createAndSelectDefaultProfile = function() {
    if (!(Copper.Profiles.defaultProfile in this.allProfiles)) {
        this.allProfiles = {};
        this.addNewProfile(Copper.Profiles.defaultProfile, Copper.Session.settings, Copper.Session.options);
        this.loadProfile(Copper.Profiles.defaultProfile);
        Copper.Storage.storeLocally(Copper.Profiles.selectedProfileKey, Copper.Profiles.defaultProfile);
    }
};


Copper.Profiles.prototype.loadProfile = function(name) {
    if (!(name in this.allProfiles)) {
        return;
    }

    var thisRef = this;
    Copper.Storage.retrieveLocally(Copper.Profiles.profilesKey, function(id, items) {
        let profiles = items[id];

            Copper.Session.profiles = Copper.JsonUtils.parse(profiles);

            Copper.Profiles.selectedProfile = name;
            let profile = Copper.Session.profiles.allProfiles[name];
            Copper.Session.settings = profile.settings;
            Copper.Session.options = profile.options;

            let guiAdapters = Copper.Session.guiAdapters;

            // init
            for (let i=0; i<guiAdapters.length; i++){
                if (typeof(guiAdapters[i].onProfileLoaded) === "function"){
                    guiAdapters[i].onProfileLoaded();
                }
            }

            Copper.Session.profiles.updateCurrentProfile();
    });

};

Copper.Profiles.prototype.changeProfile = function(name) {
    Copper.Storage.storeLocally(Copper.Profiles.selectedProfileKey, name, function() {
        window.location.reload();
    });
}

Copper.Profiles.prototype.updateCurrentProfile = function(forceUpdate) {
    if (forceUpdate || this.autoStore) {

        let profileSettings = {settings: Copper.Session.settings, options: Copper.Session.options};

        this.allProfiles[Copper.Profiles.selectedProfile] = profileSettings;
        let newStorageObj = Copper.JsonUtils.stringify(this);
        Copper.Storage.storeLocally(Copper.Profiles.profilesKey, newStorageObj);
    }
};
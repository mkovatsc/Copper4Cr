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
* GUI-Adapter for the ProfilesManager
* - Manages the different profiles in the profiles object on the session 
*/
Copper.ProfilesAdapter = function(){
};

Copper.ProfilesAdapter.loadNewestCreatedProfile = false;

Copper.ProfilesAdapter.beforeSessionInitialization = function() {
    document.getElementById("copper-profile-manager-add-profile").onclick = function() { Copper.ProfilesAdapter.addNewHTMLProfileInManager() };
    document.getElementById("copper-profile-manage-save-and-exit").onclick = function() { Copper.ProfilesAdapter.closeProfileManager(true); };
    document.getElementById("copper-profile-manager-cancel").onclick = function() { Copper.ProfilesAdapter.closeProfileManager(false); };
    document.getElementById("copper-toolbar-profiles-manage").onclick = Copper.ProfilesAdapter.openProfileManager;
    document.getElementById("copper-profile-manager-load-newest-profile").onclick = Copper.ProfilesAdapter.toggleLoadNewestProfile;
};


Copper.ProfilesAdapter.openProfileManager = function() {
    let profileManagerWindow = document.getElementById("manage-profile-window").parentElement;
    profileManagerWindow.classList.remove("hidden");

    let managerProfiles = document.getElementById("copper-profile-manager-container").getElementsByClassName("profile-manager-entry");
    while(managerProfiles.length > 0) managerProfiles[0].parentNode.removeChild(managerProfiles[0]);

    let profiles = Copper.Session.profiles.getAllProfileNames();
    for (let i= 0; i<profiles.length; i++) {
        if (profiles[i] !== Copper.Profiles.DEFAULT_PROFILE_KEY){
            Copper.ProfilesAdapter.addNewHTMLProfileInManager(profiles[i]);
        }
    }

    Copper.ProfilesAdapter.loadNewestCreatedProfile = false;
    document.getElementById("copper-profile-manager-load-newest-profile").checked = false;
};

Copper.ProfilesAdapter.closeProfileManager = function(storeChanges) {
    if (storeChanges) {
        let managerProfiles = document.getElementById("copper-profile-manager-container").getElementsByClassName("profile-manager-entry");

        // Profile name validation
        // First loop to check if profile names not empty, contain only letters and numbers and are unique
        let hasFormError = false;
        let validationProfileSet = {"Standard Profile" : true};
        for (let i = 0; i < managerProfiles.length; i++) {
            let managerProfileName = managerProfiles[i].firstElementChild.firstElementChild;

            if (!managerProfileName.disabled) {
                if (managerProfileName.value in validationProfileSet) {
                    managerProfileName.style.backgroundColor = "rgba(255,0,0,0.6)";
                    hasFormError = true;
                } else {
                    validationProfileSet[managerProfileName.value] = true;
                }

                if (managerProfileName.value === "") {
                    managerProfileName.style.backgroundColor = "rgba(255,255,0,0.6)";
                    hasFormError = true;
                }

                if (!/^[A-Za-z0-9 ]*$/g.test(managerProfileName.value)) {
                    managerProfileName.style.backgroundColor = "rgba(255,0,0,0.6)";
                    hasFormError = true
                }
            }
        }

        if (hasFormError) {
            Copper.PopupWindowAdapter.openErrorWindow("Illegal profile input", "One or more profile names are either empty, contain an illegal character (use letters and numbers only) or have a non-unique name!", true);
            return;
        }

        let lastNewlyCreatedProfile = undefined;
        let profileSelectionChanged = false;
        for (let i=0; i<managerProfiles.length; i++) {
            let managerProfileName = managerProfiles[i].firstElementChild.firstElementChild;
            let oldName = managerProfiles[i].dataset.name;

            if (managerProfileName.disabled) {
                // Profile deleted
                if (oldName !== undefined){
                    if (Copper.Session.profiles.selectedProfile === oldName){
                        Copper.Session.profiles.selectProfile(Copper.Profiles.DEFAULT_PROFILE_KEY);
                        profileSelectionChanged = true;
                    }
                    Copper.Session.profiles.deleteProfile(oldName);
                }
            }
            else if (oldName === undefined){
                // New Profile
                Copper.Session.profiles.addProfile(managerProfileName.value, Copper.Session.settings, Copper.Session.options, Copper.Session.payload, Copper.Session.layout);
                lastNewlyCreatedProfile = managerProfileName.value;
            }
            else if (managerProfileName.value !== oldName){
                // Profile renamed
                Copper.Session.profiles.renameProfile(oldName, managerProfileName.value);
            }
        }

        if (Copper.ProfilesAdapter.loadNewestCreatedProfile && lastNewlyCreatedProfile !== undefined) {
            Copper.Session.profiles.selectProfile(lastNewlyCreatedProfile);
            profileSelectionChanged = true;
        }
        if (profileSelectionChanged){
            Copper.Session.updateProfilesSelection(Copper.Session.profiles);
        }
        else {
            Copper.Session.updateProfiles(Copper.Session.profiles);
        }
    }

    let blockScreens = document.getElementById("popup-windows").getElementsByClassName("block_screen");
    for (let i = 0; i < blockScreens.length; i++) {
        blockScreens[i].classList.add("hidden");
    }
};

Copper.ProfilesAdapter.addNewHTMLProfileInManager = function(name) {
    let div = document.createElement("div");
    div.style.position = "relative";
    div.classList.add("flex");
    div.classList.add("hbox");
    div.classList.add("profile-manager-entry")
    if (name !== undefined) div.dataset.name = name;
    let span = document.createElement("span");
    span.classList.add("flex");
    span.classList.add("hbox");
    span.classList.add("text-input-custom");
    let input = document.createElement("input");
    input.classList.add("flex");
    input.type = "text";
    input.maxLength = 20;
    input.placeholder = "Name - Use letters/numbers";

    if (name !== undefined) {
        input.value = name;
    }

    let imgDelete = document.createElement("img");
    imgDelete.src = "skin/tool_delete.png";
    imgDelete.title = "Delete Profile";
    imgDelete.classList.add("profile-delete-button");
    span.appendChild(input);
    div.appendChild(span);
    div.appendChild(imgDelete);

    imgDelete.onclick = function() {

        if (this.classList.contains("profile-delete-button")) {
            this.classList.remove("profile-delete-button");
            this.classList.add("profile-undo-button");
            this.src = "skin/undo.png";
            this.title = "Undo Deletion of Profile";

            let crossOut = document.createElement("div");
            crossOut.style.width = "85%";
            crossOut.style.left = "0";
            crossOut.style.borderBottom = "3px solid red";
            crossOut.style.position = "absolute"
            crossOut.style.top = "10px";
            crossOut.classList.add("cross-out");
            div.appendChild(crossOut);
            let cover = document.createElement("div");
            cover.style.width = "85%";
            cover.style.left = "0";
            cover.style.height = "100%";
            cover.style.position = "absolute"
            cover.classList.add("cross-out");
            input.disabled = true;
            input.classList.add("disabled-profile-input")
            div.appendChild(cover);
        } else {
            this.classList.remove("profile-undo-button");
            this.classList.add("profile-delete-button");
            this.src = "skin/tool_delete.png";
            this.title = "Delete Profile";

            let divsCrossout = div.getElementsByClassName("cross-out");
            let bound = divsCrossout.length;
            for (let i = 0; i < bound; i++) {
                divsCrossout[0].parentNode.removeChild(divsCrossout[0]);
            }
            input.disabled = false;
            input.classList.remove("disabled-profile-input")
        }

    }

    document.getElementById("copper-profile-manager-load-newest-profile").checked = true;
    Copper.ProfilesAdapter.loadNewestCreatedProfile = true;

    document.getElementById("copper-profile-manager-container").insertBefore(div, document.getElementById("copper-profile-manager-container").lastElementChild);
};

Copper.ProfilesAdapter.toggleLoadNewestProfile = function() {
    Copper.ProfilesAdapter.loadNewestCreatedProfile = !Copper.ProfilesAdapter.loadNewestCreatedProfile;
    this.checked = Copper.ProfilesAdapter.loadNewestCreatedProfile;
};
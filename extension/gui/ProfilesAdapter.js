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
 
Copper.ProfilesAdapter = function(){
};


Copper.ProfilesAdapter.init = function() {
    document.getElementById("profile-add").onclick = function() { Copper.ProfilesAdapter.addNewHTMLProfileInManager() };
    document.getElementById("profile-save-and-exit").onclick = function() { Copper.ProfilesAdapter.closeProfileManager(true); };
    document.getElementById("profile-cancel").onclick = function() { Copper.ProfilesAdapter.closeProfileManager(false); };
    document.getElementById("copper-toolbar-profiles-manage").onclick = Copper.ProfilesAdapter.openProfileManager;

};


Copper.ProfilesAdapter.openProfileManager = function() {

    var profileManagerWindow = document.getElementById("manage-profile-window").parentElement;
    profileManagerWindow.classList.remove("hidden");

    var dropDownProfiles = document.getElementById("copper-toolbar-profiles-container").getElementsByClassName("profile-dropdown-entry");

    var managerProfiles = document.getElementById("copper-profile-manager-container").getElementsByClassName("profile-manager-entry");
    let length = managerProfiles.length;
    for (let i = 0; i < length; i++) {
        managerProfiles[0].parentNode.removeChild(managerProfiles[0]);
    }

    for (let i = 0; i < dropDownProfiles.length; i++) {
        Copper.ProfilesAdapter.addNewHTMLProfileInManager(dropDownProfiles[i].lastElementChild.innerHTML);
    }
};

Copper.ProfilesAdapter.closeProfileManager = function(storeChanges) {
    if (storeChanges) {
        var dropDownProfiles = document.getElementById("copper-toolbar-profiles-container").getElementsByClassName("profile-dropdown-entry");
        var managerProfiles = document.getElementById("copper-profile-manager-container").getElementsByClassName("profile-manager-entry");


        let oldProfileCount = dropDownProfiles.length;
        let oldManagerProfileCount = managerProfiles.length;
        for (var i = 0; i < dropDownProfiles.length; i++) {


            let managerProfileName = managerProfiles[i].firstElementChild.firstElementChild;
            let dropdownProfileName = dropDownProfiles[i].lastElementChild.innerHTML;

            if (managerProfileName.disabled) {
                // Profile deleted

                delete Copper.Session.profiles.allProfiles[dropdownProfileName];
                let profileToDeleteInDropdown = dropDownProfiles[i];
                if (profileToDeleteInDropdown.firstElementChild.classList.contains("selected")) {
                    // Select standard profile if profile to delete was previously selected
                    Copper.ToolbarAdapter.radioElement("copper-toolbar-profiles-standard");
                    Copper.Profiles.selectedProfile = Copper.Profiles.defaultProfile;
                    Copper.Storage.storeLocally(Copper.Profiles.selectedProfileKey, Copper.Profiles.selectedProfile);

                    Copper.Session.profiles.updateCurrentProfile(true);
                }
                profileToDeleteInDropdown.parentNode.removeChild(profileToDeleteInDropdown);

                managerProfiles[i].parentNode.removeChild(managerProfiles[i]);
                i--;

            }
            else if (managerProfileName.value === dropdownProfileName) {
                // Not changed
                continue;
            }
            else {
                // Profile renamed
                Copper.Session.profiles.allProfiles[managerProfileName.value] = Copper.Session.profiles.allProfiles[dropdownProfileName];
                delete Copper.Session.profiles.allProfiles[dropdownProfileName];
                dropDownProfiles[i].lastElementChild.innerHTML = managerProfileName.value;
            }
        }

        // New profiles
        for (; i < managerProfiles.length; i++) {
            let nextInput = managerProfiles[i].firstElementChild.firstElementChild;
            if (nextInput.value === "") {
                // Empty profile name -> skip
                //managerProfiles[i].parentNode.removeChild(managerProfiles[i]);
                //i--;
                continue;
            }

            // Add new profile
            Copper.Session.profiles.addNewProfile(nextInput.value, Copper.Session.settings, Copper.Session.options);
            Copper.ProfilesAdapter.addNewHTMLDropdownProfile(nextInput.value, Copper.Session.profiles, false);
        }
    }

    var blockScreens = document.getElementById("popup-windows").getElementsByClassName("block_screen");
    for (let i = 0; i < blockScreens.length; i++) {
        if (!blockScreens[i].classList.contains("hidden")){
            blockScreens[i].classList.add("hidden");
        }
    }
};

Copper.ProfilesAdapter.addNewHTMLProfileInManager = function(name) {
    let div = document.createElement("div");
    div.style.position = "relative";
    div.classList.add("flex");
    div.classList.add("hbox");
    div.classList.add("profile-manager-entry")
    let span = document.createElement("span");
    span.classList.add("flex");
    span.classList.add("hbox");
    span.classList.add("text-input-custom");
    let input = document.createElement("input");
    input.classList.add("flex");
    input.type = "text";
    input.maxLength = 20;
    input.placeholder = "Name your new Profile";
    
    if (name !== undefined) {
        input.value = name;
    }

    let imgDelete = document.createElement("img");
    imgDelete.src = "skin/tool_delete.png";
    imgDelete.title = "Delete Profile";
    span.appendChild(input);
    div.appendChild(span);
    div.appendChild(imgDelete);

    imgDelete.onclick = function() {
        let crossOut = document.createElement("div");
        crossOut.style.width = "100%";
        crossOut.style.borderBottom = "3px solid red";
        crossOut.style.position = "absolute"
        crossOut.style.top = "10px";
        div.appendChild(crossOut);
        let cover = document.createElement("div");
        cover.style.width = "100%";
        cover.style.height = "100%";
        cover.style.position = "absolute"
        input.disabled = true;
        input.classList.add("disabled-profile-input")
        div.appendChild(cover);
    }

    document.getElementById("copper-profile-manager-container").insertBefore(div, document.getElementById("copper-profile-manager-container").lastElementChild);
};

Copper.ProfilesAdapter.removeHTMLProfileInManager = function() {

};

Copper.ProfilesAdapter.addNewHTMLDropdownProfile = function(name, profiles, selected) {
    let li = document.createElement("li");
    li.classList.add("dropdown-item");
    li.classList.add("hbox");
    li.classList.add("profile-dropdown-entry")
    let div = document.createElement("div");
    div.classList.add("selection-icon");
    if (!selected) {
        div.classList.add("hidden");
    } else {
        div.classList.add("selected");
    }
    let span = document.createElement("span");
    span.innerHTML = '&#8226;';
    let p = document.createElement("p");
    p.innerHTML = name;
    div.appendChild(span);
    li.appendChild(div);
    li.appendChild(p);
    document.getElementById("copper-toolbar-profiles-container").appendChild(li);

    li.id = "copper-toolbar-profiles-profile-" + name.split(' ').join('-');

    li.onclick = function() {
        Copper.ToolbarAdapter.radioElement(li.id);
        profiles.changeProfile(name);
    }
};
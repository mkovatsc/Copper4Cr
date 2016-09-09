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
* GUI-Adapter for the ResourceTree on the left side
* - Listens for discovering messages and displays the result in the ResourceTree
* - Reacts to changes on the resource object on the session
* - Adds results from newer discoveries to the resource cache on the session
* - Installs a resizer and a collapser
*/
Copper.ResourceViewAdapter = function(){
};

Copper.ResourceViewAdapter.resizer = undefined;
Copper.ResourceViewAdapter.collapser = undefined;

Copper.ResourceViewAdapter.beforeSessionInitialization = function(){
    Copper.ResourceViewAdapter.resizer = Copper.Resizer.installResizer(document.getElementsByClassName("sidebar-left")[0], function(newWidth, newHeight){
        Copper.Session.layout.resourceTreeWidth = newWidth;
        Copper.Session.updateLayout(Copper.Session.layout);
    }, true, false, false);
    Copper.ResourceViewAdapter.collapser = Copper.Resizer.installCollapser(document.getElementsByClassName("sidebar-left")[0], "right", function(collapsed){
        Copper.Session.layout.resourceViewCollapsed = collapsed;
        Copper.Session.updateLayout(Copper.Session.layout);
    });
};

Copper.ResourceViewAdapter.onLayoutUpdated = function(){
    if (Copper.Session.layout.resourceTreeWidth !== undefined){
        Copper.ResourceViewAdapter.resizer.setWidth(Copper.Session.layout.resourceTreeWidth);
    }
    else {
        Copper.ResourceViewAdapter.resizer.reset();
    }
    Copper.ResourceViewAdapter.collapser.changeCollapsedState(Copper.Session.layout.resourceViewCollapsed);
};

Copper.ResourceViewAdapter.onEvent = function(event){
    if (event.type === Copper.Event.TYPE_REQUEST_COMPLETED) {
        let requestCoapMessage = event.data.requestCoapMessage;
        let responseCoapMessage = event.data.responseCoapMessage;

        let uriPathOption = requestCoapMessage.getOption(Copper.CoapMessage.OptionHeader.URI_PATH, {useUtf8: Copper.Session.options.useUtf8});
        let block2Option = responseCoapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2)
        let contentFormatOption = responseCoapMessage.getOption(Copper.CoapMessage.OptionHeader.CONTENT_FORMAT);
        if (uriPathOption.length === 2 && uriPathOption[0] === ".well-known" && uriPathOption[1] === "core" && block2Option.length === 0){
            if (responseCoapMessage.code.equals(Copper.CoapMessage.Code.CONTENT) && 
                  contentFormatOption.length === 1 && contentFormatOption[0] === Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_LINK_FORMAT.number){
                Copper.ResourceViewAdapter.updateResourceLinks(Copper.StringUtils.parseLinkFormat(Copper.ByteUtils.convertBytesToString(responseCoapMessage.payload, undefined, undefined, !Copper.Session.options.useUtf8)));
                let selectedResource = document.getElementById("copper-resource-tree").getElementsByClassName("selected");
            }
        }
    }
};

Copper.ResourceViewAdapter.onResourcesUpdated = function(){
    Copper.ResourceViewAdapter.clearTree();
    let address = Copper.Session.remoteAddress + ":" + Copper.Session.remotePort;
    let resources = Copper.Session.resources.getResourcesForAddress(address);
    for (let i=0; i<resources.length; i++){
        Copper.ResourceViewAdapter.addTreeResource(resources[i].segments, resources[i].attributes, address, Copper.Session.path);
    }
};

Copper.ResourceViewAdapter.updateResourceLinks = function(resources) {
    let address = Copper.Session.remoteAddress + ":" + Copper.Session.remotePort;
    Copper.Session.resources.removeResources(address);
    if (resources === undefined){
        return;
    }
    let uris = Object.keys(resources);
    for (let i=0; i<uris.length; i++){
        Copper.Session.resources.addResource(address, uris[i], resources[uris[i]]);
    }
    Copper.Session.updateResources(Copper.Session.resources);
};

Copper.ResourceViewAdapter.clearTree = function() {
	let tree = document.getElementById('copper-resource-tree');
    while (tree.firstChild !== null) tree.removeChild(tree.firstChild);
    tree.classList.remove("can_expand");
};

Copper.ResourceViewAdapter.onClickResource = function() {
    Copper.CoapResourceHandler.changeCoapResource(Copper.Session.protocol, Copper.Session.remoteAddress, Copper.Session.remotePort, this.dataset.uri);
};

Copper.ResourceViewAdapter.addTreeResource = function(segments, attributes, address, selectedPath) {
    var tree = document.getElementById('copper-resource-tree');

    var node = tree;

    for (let i = 0; i < segments.length; ++i) {

        if (segments[i]=='') continue;

        var cur = null;
        var allParagraphs = node.getElementsByTagName("p");

        // Check if segment already exists
        for (let j = 0; j < allParagraphs.length; j++) {
            if (allParagraphs[j].innerHTML === segments[i]) {
                cur = allParagraphs[j].parentNode;
                break;
            }
        }

        if (cur) {
            // Already exist
            node = cur;
            continue;
        } else {
            // New node, not exists yet

            // Add new 'ul' element and expand button to parent if its the first new child
            if (!node.classList.contains("can_expand")) {
                node.classList.add("can_expand");

                // Avoid adding another expand button for root of tree
                if (node.firstElementChild) {
                    let icon = document.createElement("img");
                    icon.src = "skin/expanded.png";

                    icon.addEventListener('click', function (event) {
                        let img = event.srcElement;
                        img.src = (img.getAttribute('src') === "skin/expanded.png"
                            ? "skin/collapsed.png"
                            : "skin/expanded.png");

                        let ul = img.parentElement.getElementsByTagName("ul")[0];

                        // Expanded view by default
                        if (ul.classList.contains("collapsed")) {
                            ul.classList.remove("collapsed");
                        } else {
                            ul.classList.add("collapsed");
                        }
                    });

                    node.insertBefore(icon, node.firstChild)
                }
                ul = document.createElement("ul");
                node.appendChild(ul);
            } else {
                // Not first new child, take existing 'ul'
                ul = node.lastElementChild;
            }

            // path until current level
            let path = segments.slice(0,i+1).join('/');

            let p = document.createElement("p");
            let textNode = document.createTextNode(segments[i]);
            p.appendChild(textNode);

            // Add uri as data attribute
            p.dataset.uri = segments.slice(1,i+1).join('/');
            if (p.dataset.uri === selectedPath || Copper.Session.path === undefined && p.dataset.uri === "") p.classList.add("selected");
            p.onclick = Copper.ResourceViewAdapter.onClickResource;

            // special icon
            let icon = document.createElement("img");

            if (path.match(/\/\.well-known$/)) {
                icon.src = "skin/resource_world.png";
            } else if (path === address) {
                icon.src = "skin/resource_home.png";
            } else if (i==0) {
                icon.src = "skin/resource_link.png";
            } else if (attributes['obs']) {
                icon.src = "skin/resource_observable.png";
            } else {
                // DEFAULT
                icon.src = "skin/resource_circle.png";
            }

            // Process attributes and add tooltips
            if (attributes && i+1==segments.length) {
                var tooltiptext = '';
                for (let attrib in attributes) {
                    if (attrib=='ct' && attributes[attrib]=='40') {
                        icon.src = "skin/resource_discovery.png";
                    }

                    if (tooltiptext) tooltiptext += '\n';
                    tooltiptext += attrib + '="'+attributes[attrib]+'"';
                }
                p.title = tooltiptext;
            }

            // Append everything to the new list node
            var li = document.createElement("li");
            li.appendChild(icon);
            li.appendChild(p);
            ul.appendChild(li);

            // New leaf node for next iteration
            node = li;
        }
    }
};
Copper.ResourceViewAdapter = function(){
};

Copper.ResourceViewAdapter.payloadStr = undefined;
Copper.ResourceViewAdapter.resources = new Object();
Copper.ResourceViewAdapter.allResourcesHTML = undefined;


Copper.ResourceViewAdapter.onProfileLoaded = function() {
    let settings = Copper.Session.settings;
    Copper.ResourceViewAdapter.resources = Copper.Session.settings.resources;
    Copper.ResourceViewAdapter.updateResourceLinks();
};


/* BUILD TEST TREE FOR DEBUG*/
Copper.ResourceViewAdapter.testTree = function(){
    var tree = document.getElementById('resource_tree');
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/.well-known/core", []);
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/obs", {obs: "true", rt: "observe", title: "obs title"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/multi-format", {ct: 0.41, title: "multi-format"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/seg1", {title: "seg1"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/seg1/seg2", {title: "seg2"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/seg1/seg2/seg3", {title: "seg3"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/random/subrandom", {first: "randomfirst", second: "randomsecond"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/random/subrandom", {first: "repeated", second: "discarded"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/path", {ct: 40, title: "path title"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/path/sub1", {title: "sub1 title"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/path/sub2", {title: "sub2 title"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/path/sub3", {title: "sub3 title"});
    Copper.ResourceViewAdapter.addTreeResource("coap://vs0.inf.ethz.ch:5683/test", {title: "test title"});
};

Copper.ResourceViewAdapter.onEvent = function(event){
    if (event.type === Copper.Event.TYPE_COAP_MESSAGE_RECEIVED) {

        let coapMessage = event.data.coapMessage;
        if (coapMessage.code.number !== Copper.CoapMessage.Code.CONTENT.number || !Copper.ToolbarAdapter.ongoingDiscoverRequest) {
            return;
        }

        let contentFormat = coapMessage.getOption(Copper.CoapMessage.OptionHeader.CONTENT_FORMAT);
        if (contentFormat[0] !== Copper.CoapMessage.ContentFormat.CONTENT_TYPE_APPLICATION_LINK_FORMAT.number) {
            throw new Error("Discovery requires 'application/link-format");
        }

        // On Discover Request
        let block2Option = coapMessage.getOption(Copper.CoapMessage.OptionHeader.BLOCK2);
        if (block2Option.length === 1) {
            block2Option = block2Option[0];
            if (block2Option.num === 0) {
                Copper.ResourceViewAdapter.payloadStr = new String();
            }
            Copper.ResourceViewAdapter.payloadStr += Copper.ByteUtils.convertBytesToString(coapMessage.payload);

            if (!block2Option.more) {

                Copper.ToolbarAdapter.ongoingDiscoverRequest = false;
                Copper.ResourceViewAdapter.updateResourceLinks(Copper.StringUtils.parseLinkFormat(Copper.ResourceViewAdapter.payloadStr));
            }

            return;
        } else {
            // Not blockwise
            Copper.ToolbarAdapter.ongoingDiscoverRequest = false;
            Copper.ResourceViewAdapter.updateResourceLinks(Copper.StringUtils.parseLinkFormat(Copper.ByteUtils.convertBytesToString(coapMessage.payload)));
        }
    }
};


Copper.ResourceViewAdapter.onClickResource = function() {
    Copper.Session.path = this.getAttribute("data-uri");
    Copper.CoapResourceHandler.changeCoapResource(Copper.Session.protocol, Copper.Session.remoteAddress, Copper.Session.remotePort, this.getAttribute("data-uri"), false);
};

Copper.ResourceViewAdapter.updateResourceLinks = function(add) {

    // merge links
    if (add) {
        for (var uri in add) {
            if (!Copper.ResourceViewAdapter.resources[uri]) {
                Copper.ResourceViewAdapter.resources[uri] = add[uri];
            }
        }
    }
    // add well-known resource to resource cache
    if (!Copper.ResourceViewAdapter.resources['/.well-known/core']) {
        Copper.ResourceViewAdapter.resources['/.well-known/core'] = new Object();
        Copper.ResourceViewAdapter.resources['/.well-known/core']['ct'] = 40;
        Copper.ResourceViewAdapter.resources['/.well-known/core']['title'] = 'Resource discovery';
    }

    //Copper.ResourceViewAdapter.clearTree();

    // sort by path
    let sorted = new Array();
    for (var uri in Copper.ResourceViewAdapter.resources) {
        sorted.push(uri);
    }
    sorted.sort();

    for (var entry in sorted) {

        let uri = sorted[entry];
        // add to tree view
        Copper.ResourceViewAdapter.addTreeResource( decodeURI(uri), Copper.ResourceViewAdapter.resources[uri] );
    }

    let allResourcesHTML = document.getElementsByTagName("P");
    for (let i = 0; i < allResourcesHTML.length; i++) {
        let resource = allResourcesHTML[i];
        resource.onclick = Copper.ResourceViewAdapter.onClickResource;
    }
};

Copper.ResourceViewAdapter.clearTree = function() {
	var tree = document.getElementById('resource_tree');
    while (tree.hasChildNodes()) {
        tree.removeChild(tree.firstChild);
    }
    tree.classList.remove("can_expand");
};

Copper.ResourceViewAdapter.addTreeResource = function(uri, attributes) {
    var tree = document.getElementById('resource_tree');
    var segments;

    // Get Uri address, port and the path (if exist)
    let search = window.location.search;
    let uriObject = Copper.StringUtils.parseUri(decodeURIComponent(search.substr(1)));
    var address = (uriObject.address != null ? uriObject.address : "");
    var port = (uriObject.port != null ? uriObject.port : "");
    var curPath = (uriObject.path != null ? uriObject.path : "");

    // Build segments by splitting
    var uriTokens = uri.match(/([a-zA-Z]+:\/\/)([^\/]+)(.*)/);

    if (uriTokens) {
        // absolute URI
        if (uriTokens[1]=='coap://') {
            segments = uriTokens[3].split('/');
            segments.shift();
            segments.unshift(uriTokens[2]);
        } else {
            Copper.logEvent("WARNING: Non-CoAP resource "+uri+"'");
            return;
        }
    } else {
        segments = uri.split('/');
        segments.shift();
        segments.unshift(address + ':' + port);
    }

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

            let activePath = address+':'+port+curPath;

            // path until current level
            let path = segments.slice(0,i+1).join('/');

            let p = document.createElement("p");
            p.addEventListener('click', function (event) {

                // Remove highlight of previously clicked node
                let tree = document.getElementById('resource_tree');
                let all_selected = tree.getElementsByClassName("selected");
                for (let i = 0; i < all_selected.length; i++) {
                    all_selected[i].classList.remove("selected");
                }

                // Add highlight of currently clicked node
                let p = event.srcElement;

                if (!p.classList.contains("selected")) {
                    p.classList.add("selected");
                }

                // Update status label
                let status = document.getElementById('status-label');

                let search = window.location.search;
                let uriObject = Copper.StringUtils.parseUri(decodeURIComponent(search.substr(1)));

                status.innerHTML = "Opened coap://" + address + ':' + port + '/' + p.getAttribute("data-uri");
            });
            let textNode = document.createTextNode(segments[i]);
            p.appendChild(textNode);

            // Add uri as data attribute
            p.dataset.uri = segments.slice(1,i+1).join('/');

            // special icon
            let icon = document.createElement("img");

            if (path.match(/\/\.well-known$/)) {
                icon.src = "skin/resource_world.png";
            } else if (path==address+':'+port) {
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

    Copper.Session.settings.resources = Copper.ResourceViewAdapter.resources;
    Copper.Session.storeChange();
};
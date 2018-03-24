Copper for Chrome (Cu<sub>4</sub>Cr) CoAP user-agent
====================================================

Implements [RFC7252](http://tools.ietf.org/html/rfc7252)

A Chrome app+extension to browse the Internet of Things
-------------------------------------------------------

### How to integrate the Copper sources into Chrome:

1. Clone the [repository](https://github.com/mkovatsc/Copper4Cr.git) (`git clone https://github.com/mkovatsc/Copper4Cr.git`)
2. Prepare shared code by either:
   * Copying the shared folder into the root directory of the app and in the root directory of the extension or
   * Running `install.bat` (Windows) or `install.sh` (Linux) in order to link the shared folder into the two folders
3. Install App & Extension in Chrome:
   1. Start Chrome and go to [chrome://extensions/](chrome://extensions/)
   2. Ensure that the Developer mode checkbox in the top right-hand corner is checked
   3. Click "Load unpacked extension…" and locate the app folder
   4. Click "Load unpacked extension…" and locate the extension folder
4. Set app ID of the Chrome App in the file `extension/endpoint/ClientPortChrome.js`. You can read the ID in the Copper Application entry in [chrome://extensions/](chrome://extensions/)
5. Use the Cu icon next to the address bar to open CoAP resources

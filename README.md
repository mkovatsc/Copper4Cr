Copper for Chrome (Cu<sub>4</sub>Cr) CoAP user-agent
====================================================

Implements [RFC7252](http://tools.ietf.org/html/rfc7252)

A Chrome app+extension to browse the Internet of Things
-------------------------------------------------------

### How to integrate the Copper sources into Chrome:

1. Clone the [repository](https://github.com/mkovatsc/Copper4Cr.git) (`git clone https://github.com/mkovatsc/Copper4Cr.git`) or simply [download](https://github.com/mkovatsc/Copper4Cr/archive/refs/heads/master.zip) and unzip somewhere
2. Prepare shared code by running `install.bat` (Windows) or `install.sh` (Linux)
   * Links the shared folder into the two other folders
3. Install App & Extension in Chrome:
   1. Start Chrome and go to `chrome://extensions/`
   2. Ensure that the Developer mode checkbox in the top right-hand corner is checked
   3. Click "Load unpacked" and locate the `app` folder
   4. Click "Load unpacked" and locate the `extension` folder
4. Set app ID of the Chrome App in the file `extension/endpoint/ClientPortChrome.js`:
   1. Under `chrome://extensions/` scroll to **Chrome Apps**
   2. Copy the ID field of the **Copper (Cu4Cr) Application** tile (not Extension)
   3. Paste as value of `appId` in line `41` of `extension/endpoint/ClientPortChrome.js`
5. Use the Cu icon under the *Extensions* puzzle icon to open CoAP resources

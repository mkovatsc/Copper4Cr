Copper Chrome
=============
* copy the shared folder into the root directory of the app and in the root directory of the extension
  OR
* run the LinkShared.bat script (on Windows) in order to link the shared folder into the two folders

* Launch App & Extension in Chrome
  1. Start Chrome and go to chrome://extensions/
  2. Ensure that the Developer mode checkbox in the top right-hand corner is checked
  3. Click "Load unpacked extension…" and locate the app folder
  4. Click "Load unpacked extension…" and locate the extension folder

* Set app id of the Chrome App in the file extension/endpoint/ClientPortChrome.js. You can read the appId
  in the Copper Application entry in chrome://extensions/
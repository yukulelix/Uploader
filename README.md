# Uploader


Uploader is a free very simple and customizable html5 avatar uploader that you can easily integrate in your projects.



## Settings

### Basic Settings
* name ("photo") : name sent in the POST request
* basePhoto ("") : the default photo displayed at the beginning
* postUrl ("") : the url to which is sent the POST reauest
* imageTypes" (["image/jpeg","image/png"]) : the accepted images types

### Advanced Settings
* onClientAbort
* onClientError
* onClientLoad
* onClientLoadEnd
* onClientLoadStart
* onClientProgress
* onServerAbort
* onServerError
* onServerLoad
* onServerLoadStart
* onServerProgress
* onServerReadyStateChange
* onSuccess


## Dependency

Uploader is written in plain javascript.
It depends on :

* [Classie.js](https://github.com/ded/bonzo) for class helper functions.
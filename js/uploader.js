/**
 * uploader.js v1.0.0
 * http://www.yukulelix.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Félix Bayart
 * http://www.yukulelix.com
 */
;( function( window ) {
	
	'use strict';

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function Uploader( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		this._init();
		this._initEvents();
	}

	Uploader.prototype.options = {
		"name": "photo",
		"basePhoto": "",
        "postUrl": "",
        "imageTypes": [
        	"image/jpeg",
        	"image/png"
        	],
        "maxSize": null,
        "onClientAbort": null,
        "onClientError": null,
        "onClientLoad": null,
        "onClientLoadEnd": null,
        "onClientLoadStart": null,
        "onClientProgress": null,
        "onServerAbort": null,
        "onServerError": null,
        "onServerLoad": null,
        "onServerLoadStart": null,
        "onServerProgress": null,
        "onServerReadyStateChange": null,
        "onSuccess": null
	}

	Uploader.prototype._init = function() {
		var self = this;

		self.el.innerHTML = 
			'<img src="'+self.options.basePhoto+'"/>'+
			'<svg viewPort="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">'+
				'<circle class="bar" r="46" cx="50" cy="50"></circle>'+
			'</svg>'+
			'<span class="percentage"></span>';

		self.img = self.el.querySelector("img");
		
		self.circle = self.el.querySelector("svg .bar");
		self.span = self.el.querySelector(".percentage");

		var img = self.img.getAttribute("src");

		self.l = 2*Math.PI*self.circle.getAttribute("r");
		self.circle.style.strokeDasharray = self.l + ' ' + self.l; 
		self.circle.style.strokeDashoffset = self.l;
	}

	Uploader.prototype._initEvents = function() {
		var self = this;

		self.el.addEventListener( 'dragenter', function(e) {
			classie.add( self.el, 'drag-over' );
			e.preventDefault();
		});

		self.el.addEventListener( 'dragover', function(e) {
			classie.add( self.el, 'drag-over' );
			e.preventDefault();
		});

		self.el.addEventListener( 'dragleave', function(e) {
			classie.remove( self.el, 'drag-over' );
			e.preventDefault();
		});

		self.el.addEventListener( 'drop', function(e) {
			classie.remove( self.el, 'drag-over' );
			var files = e.dataTransfer.files||e.target.files,
				mimeType = files[0].type,
				errors = false,
				size = files[0].size;

			if(self.options.maxSize && (size > self.options.maxSize)){
				errors = true;
			}

			if(self.options.imageTypes.indexOf(mimeType) < 0){
				errors = true;
			}

			if(!errors){
				self._fileHandler(files[0]);
			}
			else{
				classie.add( self.el, 'error' );
			}
			e.preventDefault();
		});
	}

	Uploader.prototype._fileHandler = function(file){
		var self = this;

		var crlf = '\r\n',
        	boundary = "yukulelix",
        	dashes = "--";

		var fileReader = new FileReader();

		fileReader.onabort = function (e) {
			if (self.options.onClientAbort) {
				self.options.onClientAbort(e, file);
			}
		};
		fileReader.onerror = function (e) {
			if (self.options.onClientError) {
				self.options.onClientError(e, file);
			}
		};
		fileReader.onload = function (e) {
			if (self.options.onClientLoad) {
				self.options.onClientLoad(e, file);
			}
			self.img.setAttribute("src", e.target.result);
		};
		fileReader.onloadend = function (e) {
			if (self.options.onClientLoadEnd) {
				self.options.onClientLoadEnd(e, file);
			}
		};
		fileReader.onloadstart = function (e) {
			if (self.options.onClientLoadStart) {
				self.options.onClientLoadStart(e, file);
			}
			classie.add( self.el, 'upload-started' );
		};
		fileReader.onprogress = function (e) {
			if (self.options.onClientProgress) {
				self.options.onClientProgress(e, file);
			}
		};
		fileReader.readAsDataURL(file);

		var xmlHttpRequest = new XMLHttpRequest();

		xmlHttpRequest.upload.onabort = function (e) {
			if (self.options.onServerAbort) {
				self.options.onServerAbort(e, file);
			}
		};
		xmlHttpRequest.upload.onerror = function (e) {
			if (self.options.onServerError) {
				self.options.onServerError(e, file);
			}
		};
		xmlHttpRequest.upload.onload = function (e) {
			if (self.options.onServerLoad) {
				self.options.onServerLoad(e, file);
			}
			classie.add( self.el, 'upload-ended' );
			setTimeout(function(){
				self._reset();
			}, 500);
		};
		xmlHttpRequest.upload.onloadstart = function (e) {
			if (self.options.onServerLoadStart) {
				self.options.onServerLoadStart(e, file);
			}
		};
		xmlHttpRequest.upload.onprogress = function (e) {
			if (self.options.onServerProgress) {
				self.options.onServerProgress(e, file);
			}
			if (e.lengthComputable) {
			    var val = (e.loaded / e.total) * 100;
				self._setPercentage(val);
			}
		};
		xmlHttpRequest.onreadystatechange = function (e) {			
			if (self.options.onServerReadyStateChange) {
				self.options.onServerReadyStateChange(e, file, xmlHttpRequest.readyState);
			}
			if (self.options.onSuccess && xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
				self.options.onSuccess(e, file, xmlHttpRequest.responseText);
			}
		};

		xmlHttpRequest.open("POST", self.options.postUrl, true);

		if (file.getAsBinary) { // Firefox

			var data = dashes + boundary + crlf +
				"Content-Disposition: form-data;" +
				"name=\"" + self.options.name + "\";" +
				"filename=\"" + unescape(encodeURIComponent(file.name)) + "\"" + crlf +
				"Content-Type: application/octet-stream" + crlf + crlf +
				file.getAsBinary() + crlf +
				dashes + boundary + dashes;

			xmlHttpRequest.setRequestHeader("Content-Type", "multipart/form-data;boundary=" + boundary);
			xmlHttpRequest.sendAsBinary(data);

		} else if (window.FormData) { // Chrome

			var formData = new FormData();
			formData.append(self.options.name, file);

			xmlHttpRequest.send(formData);

		}
	}

	Uploader.prototype._setPercentage = function(val){
		var self = this;

		if (val < 0) { val = 0;}
		if (val > 100) { val = 100;}

		var pct = Math.floor((1-val/100)*self.l);

		self.span.innerHTML = Math.floor(val)+"%";
		self.circle.style.strokeDashoffset = pct;
	}

	Uploader.prototype._reset = function(){
		var self = this;
			
		classie.remove( self.el, 'upload-ended' );
		classie.remove( self.el, 'upload-started' );
		classie.remove( self.el, 'error' );
		self._setPercentage(0);
	}

	// add to global namespace
	window.Uploader = Uploader;

})( window );
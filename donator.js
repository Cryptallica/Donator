/**************Crypt-donate main**************/
var CryptDonator_THEMES = [];
function CryptDonator(idOrObject, customize) {
	//Check id or create window from html object
	this.window;
	if(typeof(idOrObject) === "string") {
		this.window = document.getElementById(idOrObject);
	} else if(typeof(idOrObject) === "object") {
		this.window = idOrObject;
	} else {
		console.log("Invalid id or object for first param");
		return false;
	}
	
	if(!this.window.appendChild) {
		console.log("Failed to find id or use object");
		return false;
	}
	
	//UI data
	this.currentCoin = false;
	this.viewport = false;
	
	//UI Customizables
	this.customize = customize || {};
	this.theme = this.customize.theme || "default";
	
	this.init();
}

//prototype loads up everything from init
CryptDonator.prototype = {
    
    //Initialize, will setup libs and files and get config on window load
	init: function() {
		var crypt = this;
		this.getLocation();
		this.loadStylesheet();
		this.loadLibs();
		this.loadHTML();
		addEvent("load", window, function(){
	       crypt.loadConfig();
		   crypt.setupCopier();
	    });	
	    
		addEvent("resize", window, function(){crypt.changeSize();});
		crypt.changeSize();
		
	},
	
	//Gets this files script location
	getLocation: function() {
		//Script location
		var scripts = document.getElementsByTagName("script");
		for(var i=0;i < scripts.length;i++) {
			var scriptLocation = scripts[i].src.split("donator.js");
			if(scriptLocation.length === 2) {
				this.serverLocation = scriptLocation[0]; 
			}
		}
		if(!this.serverLocation) {console.log("Script location not found");}
	},
	
	//Loads theme stylesheet if not already loaded
	loadStylesheet: function() {
	    if(!in_array(this.theme, CryptDonator_THEMES)) {
    		var stylesheet = document.createElement("link");
    		stylesheet.rel = "stylesheet";
    		stylesheet.href = this.serverLocation + "_css/" + this.theme + ".css";
    		document.head.appendChild(stylesheet);
    		CryptDonator_THEMES.push(this.theme);
		}
	},
	
	//Loads vanillaQR and ZeroClipboard
	loadLibs: function() {
		var vanillalib = document.createElement("script");
		vanillalib.src = this.serverLocation + "lib/vanillaqr.js";
		
		var zerolib = document.createElement("script");
        zerolib.src = this.serverLocation + "lib/zeroclipboard/ZeroClipboard.min.js";
		
		document.head.appendChild(vanillalib);
		document.head.appendChild(zerolib);	
	},
	
	loadHTML: function() {
		var doc = document;
		var crypt = this;
		var t = "-"+this.theme;
		
		//create wrapper
		crypt.wrapper = doc.createElement("div");	
		crypt.wrapper.className = "cryptdonate-wrapper" + t;
		
		//Create coin navigator
		crypt.nav = doc.createElement("div");
		crypt.nav.className = "cryptdonate-nav" + t;
		//Create header
		crypt.header = doc.createElement("h2");
		crypt.header.className = "cryptdonate-header" + t;
		crypt.header.innerHTML = "Donate";
		crypt.headerCoin = doc.createElement("span");
		crypt.headerCoin.className = "cryptdonate-headercoin" + t;
		//Create mobile menu icon
		crypt.mobileMenu = doc.createElement("a");
		crypt.mobileMenu.className = "cryptmobilemenu" + t;
		//Create icons div
		crypt.iconsWrap = doc.createElement("span");
		crypt.iconsWrap.className = "cryptdonate-iconswrap" + t;
		addEvent("click", crypt.iconsWrap, function(e) {
			crypt.changeQr(e);
		});
		//append header +  to navigator
		crypt.header.appendChild(crypt.headerCoin);
		crypt.nav.appendChild(crypt.header);
		crypt.nav.appendChild(crypt.iconsWrap);
		crypt.nav.appendChild(crypt.mobileMenu);
		
		
		//Create QR show
		crypt.qrArea = doc.createElement("div");
		crypt.qrArea.className = "cryptdonate-qrArea" + t;
		//Create canvas
		crypt.qrCanvas = doc.createElement("div");
		crypt.qrCanvas.className = "cryptdonate-qrCanvas" + t;
		//Create address
		crypt.qrAddress = doc.createElement("a");
		crypt.qrAddress.className = "cryptdonate-address" + t;
		//Create qr copy + message
		crypt.qrCopy = doc.createElement("a");
		crypt.qrCopy.className = "cryptdonate-copy" + t;
		crypt.qrCopyMessage = doc.createElement("p");
		crypt.qrCopyMessage.className = "cryptdonate-copymessage" + t;
		
		//AppendQrData
		crypt.qrArea.appendChild(crypt.qrCanvas);
		crypt.qrArea.appendChild(crypt.qrAddress);
		crypt.qrArea.appendChild(crypt.qrCopy);
		crypt.qrArea.appendChild(crypt.qrCopyMessage);
		
		//Append All Data to wrapper
		crypt.wrapper.appendChild(crypt.nav);
		crypt.wrapper.appendChild(crypt.qrArea);
		
		//Append all to window
		crypt.window.appendChild(crypt.wrapper);
	},
	
	//Grabs config from either customize.src or ./config.json
	loadConfig: function() {
		var crypt = this;
		crypt.coin = [];
		
		//Extract data from config
		function extractConfig() {
		    for(var coin in crypt.config) {
                var coinArray = crypt.config[coin];
                coinArray["coinname"] = coin;
                crypt.coin.push(coinArray);
            }
            
            if(crypt.coin.length === 0) {return false;}
            crypt.loadCoins();
		}

		//get config.json found in this file root
		var configUrl = crypt.customize.src || crypt.serverLocation + "config.json";
		ajaxJson(configUrl, function(responseText) {
			crypt.config = JSON.parse(responseText);
			extractConfig();
		}); 
	},
	
	//Bulk work, will load each coin based on src in config or create via vanillaQR
	loadCoins: function() {
		var doc = document;
		var crypt = this;
		var coinArray = [];
		
		var l = crypt.coin.length;
		for(var i = 0; i < l; i++) {
			var coin = crypt.coin[i];
			
			//Create Icons
			var coinDiv = coin["coinDiv"] = doc.createElement("a");	
			coinDiv.setAttribute("data", coin["coinname"]);
			coinDiv.className = "cryptdonate-coindiv"  + "-" + crypt.theme;
			
			//Create icon Img
			var coinImage = doc.createElement("img");
			coinImage.src = crypt.serverLocation + "_icons/" + coin["coinname"] + ".png";
			
			//Create Icon Text
			var iconText = doc.createElement("h3");
			iconText.innerHTML = coin["coinname"].capitalize();
			
			//Append Icons
			coinDiv.appendChild(coinImage);
			coinDiv.appendChild(iconText);
			crypt.iconsWrap.appendChild(coinDiv);
						
			//Create Qr wrap
			coin["qrElement"] = doc.createElement("div");
			coin["qrAni"] = new animateHTML(coin["qrElement"], {
				classOn: "sizeUp",
				classOff: "sizeDown"
			});
			
			//Create QR url
			coin["address"] = coin["address"] || "";
			var qrUrl = coin["coinname"] + ":" + coin["address"];
			if(coin["label"]) {
			    qrUrl+="?label="+ encodeURIComponent(coin["label"]);
		    }

			//Check if has image SRC 
			if(coin["src"]) {
			    var qrimage = new Image();
			    qrimage.src = coin["src"];
			    coin["qrElement"].appendChild(qrimage);
			    var qrData = coin["qrElement"];
			} 
			//Create thru canvas if no src set
			else {
		        var qrData = new VanillaQR(coin["qrElement"], qrUrl, {png: true});
			}
			
			//Append to qr viewer
			this.qrCanvas.appendChild(coin["qrElement"]); 
		}
		
		crypt.changeQr(crypt.coin[0]["coinname"]);
	},
	
	//Change qr called on iconswrap element
	changeQr: function(e) {
		//Get string or coinname
		var crypt = this;
		if(typeof(e) === "string") {var coinName = e;}
		else {
			var thisTarget = e.target;
			if(thisTarget.tagName === "H3" || 
			   thisTarget.tagName === "IMG") {
				thisTarget = thisTarget.parentNode;
			}	
			
			var coinName = thisTarget.getAttribute("data");
		}
		
		//Don't change if currently set.
		if(crypt.currentCoin) {
			if(crypt.currentCoin["coinname"] === coinName) {return;}
			//Hide Old Qr
			setTimeout(function() {
				crypt.currentCoin["coinDiv"].className = "cryptdonate-coindiv" + "-" + crypt.theme;
				crypt.currentCoin["qrAni"].hide();
			}, 50);
		}		
		
		var coin = this.config[coinName];
		this.qrAddress.innerHTML = coin["address"];
		this.qrAddress.href = coin["coinname"] + ":" + coin["address"];
		this.qrCopy.setAttribute("data-clipboard-text", coin["address"]);
		
		setTimeout(function() {
			coin["qrAni"].show();
			coin["coinDiv"].className = coin["coinDiv"].className + " selected";
			crypt.currentCoin = coin;
			crypt.headerCoin.innerHTML = " " + coin["coinname"].capitalize();
		}, 500);	
	},
	
	//Copy qr address to clipboard using ZeroClipboard
	setupCopier: function() {
	    var crypt = this;
	    crypt.zeroClipboard = new ZeroClipboard(crypt.qrCopy);
	    console.log(crypt.qrCopy);
	    crypt.zeroClipboard.on("ready", function(readyEvent) {
	        crypt.zeroClipboard.on("aftercopy", function(event) {
	            crypt.qrCopyMessage.innerHTML = "Copied " + crypt.currentCoin["coinname"] + " address to clipboard";
	            setTimeout(function() {
	                crypt.qrCopyMessage.innerHTML = "";
	            }, 2000);
	        });
	    });
	},
	
	//Change size on window resize < 570 >
	changeSize: function() {
		var crypt = this;
		var wz = window.innerWidth;
		var t = "-" + crypt.theme;
		//Mobile layout
		if(wz < 570 && crypt.viewport !== "mobile") {
			crypt.wrapper.className = "cryptdonate-wrapper" + t + " cryptmobile" + t;
			crypt.viewport = "mobile";
			crypt.touchShow();
		} 
		//Desktop layout
		else if(wz > 570 && this.viewport !== "desktop") {
			crypt.wrapper.className = "cryptdonate-wrapper" + t + " cryptdesktop" + t;
			crypt.viewport = "desktop";
			crypt.header.onclick = null;
			crypt.nav.style.height = null;
		}
	},
	
	//Touch show added on mobile element because of lack of hover
	touchShow: function() {
		var crypt = this;
		crypt.nav.style.height = "1.5em";
		crypt.header.onclick = function() {
			if(crypt.iconsWrap.style.display === "block") {
				crypt.iconsWrap.style.display = "none";
			} else {
				crypt.iconsWrap.style.display = "block";
			}
		};
	}
};


/**************Utils**************/
function trim(text) {return text.replace(/^\s+|\s+$/g, '');}

function in_array(needle, haystack, argStrict) {
    var key = '',
    strict = !! argStrict;
    if (strict) {
        for(key in haystack) {if (haystack[key] === needle) {return true;}}
    } else {
        for(key in haystack) {if (haystack[key] == needle) {return true;}}
    }
    return false;
}

function ajaxJson(page, callback) {
	page = page || "";
	
	var request = new Xhr();
	request.open("GET", page, true);	
	request.setRequestHeader("Content-Type", "application/json");
	//request.responseType = "text";
	request.onreadystatechange = function() {
		if(request.readyState === 4 && request.status===200) {
			var responseText = trim(this.response);
			callback(responseText);
		}
	};
	request.send(null);
}

function Xhr(){
    try{return new XMLHttpRequest();}catch(e){}try{return new ActiveXObject("Msxml3.XMLHTTP");}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.6.0");}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP.3.0");}catch(e){}try{return new ActiveXObject("Msxml2.XMLHTTP");}catch(e){}try{return new ActiveXObject("Microsoft.XMLHTTP");}catch(e){}return null;
}

function addEvent(evnt, elem, func, bubble) {
	if (elem.addEventListener) {
		elem.addEventListener(evnt,func,bubble);
	} else if (elem.attachEvent) { 
			elem.attachEvent("on"+evnt, func);
	} 
	else { elem[evnt] = func;}
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function addEvent(evnt, elem, func, bubble) {
	if (elem.addEventListener) {
		elem.addEventListener(evnt,func,bubble);
	} else if (elem.attachEvent) { 
			elem.attachEvent("on"+evnt, func);
	} 
	else { elem[evnt] = func;}
}

//Animator
function animateHTML(animator, customize) {
	if(typeof(animator) === "string") {this.animator = document.getElementById(animator);}
	else if(typeof(animator) === "object") {
		this.animator = animator;
	} else {
		console.log("Not object or string for animator.");
		return false;	
	}
	
	customize = customize || {};
	
	//Animation Data
	this.classOn = customize.classOn || "";
	this.classOff = customize.classOff || "";
	this.aniTime = customize.animationTime || 750;
	this.showDefault = customize.showDefault || false;
	//Wrapper Data
	this.isOn = false;
		
	this.init();
}

animateHTML.prototype = {
	init: function() {
		if(!this.showDefault) {this.clear();}	
		else {
			this.isOn = true;
			this.animator.className = this.classOn;	
			this.animator.style.display = "block";
		}
	},
	
	show: function() {
		if(this.isOn) {return true;}
		
		this.animator.style.display = "block";
		this.animator.style.opacity = "0";
		
		var thisOm = this;
		setTimeout(function() {
			thisOm.animator.className = thisOm.classOn;
			thisOm.animator.style.opacity = "1";
		}, 100);
		this.isOn = true;
	},
	
	on: function() {
		this.animator.className = this.classOn;
		this.animator.style.display = "block";
		this.animator.style.opacity = "1";
		this.isOn = true;
	},
	
	hide: function() {
		if(!this.isOn) {return true;}
		
		this.animator.className = this.classOff;
		this.animator.style.opacity = "0";
		
		var thisOm = this;
		setTimeout(function() {
			thisOm.animator.style.display = "none";
		}, thisOm.aniTime);
		this.isOn = false;
	},
	
	clear: function() {
		this.animator.style.display = "none";
		this.animator.className = this.classOff;
		this.isOn = false;
	},
	
	toggle: function() {
		if(this.isOn) {
			this.hide();
		} else {
			this.show();
		}
	}
};

/**
 * Donater
 */

"use strict";

var Cryptallica = Cryptallica || {};

Cryptallica.Donater = function( customize ) {

    var scope = this;

    var customize = typeof( customize ) === "object" ?
        Object.assign({}, customize )
        : {};

    scope.config = customize;


    //Get dom

    var idOrObject = customize.domElement;


    //Check id or create window from html object

    if(typeof(idOrObject) === "string") {

        scope.domElement = document.getElementById( idOrObject );

    } else if(typeof(idOrObject) === "object") {

        scope.domElement = idOrObject;

    } else {

        scope.domElement = document.createElement( "div" );

    }

    if( ! scope.domElement.appendChild ) {

        throw new Error("Failed to find id or use object");

    }

    //UI data

    scope.config = customize;

    scope.theme = scope.config.theme || "default";

    scope.coins = {};


    //html

    scope.headEl = document.getElementsByTagName("head")[0];

    scope.init();

}

//prototype loads up everything from init

Cryptallica.Donater.prototype = {


    /**
     * Props
     */

    domElement: null,

    config: {},

    currentCoin: false,

    viewport: false,

    headEl: null,

    theme: "",


    /**
     * Dom Elements
     */

    nav: null,

    header: null,

    headerCoin: null,

    mobileMenu: null,

    iconsWrap: null,

    qrArea: null,

    qrCanvas: null,

    qrAddress: null,

    qrCopy: null,

    qrCopyMessage: null,

    wrapper: null,


    //Loaded coins

    coins: {},


    //Initialize, will setup libs and files and get config on window load
    init: function() {

        var scope = this;

        scope.getLocation();
        scope.loadStylesheet();
        scope.loadHTML();

        scope.loadConfig();
        scope.setupCopier();

        window.addEventListener("resize", window, function() {
            scope.changeSize();
        });

        scope.changeSize();

    },


    //Gets this files script location

    getLocation: function() {

        var scope = this;

        //Script location
        var scripts = document.getElementsByTagName("script");

        for( var i=0;i < scripts.length;i++ ) {

            var scriptLocation = scripts[i].src.split("donater.min.js");

            if( scriptLocation.length === 2 ) {

                scope.serverLocation = scriptLocation[0];

            }

        }

        if( ! scope.serverLocation ) {

            console.warn("Script location not found");

        }

    },


    //Loads theme stylesheet if not already loaded

    loadStylesheet: function() {

        var scope = this;

        if( ! Cryptallica.Donater.Themes[ scope.theme ] ) {

            var stylesheet = document.createElement( "link" );
            stylesheet.rel = "stylesheet";
            stylesheet.href = scope.serverLocation + "css/" + scope.theme + ".css";

            scope.headEl.appendChild( stylesheet );

            Cryptallica.Donater.Themes[ scope.theme ] = true;

        }

    },


    //

    loadHTML: function() {

        var scope = this;

        var doc = document;
        var t = "-" + scope.theme;

        //create wrapper
        scope.wrapper = doc.createElement("div");
        scope.wrapper.className = "cryptdonate-wrapper" + t;

        //Create coin navigator
        scope.nav = doc.createElement("div");
        scope.nav.className = "cryptdonate-nav" + t;

        //Create header
        scope.header = doc.createElement("h2");
        scope.header.className = "cryptdonate-header" + t;
        scope.header.innerHTML = "Donate";
        scope.headerCoin = doc.createElement("span");
        scope.headerCoin.className = "cryptdonate-headercoin" + t;

        //Create mobile menu icon
        scope.mobileMenu = doc.createElement("a");
        scope.mobileMenu.className = "scopemobilemenu" + t;

        //Create icons div
        scope.iconsWrap = doc.createElement("span");
        scope.iconsWrap.className = "cryptdonate-iconswrap" + t;

        scope.iconsWrap.addEventListener("click", function(e) {
            scope.changeQr(e);
        }, false );

        //append header +  to navigator
        scope.header.appendChild(scope.headerCoin);
        scope.nav.appendChild(scope.header);
        scope.nav.appendChild(scope.iconsWrap);
        scope.nav.appendChild(scope.mobileMenu);


        //Create QR show
        scope.qrArea = doc.createElement("div");
        scope.qrArea.className = "cryptdonate-qrArea" + t;

        //Create canvas
        scope.qrCanvas = doc.createElement("div");
        scope.qrCanvas.className = "cryptdonate-qrCanvas" + t;

        //Create address
        scope.qrAddress = doc.createElement("a");
        scope.qrAddress.className = "cryptdonate-address" + t;


        //Create qr copy + message
        scope.qrCopy = doc.createElement("a");
        scope.qrCopy.className = "cryptdonate-copy" + t;
        scope.qrCopy.setAttribute( "id", "cryptallica-copy-" + Date.now() );

        scope.qrCopyMessage = doc.createElement("p");
        scope.qrCopyMessage.className = "cryptdonate-copymessage" + t;

        //AppendQrData
        scope.qrArea.appendChild(scope.qrCanvas);
        scope.qrArea.appendChild(scope.qrAddress);
        scope.qrArea.appendChild(scope.qrCopy);
        scope.qrArea.appendChild(scope.qrCopyMessage);

        //Append All Data to wrapper
        scope.wrapper.appendChild(scope.nav);
        scope.wrapper.appendChild(scope.qrArea);

        //Append all to window
        scope.domElement.appendChild(scope.wrapper);

    },


    //Grabs config from either customize.src or ./config.json

    loadConfig: function() {

        var scope = this;

        for( var coin in scope.config.coins ) {

            var coinArray = scope.config.coins[ coin ];

            var coinData = scope.getCoinData( coin );
            coinData = Object.assign({}, coinData );

            if( coinData === null ) {

                console.warn( "No coin data in market cap for " + coin );

            }

            if( ! coinArray.address ) {

                console.warn( "No address given for coin " + coin );

            }

            var sym = coin.toUpperCase();

            scope.config.coins[ sym ] = coinArray;

            scope.coins[ sym ] = coinData;

        }

        if( scope.coins.length === 0 ) {

            console.warn( "No coins given to config" );

            return;

        }

        scope.loadCoins();

    },



    /**
     * Get coin data from market cap
     *
     * @param String id
     *
     * @return Object|null
     *
     */

    getCoinData: function( id ) {

        return Cryptallica.Donater.Coins[ id.toUpperCase() ] || null;

    },


    //Bulk work, will load each coin based on src in config or create via vanillaQR

    loadCoins: function() {

        var scope = this;

        var doc = document;
        var coinArray = [];

        for(var coinName in scope.coins ) {

            var coin = scope.coins[ coinName ];
            var configCoin = scope.coins[ coinName ];

            //Create Icons
            var coinDiv = coin["coinDiv"] = doc.createElement("a");
            coinDiv.setAttribute("data", coin["symbol"]);
            coinDiv.className = "cryptdonate-coindiv"  + "-" + scope.theme;

            //Create icon Img
            var coinImage = doc.createElement("img");
            coinImage.src = scope.serverLocation + "images/" + coin["id"] + ".png";

            //Create Icon Text
            var iconText = doc.createElement("h3");
            iconText.innerHTML = coin["name"];

            //Append Icons
            coinDiv.appendChild(coinImage);
            coinDiv.appendChild(iconText);
            scope.iconsWrap.appendChild(coinDiv);

            //Create Qr wrap
            coin["qrElement"] = doc.createElement("div");
            coin["qrAni"] = new animateHTML( coin["qrElement"], {
                classOn: "sizeUp",
                classOff: "sizeDown"
            });


            //Create QR url

            var coinNameUrl = coin["id"];

            var qrUrl = coinNameUrl + ":" + configCoin.address;

            if(coin["label"]) {

                qrUrl+="?label="+ encodeURIComponent(coin["label"]);

            }


            //Check if has image SRC
            if(coin["src"]) {

                var qrimage = new Image();
                qrimage.src = coin["src"];
                coin["qrElement"].appendChild( qrimage );
                var qrData = coin["qrElement"];

            }

            //Create thru canvas if no src set
            else {

                var qrData = new VanillaQR({
                    url: qrUrl
                });

                coin.qrElement.appendChild( qrData.domElement );

            }

            //Append to qr viewer
            this.qrCanvas.appendChild(coin["qrElement"]);

        }

        scope.changeQr( Object.keys( scope.coins )[0] );

    },


    //Change qr called on iconswrap element

    changeQr: function(e) {

        //Get string or coinname
        var scope = this;

        if(typeof(e) === "string") {

            var coinName = e;

        } else {

            var thisTarget, thisTargetTag;

            if( ! e.target ) {

                thisTarget = event.srcElement;
                console.dir(thisTarget);
                thisTargetTag = thisTarget.nodeName;

            } else {

                thisTarget = e.target;
                thisTargetTag = thisTarget.tagName;

            }

            if(thisTargetTag === "H3" ||
                thisTargetTag === "IMG") {
                thisTarget = thisTarget.parentNode;
            }

            var coinName = thisTarget.getAttribute("data");

        }


        //Don't change if currently set.

        if( scope.currentCoin ) {

            if( scope.currentCoin["name"] === coinName ) { return; }

            //Hide Old Qr

            setTimeout( function() {

                scope.currentCoin["coinDiv"].className = "cryptdonate-coindiv" + "-" + scope.theme;
                scope.currentCoin["qrAni"].hide();

            }, 50);

        }

        var coin = scope.coins[coinName];
        var configCoin = scope.config.coins[coinName];

        scope.qrAddress.innerHTML = configCoin.address;
        scope.qrAddress.href = coin["name"] + ":" + configCoin.address;

        setTimeout(function() {

            coin["qrAni"].show();
            coin["coinDiv"].className = coin["coinDiv"].className + " selected";
            scope.currentCoin = coin;
            scope.headerCoin.innerHTML = " " + coin["name"];

        }, 250 );

    },


    /**
     * Copy qr address to clipboard using https://clipboardjs.com/
     */

    setupCopier: function() {

        var scope = this;

        if( ! Clipboard.isSupported() ) {

            scope.qrCopy.style.display = "none";

            return;

        }

        var clipboard = new Clipboard( scope.qrCopy, {
            text: function() {
                return scope.qrAddress.innerHTML
            }
        });

        clipboard.on('success', function(e) {

            scope.qrCopyMessage.innerHTML = scope.currentCoin.name + " address copied";

            setTimeout( function() {

                scope.qrCopyMessage.innerHTML = "";

            }, 1000 );

        });

    },


    //Change size on window resize < 570 >

    changeSize: function() {

        var scope = this;
        var wz = window.innerWidth;
        var t = "-" + scope.theme;

        //Mobile layout

        if(wz < 570 && scope.viewport !== "mobile") {
            scope.wrapper.className = "cryptdonate-wrapper" + t + " scopemobile" + t;
            scope.viewport = "mobile";
            scope.touchShow();
        }

        //Desktop layout

        else if(wz > 570 && this.viewport !== "desktop") {
            scope.wrapper.className = "cryptdonate-wrapper" + t + " scopedesktop" + t;
            scope.viewport = "desktop";
            scope.header.onclick = null;
            scope.nav.style.height = null;
        }

    },


    //Touch show added on mobile element because of lack of hover

    touchShow: function() {

        var scope = this;

        scope.nav.style.height = "1.5em";

        scope.header.onclick = function() {

            if(scope.iconsWrap.style.display === "block") {

                scope.iconsWrap.style.display = "none";

            } else {

                scope.iconsWrap.style.display = "block";

            }

        };

    }

};


/**
 * Global theme cache
 */

Cryptallica.Donater.Themes = {};


/** Utils **/

//Animator
function animateHTML(animator, customize) {
    var scope = this;

    if(typeof(animator) === "string") {scope.animator = document.getElementById(animator);}
    else if(typeof(animator) === "object") {
        scope.animator = animator;
    } else {
        console.log("Not object or string for animator.");
        return false;
    }

    customize = customize || {};

    //Animation Data
    scope.classOn = customize.classOn || "";
    scope.classOff = customize.classOff || "";
    scope.aniTime = customize.animationTime || 750;
    scope.showDefault = customize.showDefault || false;
    //Wrapper Data
    scope.isOn = false;

    scope.init();
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

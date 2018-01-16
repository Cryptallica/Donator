#!/usr/bin/env node

// usage
// ./build-coins.js <LIMIT>

var HTTPS = require( "https" );

var FS = require( "fs" );

var Request = require( "request" );


//

var limit = process.argv[ 2 ] | 0;

var API_URL = "https://api.coinmarketcap.com/v1/ticker/";

var url = API_URL + ( limit ? "?limit=" + limit : "" );


var buildURL = __dirname + "/data/market-cap.json";

var IMAGES_DIR = __dirname + "/images/";


// Get data

HTTPS.get( url, function( res ) {

    getFile( url, function( body ) {

        FS.writeFileSync( buildURL, body);

        var list = JSON.parse( body );

        downloadImages( list );

    });

});


function getFile( url, callback ) {

    HTTPS.get( url, function( res ) {

        var body = "";

        res.on( "data", function( data ) {

            body += data;

        });

        res.on( "end", function() {

            callback( body );

        });

    });

}
function download( uri, filename, callback ){

    Request.head(uri, function( err, res, body ) {

        Request( uri )
            .pipe( FS.createWriteStream( filename ) );

    });

};

function downloadImages( list ) {

    var ll = list.length;

    for( var i = 0; i < ll; ++ i ) {

        downloadImage( list[ i ] );

    }

}

function downloadImage( coin ) {

    var url = "https://files.coinmarketcap.com/static/img/coins/128x128/" + coin.id + ".png"

    var saveUrl = IMAGES_DIR + coin.id + ".png";

    download( url, saveUrl );

}

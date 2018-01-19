#!/usr/bin/env node

// usage
// ./build-coins.js <LIMIT>

var HTTPS = require( "https" );

var FS = require( "fs" );

var Request = require( "request" );

var Async = require( "async" );


//

var limit = process.argv[ 2 ] | 0;

var API_URL = "https://api.coinmarketcap.com/v1/ticker/";

var url = API_URL + ( limit ? "?limit=" + limit : "" );


var buildURL = __dirname + "/data/market-cap.json";

var IMAGES_DIR = __dirname + "/images/";


// Get data

HTTPS.get( url, function( res ) {

    getFile( url, function( body ) {

        var list = JSON.parse( body );

        var hashList = {};

        var ll = list.length;

        for( var i = 0; i < ll; ++ i ) {

            var coin = list[ i ];

            hashList[ coin.symbol ] = coin;

        }

        FS.writeFileSync( buildURL, JSON.stringify( hashList ) );

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
            .pipe( FS.createWriteStream( filename ) )
            .on( "close", callback );

    });

};

function downloadImages( list ) {

    Async.mapLimit( list, 50, downloadImage, function( err, results ) {

    });

}

function downloadImage( coin, callback ) {

    console.log( "Downloading coin image : " + coin.id );

    var url = "https://files.coinmarketcap.com/static/img/coins/128x128/" + coin.id + ".png"

    var saveUrl = IMAGES_DIR + coin.id + ".png";

    download( url, saveUrl, callback );

}

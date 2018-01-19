//Compiler test
//By Chuck

var COMPILER = require( "cfcompile" );
var FS = require( "fs" );

COMPILER.compileFromConfigFile(  __dirname + "/build-config.json",  function(compressed) {

    FS.writeFile( __dirname + "/build/donater.min.js", compressed, function( err ) {

        if(err) {

            console.log(err);

        } else {

            console.log("The file was saved!");

        }

    });

});

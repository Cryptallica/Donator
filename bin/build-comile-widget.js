//Compiler test
//By Chuck

var COMPILER = require( "cfcompile" );
var FS = require( "fs" );

COMPILER.compileFromConfigFile(  __dirname + "/build-config-widget.json",  function(compressed) {

    FS.writeFile( __dirname + "/build/donater.widget.min.js", compressed, function( err ) {

        if(err) {

            console.log(err);

        } else {

            console.log("The file was saved!");

        }

    });

});

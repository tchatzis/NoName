self.addEventListener( "message", function( e )
{
    const data = e.data.a;

    //self.importScripts( "/js/ ... .js", "/js/ ... .js" );

    self.postMessage();
} );
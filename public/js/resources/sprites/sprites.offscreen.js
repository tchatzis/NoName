var Offscreen = function( args )
{
    var size = Math.pow( 2, 7 );
        args.size = size;
        args.colors = args.data.colors;
    var callback = args.callback;
    var canvas = document.createElement( "canvas" );
        canvas.width = size;
        canvas.height = size;
        canvas.style.backgroundColor = args.colors.background;
    var offscreen = canvas.transferControlToOffscreen();

    delete args.callback;

    var worker = new Worker( "/js/shared/sprites/sprites.offscreen.worker.js" );
        worker.postMessage( { f: "init", a: args, canvas: offscreen }, [ offscreen ] );
        worker.addEventListener( "message", function( e )
        {
            callback.call( null, e.data );
        } );
};
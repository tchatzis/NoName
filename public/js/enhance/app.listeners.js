const Listeners = function()
{
    var scope = "listeners";
    var app = this;
        app[ scope ] = {};

    function remove( f )
    {
        if ( app[ scope ].map.has( f ) )
            app[ scope ].map.delete( f );
    }

    function f( e, args )
    {
        e.preventDefault();

        if ( e.key === args.value )
            args.function()
    }

    app[ scope ].map = new WeakMap();
    
    app[ scope ].add = function( target, args )
    {
        target.addEventListener( args.type, ( e ) => f( e, args ), false );
        app[ scope ].map.set( args.function, target );
    };

    app[ scope ].remove = function( target, args )
    {
        target.removeEventListener( args.type, ( e ) => f( e, args ), false );
        remove( args.function );
    };

    var resize = function()
    {
        this.stage.camera.aspect = window.innerWidth / window.innerHeight;
        this.stage.camera.updateProjectionMatrix();
        this.stage.renderer.setSize( window.innerWidth, window.innerHeight );
    }.bind( this );

    window.addEventListener( "click",       event => event.preventDefault() );
    window.addEventListener( "contextmenu", event => event.preventDefault() );
    window.addEventListener( "resize", resize, false );
};
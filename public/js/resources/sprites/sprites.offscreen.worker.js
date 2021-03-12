self.addEventListener( "message", function( e )
{
    var random = function( args )
    {
        return Math.floor( Math.random() * args.length );
    };

    const data = e.data.a;

    self.importScripts( "/js/shared/sprites/sprites.options.js", "/js/shared/sprites/sprites.paths.js" );
    self.data = {};

    self.init = function()
    {
        var canvas = e.data.canvas;
        var ctx = e.data.canvas.getContext( "2d" );
            ctx.imageSmoothingEnabled = false;

            // fill
            ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
            ctx.fillStyle = data.colors.background;
            ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
            ctx.fillStyle = data.colors.foreground;

        self.data.canvas = canvas;
        self.data.ctx = ctx;
        self.create.call( null, data );
    };

    self.create = function( args )
    {
        var ctx = self.data.ctx;

        var o = new Options( ctx );
            o.roads( args.data );

        var option = o.options[ random( o.options ) ];

        var path = new Path( ctx );
            path.defaults();
            path[ option.f ].call( null, option.a.args );

        if ( args.data.parent ) args.data.parent.dataset.option = option.f;

        self.postMessage( { image: ctx.getImageData( 0, 0, args.size, args.size ), callback: args.callback, data: args.data } );
    };

    self[ e.data.f ].call( null, e.data.a );
} );

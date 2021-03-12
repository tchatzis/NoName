var Path = function( ctx )
{
    var scope = this;
    var x, y;
    var circle = Math.PI * 2;

    var range = function( min, max )
    {
        return Math.random() * ( max - min ) + min;
    };

    var rotate = function( args )
    {
        ctx.translate( x[ 2 ], y[ 2 ] );
        ctx.rotate( args.a * Math.PI / 180 );
        ctx.translate( -x[ 2 ], -y[ 2 ] );
    };

    var scale = function( args )
    {
        ctx.translate( x[ 2 ], y[ 2 ] );
        ctx.scale( args.x, args.y );
        ctx.translate( -x[ 2 ], -y[ 2 ] );
    };

    this.defaults = function()
    {
        var c = ctx.canvas;
        var divisions = 3;

        x = {};
        x[ 0 ] = 0;
        x[ 1 ] = c.width / divisions;//( c.width / divisions * args.current.thicknesses[ 0 ] );
        x[ 2 ] = c.width / 2;
        x[ 3 ] = c.width / ( divisions / 2 );//( c.width / divisions * args.current.thicknesses[ 0 ] );
        x[ 4 ] = c.width;

        y = {};
        y[ 0 ] = 0;
        y[ 1 ] = c.height / divisions;
        y[ 2 ] = c.height / 2;
        y[ 3 ] = c.height / ( divisions / 2 );
        y[ 4 ] = c.height;
    };

    // road tiles
    this.circle = function( args )
    {
        ctx.beginPath();
        ctx.arc( x[ 2 ], y[ 2 ], x[ 1 ], 0, circle, true );
        //scope.dot( range( 0, ( x[ 3 ] - x[ 1 ] ) / 2 ) );
        ctx.fill();
        ctx.closePath();

        args.length = 1;
        scope.stub( args );
    };

    this.clover = function( args )
    {
        args.x = x[ 0 ];
        args.y = y[ 0 ];
        scope.corner( args );

        args.x = x[ 0 ];
        args.y = y[ 4 ];
        scope.corner( args );

        args.x = x[ 4 ];
        args.y = y[ 4 ];
        scope.corner( args );

        args.x = x[ 4 ];
        args.y = y[ 0 ];
        scope.corner( args );
    };

    this.corner = function( args )
    {
        ctx.beginPath();
        ctx.arc( args.x, args.y, x[ 1 ], 0, circle, false );
        ctx.arc( args.x, args.y, x[ 3 ], 0, circle, true );
        ctx.fill();
        ctx.closePath();
    };

    this.culdesac = function( args )
    {
        scope.dot( x[ 1 ] );
        scope.stub( args );
    };

    this.deadend = function( args )
    {
        scope.dot( ( x[ 3 ] - x[ 1 ] ) / 2 );
        scope.stub( args );
    };

    this.diamond = function( args )
    {
        args.length = 1;

        ctx.save();
        ctx.beginPath();
        rotate( { a: 45 } );
        scale( { x: 0.66, y: 0.66 } );
        ctx.moveTo( x[ 0 ], y[ 0 ] );
        ctx.lineTo( x[ 4 ], y[ 0 ] );
        ctx.lineTo( x[ 4 ], y[ 4 ] );
        ctx.lineTo( x[ 0 ], y[ 4 ] );
        ctx.lineTo( x[ 0 ], y[ 0 ] );
        ctx.closePath();

        ctx.moveTo( x[ 1 ], y[ 1 ] );
        ctx.lineTo( x[ 1 ], y[ 3 ] );
        ctx.lineTo( x[ 3 ], y[ 3 ] );
        ctx.lineTo( x[ 3 ], y[ 1 ] );
        ctx.lineTo( x[ 1 ], y[ 1 ] );
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        scope.stub( args );
    };

    this.dot = function( r )
    {
        ctx.beginPath();
        ctx.arc( x[ 2 ], y[ 2 ], r, 0, circle );
        ctx.fill();
        ctx.closePath();
    };

    this.pond = function()
    {
        ctx.beginPath();
        rotate( { a: range( 0, 45 ) } );
        ctx.ellipse( x[ 2 ], y[ 2 ], range( x[ 1 ] / 2, x[ 2 ] / 2 ), range( y[ 1 ] / 2, y[ 2 ] / 2 ), circle, 0, circle );
        ctx.fill();
        ctx.closePath();
    };

    this.park = function()
    {

    };

    this.parking = function()
    {
        ctx.beginPath();
        ctx.fillRect( x[ 0 ], y[ 0 ], x[ 4 ], y[ 4 ] );
        ctx.closePath();
    };

    this.roundabout = function()
    {
        ctx.beginPath();
        ctx.arc( x[ 2 ], y[ 2 ], x[ 1 ] / 2, 0, circle, false );
        ctx.arc( x[ 2 ], y[ 2 ], x[ 2 ] * 1.05, 0, circle, true );
        ctx.fill();
        ctx.closePath();
    };

    this.split = function( args )
    {
        switch ( args.sides.join( "" ) )
        {
            case "0111":
                args.x = x[ 0 ];
                args.y = y[ 4 ];
                scope.corner( args );

                args.x = x[ 4 ];
                args.y = y[ 4 ];
                scope.corner( args );
                break;

            case "1011":
                args.x = x[ 0 ];
                args.y = y[ 0 ];
                scope.corner( args );

                args.x = x[ 0 ];
                args.y = y[ 4 ];
                scope.corner( args );
                break;

            case "1101":
                args.x = x[ 4 ];
                args.y = y[ 0 ];
                scope.corner( args );

                args.x = x[ 0 ];
                args.y = y[ 0 ];
                scope.corner( args );
                break;

            case "1110":
                args.x = x[ 4 ];
                args.y = y[ 4 ];
                scope.corner( args );

                args.x = x[ 4 ];
                args.y = y[ 0 ];
                scope.corner( args );
                break;
        }
    };

    this.square = function( args )
    {
        args.length = 1;

        ctx.save();
        ctx.beginPath();
        scale( { x: 0.66, y: 0.66 } );
        ctx.moveTo( x[ 0 ], y[ 0 ] );
        ctx.lineTo( x[ 4 ], y[ 0 ] );
        ctx.lineTo( x[ 4 ], y[ 4 ] );
        ctx.lineTo( x[ 0 ], y[ 4 ] );
        ctx.lineTo( x[ 0 ], y[ 0 ] );
        ctx.closePath();

        ctx.moveTo( x[ 1 ], y[ 1 ] );
        ctx.lineTo( x[ 1 ], y[ 3 ] );
        ctx.lineTo( x[ 3 ], y[ 3 ] );
        ctx.lineTo( x[ 3 ], y[ 1 ] );
        ctx.lineTo( x[ 1 ], y[ 1 ] );
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        scope.stub( args );
    };

    this.stub = function( args )
    {
        args.length = args.length ? args.length : 2;

        args.sides.forEach( function( value, side )
        {
            if ( value )
            {
                ctx.beginPath();

                switch( side )
                {
                    case 0:
                        ctx.rect( x[ 1 ], 0, x[ 1 ], y[ args.length ] );
                        break;

                    case 1:
                        ctx.rect( x[ 4 - args.length ], y[ 1 ], x[ args.length ], y[ 1 ] );
                        break;

                    case 2:
                        ctx.rect( x[ 1 ], y[ 4 - args.length ], x[ 1 ], y[ args.length ] );
                        break;

                    case 3:
                        ctx.rect( 0, y[ 1 ], x[ args.length ], y[ 1 ] );
                        break;
                }

                ctx.closePath();
                ctx.fill();
            }
        } );
    };
};

const Trajectory = function()
{
    var scope = "trajectory";
    var app = this;  
        app[ scope ] = {};
    var circle = Math.PI * 2;
    var progress = {};

    var Data = function( x, y, z, a, r, l )
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.a = a;
        this.r = r;
        this.l = l || new THREE.Vector3( Infinity, Infinity, Infinity );
    };

    app[ scope ].accelerate = function( args )
    {
        var x = 0;
        var y = 0;
        var z = -args.speed * Math.pow( args.a * args.time, 2 );
        var a = "z";
        var r = 0;
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].circle = function( args )
    {
        var angle = args.speed * args.time / circle;
        var x = Math.sin( angle ) * args.a;
        var y = 0;
        var z = Math.cos( angle ) * args.a;
        var a = "y";
        var r = angle;
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].eight = function( args )
    {
        var angle = args.speed * args.time / circle;
        var x = ( ( Math.cos( 2 * angle ) + 2 ) * Math.cos( 3 * angle ) ) * args.a;
        var y = ( ( Math.cos( 2 * angle ) + 2 ) * Math.sin( 3 * angle ) ) * args.a;
        var z = Math.sin( 4 * angle ) * args.c;
        var a = "z";
        var r = Math.atan( y / x );
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].ellipse = function( args )
    {
        var angle = args.speed * args.time / circle;
        var x = Math.sin( angle ) * args.a;
        var y = 0;
        var z = Math.cos( angle ) * args.b;
        var r = angle;
        var a = "y";
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].helix = function( args )
    {
        var angle = args.speed * args.time / circle;
        var x = Math.sin( angle ) * args.a;
        var y = Math.cos( angle ) * args.a;
        var z = -args.speed * args.time * args.b;
        var a = "z";
        var r = -angle;
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].hyperbola = function( args )
    {
        var angle = args.speed * args.time / circle;
        var x = 0;
        var y = Math.tan( angle ) * args.a;
        var z = -args.b / Math.cos( angle );
        var a = "x";
        var r = Math.atan( y / z );
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].infinity = function( args )
    {
        var angle = args.speed * args.time / circle;
        var x = Math.sin( angle ) * args.a;
        var y = 0;
        var z = Math.sin( angle ) * Math.cos( angle ) * args.b;
        var a = "y";
        var r = Math.atan( x / z );
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].inverse = function( args )
    {
        var x = 0;
        var angle = Math.asin( 1.0 - 2.0 * app.utils.clamp( args.speed * args.time, 0, 1 ) ) / 3.0;
        var y = ( 0.5 - Math.sin( angle ) ) * args.a;
        var z = -args.speed * args.time * args.b;
        var a = "x";
        var r = Math.atan( y / z );
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].knot = function( args )
    {
        var angle = args.speed * args.time / circle;
        var x = ( Math.sin( angle ) + args.a * Math.sin( args.b * angle ) );
        var y = ( Math.cos( angle ) - args.a * Math.cos( args.b * angle ) );
        var z = -Math.sin( args.c * angle );
        var a = "z";
        var r = Math.atan( y / x );
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].parabola = function( args )
    {
        var x = 0;
        var y = args.time * args.speed * args.a;
        var z = -y * y * args.b;
        var a = "x";
        var r = Math.atan( z / y );
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].projectile = function( args )
    {
        var x = 0;
        var z = args.time * args.speed * args.b;
        var d = z / args.limit.z;
        var y = z * Math.tan( args.a ) * ( 1 - d );
        var a = "x";
        var r = Math.atan( y / z );
        var l = args.limit;

        return new Data( x, y, -z, a, r, l );
    };

    app[ scope ].spiral = function( args )
    {
        var angle = args.speed * args.time / circle;
        var radius = args.time * args.c;
        var x = Math.sin( angle ) * args.a * radius;
        var y = Math.cos( angle ) * args.a * radius;
        var z = -args.speed * args.time * args.b;
        var a = "z";
        var r = -angle;
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].smoothstep = function( args)
    {
        var x = 0;
        var y = args.speed * args.time * args.a;
        var z = y * y * ( 3 - 2 * y );
        var a = "x";
        var r = Math.atan( y / z );
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].smootherstep = function( args )
    {
        var x = 0;
        var y = args.speed * args.time * args.a;
        var z = y * y * y * ( y * ( y * 6 - 1 ) + 10 );
        var a = "x";
        var r = Math.atan( y / z );
        var l = args.limit;

        return new Data( x, y, -z, a, r, l );
    };

    app[ scope ].translate = function( args )
    {
        var x = args.speed * args.x * args.time;
        var y = args.speed * args.y * args.time;
        var z = -args.speed * args.z * args.time;
        var a = "x";
        var r = Math.atan( y / z );
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    app[ scope ].trefoil = function( args )
    {
        var angle = args.speed * args.time / circle;
        var x = ( Math.sin( angle ) + 2 * Math.sin( 2 * angle ) ) * args.a;
        var y = ( Math.cos( angle ) - 2 * Math.cos( 2 * angle ) ) * args.b;
        var z = -Math.sin( 3 * angle ) * args.c;
        var a = "z";
        var r = Math.atan( y / x );
        var l = args.limit;

        return new Data( x, y, z, a, r, l );
    };

    // hook for adding trajectory points to app.path
    app[ scope ].path = function( args )
    {
        var vertices = [];
        var tick = 0.5;
        var time = args.count || 40;

        for ( args.time = 0; args.time < time; args.time += tick )
        {
            let v = app[ scope ][ args.type ]( args );

            vertices.push( new THREE.Vector3( v.x, v.y, v.z ) );
        }

        return vertices;
    };

    // hook for connecting emitter particles from app.props.emitter
    app[ scope ].Instance = function( object, args )
    {
        args.time = 0;
        args.object = object;
        args.object.matrixAutoUpdate = false;
        args.origin = new THREE.Vector3().copy( object.position );
        args.rotation = new THREE.Vector3().copy( object.rotation );

        this.origin = args.origin;
        this.rotation = args.rotation;

        app.arrays.functions.push( { name: args.id, scope: this, function: app[ scope ].Plot.update, args: args } );
    };

    Object.defineProperty( app[ scope ], 'Plot',
    {
        enumerable: false,
        value: function( object, args )
        {
            args.time = 0;
            args.object = object;
            args.object.matrixAutoUpdate = false;
            args.origin = new THREE.Vector3().copy( object.position );
            args.rotation = new THREE.Vector3().copy( object.rotation );

            if ( args.orientation ) args.object.parent[ args.orientation.axis ]( args.orientation.value );

            this.origin = args.origin;
            this.rotation = args.rotation;

            var v = app[ scope ][ args.type ]( args );

            for ( let axis in v.l )
            {
                if ( v.l.hasOwnProperty( axis ) && v.l[ axis ] !== Infinity )
                {
                    progress[ axis ] = new app.utils.Progress( { value: 0, limit: v.l[ axis ] } );
                    progress[ axis ].update( { label: `${ args.type }.${ axis }`, value: 0 } );
                }
            }

            app.arrays.functions.push( { name: args.name, scope: this, function: app[ scope ].Plot.update, args: args } );
        }
    } );

    Object.defineProperty( app[ scope ].Plot, 'update',
    {
        enumerable: false,
        value: function( args )
        {
            args.time += 1 / app.utils.fps;

            var v = app[ scope ][ args.type ]( args );
            var position = new THREE.Vector3( v.x, v.y, v.z ).add( this.origin );

            args.object.position.copy( position );
            if ( !args.static ) args.object.rotation[ v.a ] = v.r;
            args.object.updateMatrix();

            for ( let axis in v.l )
            {
                if ( v.l.hasOwnProperty( axis ) )
                {
                    if ( progress.hasOwnProperty( axis ) )
                        progress[ axis ].update( { label: `${ args.type }.${ axis }`, value: position[ axis ] } );

                    if ( Math.abs( position[ axis ] ) > Math.abs( v.l[ axis ] ) )
                    {
                        if ( args.onTrajectoryComplete )
                        {
                            args.onTrajectoryComplete( args );
                        }
                        else if ( args.object && args.object.parent )
                        {
                            args.object.parent.remove( args.object );
                        }

                        app.kill( app.arrays.functions, args.name );
                    }
                }
            }
        }
    } );
};


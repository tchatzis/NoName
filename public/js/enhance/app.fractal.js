const Fractal = function()
{
    var scope = "fractal";
    var app = this;
        app[ scope ] = {};

    function Vec2( x, y )
    {
        this.x = x;
        this.y = y;

        this.add = function( v )
        {
            return new Vec2( this.x + v.x, this.y + v.y );
        };

        this.sub = function( v )
        {
            return new Vec2( this.x - v.x, this.y - v.y );
        };

        this.mul = function( v )
        {
            if ( typeof v === "number" ) v = new Vec2( v, v );

            return new Vec2( this.x * v.x, this.y * v.y );
        };
    }

    function Complex( r, i )
    {
        this.r = r || 0;
        this.i = i || 0;

        var hypot = function( x, y )
        {
            var a = Math.abs( x );
            var b = Math.abs( y );

            if ( a < 3000 && b < 3000 )
            {
                return Math.sqrt( a * a + b * b );
            }

            if ( a < b )
            {
                a = b;
                b = x / y;
            }
            else
            {
                b = y / x;
            }

            return a * Math.sqrt( 1 + b * b );
        };

        this.abs = function()
        {
            return hypot( this.r, this.i );
        };

        this.add = function( a )
        {
            var z = typeof a === "number" ? new Complex( a, a ) : new Complex( a.r, a.i );

            return new Complex( this.r + z.r, this.i + z.i );
        };

        this.div = function( a )
        {
            var z = typeof a === "number" ? new Complex( a, a ) : new Complex( a.r, a.i );
            var r = this.r;
            var i = this.i;
            var c = z.r;
            var d = z.i;
            var t, x;

            if ( !d )
                return new Complex( r / c, i / c );

            if ( Math.abs( c ) < Math.abs( d ) )
            {
                x = c / d;
                t = c * x + d;

                return new Complex( ( r * x + i ) / t, ( i * x - r ) / t );
            }
            else
            {
                x = d / c;
                t = d * x + c;

                return new Complex( ( r + i * x ) / t, ( i - r * x ) / t );
            }
        };

        this.mul = function( a )
        {
            var z = typeof a === "number" ? new Complex( a, 0 ) : new Complex( a.r, a.i );

            if ( !z.i && !this.i )
                return new Complex( this.r * z.r, 0 );

            return new Complex( this.r * z.r - this.i * z.i, this.r * z.i + this.i * z.r );
        };

        this.sqrt = function()
        {
            var sqrt = Math.sqrt( Math.sqrt( this.r * this.r + this.i * this.i ) );
            var atan = Math.atan2( this.i, this.r ) / 2;

            return new Complex( sqrt * Math.cos( atan ), sqrt * Math.sin( atan ) );
        };

        this.sub = function ( a )
        {
            var z = typeof a === "number" ? new Complex( a, a ) : new Complex( a.r, a.i );

            return new Complex( this.r - z.r, this.i - z.i );
        };
    }

    app[ scope ].apollonian = function( target, args )
    {
        var canvas = app.textures.Canvas( args );
        var ctx = canvas.getContext( "2d" );
        var hw = args.width / 2;
        var draw = new Draw( ctx );
        var circles = [];

        class Circle 
        {
            constructor( r, center ) 
            {
                this.r = r;
                this.b = 1 / this.r;
                this.center = center;
                this.bc = this.center.mul( this.b );
            }
        }

        const solve = ( k1, k2, k3 ) =>
        {
            let s    = k1.add( k2 ).add( k3 );
            let k12  = k1.mul( k2 );
            let k13  = k1.mul( k3 );
            let k23  = k2.mul( k3 );
            let ksum = k12.add( k13 ).add( k23 );

            return ksum.sqrt().mul( 2 ).add( s );
        };

        const adjacent = ( c1, c2, c3 ) =>
        {
            let b1 = new Complex( c1.b );
            let b2 = new Complex( c2.b );
            let b3 = new Complex( c3.b );
            let b4 = solve( b1, b2, b3 );
            let r4 = Math.abs( 1 / b4.r );
            let p4 = solve( c1.bc, c2.bc, c3.bc ).div( b4 );

            return new Circle( r4, p4 );
        };

        const flip = ( c4, c1, c2, c3 ) => 
        {
            let bend = 2 * ( c1.b + c2.b + c3.b ) - c4.b;
            let center = c1.bc.add( c2.bc ).add( c3.bc ).mul( 2 ).sub( c4.bc ).div( bend );

            return new Circle( 1 / bend, center );
        };

        const recurse = ( c1, c2, c3, c4 ) =>
        {
            let cn2 = flip( c2, c1, c3, c4 );
            let cn3 = flip( c3, c1, c2, c4 );
            let cn4 = flip( c4, c1, c2, c3 );

            if ( cn2.r > args.min )
            {
                add( cn2 );
                //recurse( cn2, c1, c3, c4 );
            }

            if ( cn3.r > args.min )
            {
                add( cn3 );
                //recurse( cn3, c1, c2, c4 );
            }

            if ( cn4.r > args.min )
            {
                add( cn4 );
                //recurse( cn4, c1, c2, c3 );
            }
        };

        const gasket = ( c1, c2, c3 ) =>
        {
            let c4 = adjacent( c1, c2, c3 );

            add( c1 );
            add( c2 );
            add( c3 );
            add( c4 );

            //recurse( c1, c2, c3, c4 );
        };

        const add = ( object ) =>
        {
            var data =
            {
                center: new Vec2( object.center.r, object.center.i ),
                radius: Math.abs( object.r ),
                color: args.color
            };

            circles.push( object );
            draw.circle( data );
        };

        const symmetricSet = () => 
        {
            let c1r = -hw;
            let c1center = new Complex( hw, hw );
            let c1 = new Circle( c1r, c1center );

            let c2r = args.max;
            let c2center = new Complex( c2r, hw );
            let c2 = new Circle( c2r, c2center );

            let c3r = Math.abs( c1.r ) - c2.r;
            let c3x = c2.center.r + c2.r + c3r;
            let c3y = c2.center.i;
            let c3center = new Complex( c3x, c3y );
            let c3 = new Circle( c3r, c3center );

            return [ [ c1, c2, c3 ] ];
        };

        const nestedSet = () =>
        {
            let c1r = -hw;
            let c1center = new Complex( hw, hw );
            let c1 = new Circle( c1r, c1center );

            let c2r = args.max;
            let c2center = new Complex( hw, c2r );
            let c2 = new Circle( c2r, c2center );

            let c3r = hw - args.max;
            let c3center = new Complex( hw, args.width - c3r );
            let c3 = new Circle( c3r, c3center );

            // nested gasket
            let ci1r = -c2r;
            let ci1center = new Complex( hw, Math.abs( ci1r ) );
            let ci1 = new Circle( ci1r, ci1center );

            let ci2r = Math.abs( ci1r ) / 2;
            let ci2center = new Complex( hw, ci2r );
            let ci2 = new Circle( ci2r, ci2center );

            let ci3r = Math.abs( ci1r ) - ci2.r;
            let ci3x = ci2.center.r;
            let ci3y = ci2r + ci2r + ci3r;
            let ci3center = new Complex( ci3x, ci3y );
            let ci3 = new Circle( ci3r, ci3center );

            return [ [ c1, c2, c3 ], [ ci1, ci2, ci3 ] ];
        }

        const run = () =>
        {
            let set = symmetricSet();

            for ( let c of set )
            {
                gasket( ...c );
            }
        }

        run();

        target.material.map = new THREE.CanvasTexture( canvas );

        return canvas;
    };

    app[ scope ].circles = function( target, args )
    {
        var canvas = app.textures.Canvas( args );
        var ctx = canvas.getContext( "2d" );
        var draw = new Draw( ctx );
        
        function drawCircle( x, y, radius ) 
        {
            var r2 = radius / 2;
            var data =
            {
                center: new Vec2( x, y ),
                radius: radius,
                color: args.color
            };

            draw.circle( data );
            
            if ( radius > args.min ) 
            {
                drawCircle( x + r2, y, r2 );
                drawCircle( x - r2, y, r2 );
                drawCircle( x, y + r2, r2 );
                drawCircle( x, y - r2, r2 );
            }
        }
        
        drawCircle( args.width / 2, args.height / 2, args.width );

        target.material.map = new THREE.CanvasTexture( canvas );
        
        return canvas;
    };

    app[ scope ].hilbert = function( target, args )
    {
        var canvas = app.textures.Canvas( args );
        var ctx = canvas.getContext( "2d" );
        var draw = new Draw( ctx );
        var N = args.iterations;
        var N2 = N * N;
        var unit =
        {
            x: args.width / ( N - 1 ),
            y: args.height / ( N - 1 )
        };
        var prev = [ 0, 0 ];
        var curr;
        var dot;
        var line;
        var color;

        function last2bits( x )
        {
            return ( x & 3 );
        }

        function index( i )
        {
            // 1. compute position of node in N=2 curve
            var positions =
            [
                [ 0, 0 ],
                [ 0, 1 ],
                [ 1, 1 ],
                [ 1, 0 ]
            ];

            var tmp = positions[ last2bits( i ) ];
            i = ( i >>> 2 );

            // 2. iteratively compute coords
            var x = tmp[ 0 ];
            var y = tmp[ 1 ];

            for ( var n = 4; n <= N; n *= 2 )
            {
                var n2 = n / 2;

                switch ( last2bits( i ) )
                {
                    case 0: /* case A: left-bottom */
                        tmp = x;
                        x = y;
                        y = tmp;
                    break;

                    case 1: /* case B: left-upper */
                        x = x;
                        y = y + n2;
                    break;

                    case 2: /* case C: right-upper */
                        x = x + n2;
                        y = y + n2;
                    break;

                    case 3: /* case D: right-bottom */
                        tmp = y;
                        y = ( n2 - 1 ) - x;
                        x = ( n2 - 1 ) - tmp;
                        x = x + n2;
                    break;
                }

                i = ( i >>> 2 );
            }

            return new Vec2( unit.x * x, unit.y * y );
        }

        for ( var i = 0; i < N2; i++ )
        {
            curr = index( i );
            color = `hsl( ${ i * 360 / N2 }, 70%, 70% )`;

            dot =
            {
                center: curr,
                radius: args.dot,
                color: color
            };

            draw.dot( dot );

            line =
            {
                from: prev,
                to: curr,
                line: args.line,
                color: color
            };

            draw.line( line );

            prev = curr;
        }

        target.material.map = new THREE.CanvasTexture( canvas );

        return canvas;
    };

    app[ scope ].julia = function( target, args )
    {
        var canvas = app.textures.Canvas( args );
        var ctx = canvas.getContext( "2d" );
        var c = new Complex( args.constants.r, args.constants.i );
        var iL = -args.scale.i;
        var iH = args.scale.i;
        var rL = -args.scale.r;
        var rH = args.scale.r;
        
        function julia( z, c ) 
        {
            for ( var i = 0; i < args.iterations; i++ ) 
            {
                if ( abs2( z ) > 4 ) return i;
                z = add( mul( z, z ), c );
            }
            return args.iterations;
        }

        for ( var ci = 0; ci < args.height; ci++ )
        {
            for ( var cr = 0; cr < args.width; cr++ )
            {
                var r = rL + cr * ( rH - rL ) / args.width;
                var i = iL + ci * ( iH-iL ) / args.height;
                var j = julia( new Complex( r, i ), c );

                fill( cr, args.height - ci, j );
            }
        }
        
        function fill( x, y, i ) 
        {
            ctx.fillStyle = gradient( i );
            ctx.fillRect( x, y, args.pixel, args.pixel );
        }
        
        function gradient( i ) 
        {
            var g;
            var c = 255 * 2 / args.iterations;

            if ( i < args.iterations * 0.5 )
            {
                g = Math.round( i * c ) - 128;
                return `rgb( 0, ${ g / 2 }, ${ g } )`;
            }
            else if ( i > args.iterations * 0.5 )
            {
                g = Math.round( ( i - args.iterations / 2 ) * c ) - 128;
                return `rgb( ${ g / 2 }, ${ g }, 0 )`;
            }
            else
            {
                return `rgb( 0, 0, 0 )`;
            }
        }

        function abs2( z ) 
        {
            return z.r * z.r + z.i * z.i;
        }
        
        function mul( z1, z2 ) 
        {
            return new Complex( z1.r * z2.r - z1.i * z2.i, z1.r * z2.i + z2.r * z1.i );
        }
        
        function add( z1, z2 ) 
        {
            return new Complex( z1.r + z2.r, z1.i + z2.i );
        }

        target.material.map = new THREE.CanvasTexture( canvas );

        return canvas;
    };

    app[ scope ].mandlebrot = function( target, args )
    {
        var canvas = app.textures.Canvas( args );
        var ctx = canvas.getContext( "2d" );
        var zoom = Math.pow( 2, args.zoom );
        var w = args.width;
        var h = args.height;
        var iterations = args.iterations;

        for( var x = 0; x < w; x++ )
        {
            for( var y = 0; y < h; y++ )
            {
                var i = 0;
                var cx = x / zoom + args.pan.x;
                var cy = y / zoom + args.pan.y;
                var zx = 0;
                var zy = 0;
                var xt;

                do
                {
                    xt = zx * zy;
                    zx = zx * zx - zy * zy + cx;
                    zy = 2 * xt + cy;
                    i++;
                }
                while( i < iterations && ( zx * zx + zy * zy ) < 4 );


                let hue = ( 1.0 + Math.sin( i * 0.1 ) ) * 180 + args.hue;
                let saturation = i / iterations * args.saturation;
                let luminosity = i / iterations * args.luminosity;

                ctx.beginPath();
                ctx.rect( x, y, args.pixel, args.pixel );
                ctx.fillStyle = `hsl( ${ hue }, ${ saturation }%, ${ luminosity }% )`;//`hsl( ${ hue }, ${ saturation }%, ${ luminosity }% )`;
                ctx.fill();
            }
        }

        target.material.map = new THREE.CanvasTexture( canvas );

        return canvas;
    };

    app[ scope ].sierpinski = function( target, args )
    {
        var canvas = app.textures.Canvas( args );
        var ctx = canvas.getContext( "2d" );
        var draw = new Draw( ctx );
        var div = args.divisions;
        var mid = div / 2 - 0.5;

        var Data = function( data )
        {
            Object.assign( this, data );
        };

        // fill in canvas
        var params = 
        {
            rect: new Data(
            {
                from: new Vec2( 0, 0 ),
                size: new Vec2( args.width, args.width ),
                color: args.color
            } ),
            dot: new Data(
            {
                center: new Vec2( args.width / 2, args.width / 2 ),
                radius: args.width / 2,
                color: args.color
            } ) 
        };

        draw.clear();
        draw[ args.type ]( params[ args.type ] );

        split( params[ args.type ], args.iterations );

        // split rectangle into div x div rectangles
        function split( data, depth )
        {
            var size = args.type === "rect" ? data.size.mul( 1 / div ) : new Vec2( data.radius, data.radius ).mul( 2 / div );
            var params;
            var color = args.color.map( c => { return 255 - c } );

            for ( let i = 0; i < div; i++ )
            {
                for ( let j = 0; j < div; j++ )
                {
                    params =
                    {
                        rect: () => { return new Data(
                        {
                            from: new Vec2( size.x * i, size.y * j ).add( data.from ),
                            size: size,
                            color: color
                        } ) },
                        dot: () => { return new Data(
                        {
                            center: new Vec2( size.x * i, size.y * j ).add( data.center.sub( size ) ),
                            radius: data.radius / div,
                            color: color
                        } ) }
                    };

                    if ( i === mid && j === mid )
                    {
                        draw[ args.type ]( params[ args.type ]() );
                    }
                    else if ( depth > 0 )
                    {
                        split( params[ args.type ](), depth - 1 );
                    }
                }
            }
        }

        target.material.map = new THREE.CanvasTexture( canvas );

        return canvas;
    };

    app[ scope ].triangles = function( target, args )
    {
        var canvas = app.textures.Canvas( args );
        var ctx = canvas.getContext( "2d" );
        var draw = new Draw( ctx );

        function drawLine( p0, p1 )
        {
            var data =
            {
                from: p0,
                to: p1,
                color: args.color
            };

            draw.line( data );
        }

        function drawTriangle( p0, p1, p2 )
        {
            drawLine( p0, p1 )
            drawLine( p1, p2 )
            drawLine( p2, p0 )
        }

        function drawFract( p0, p1, p2, limit )
        {
            if ( limit > 0 )
            {
                const pA = 
                {
                    x: p0.x + ( p1.x - p0.x ) / 2,
                    y: p0.y - ( p0.y - p1.y ) / 2
                };
                const pB = 
                {
                    x: p1.x + ( p2.x - p1.x ) / 2,
                    y: p1.y - ( p1.y - p2.y ) / 2
                };
                const pC = 
                {
                    x: p0.x + ( p2.x - p0.x ) / 2,
                    y: p0.y
                };

                drawFract( p0, pA, pC, limit - 1 );
                drawFract( pA, p1, pB, limit - 1 );
                drawFract( pC, pB, p2, limit - 1 );
            }
            else
            {
                drawTriangle( p0, p1, p2 );
            }
        }

        drawFract( { x: 0, y: args.height },{ x: args.width / 2, y:0 },  { x: args.width, y: args.height }, args.iterations );

        target.material.map = new THREE.CanvasTexture( canvas );

        return canvas;
    };
};
const Utils = function()
{
    var scope = "utils";
    var app = this;
        app[ scope ] = {};

    /** classes */
    app[ scope ].LFO = function( args )
    {
        var circle = Math.PI * 2;
        var counter = 0;
        var fn = [];

        this.hz = Math.min( args.hz, 3 );
        this.amplitude = args.amplitude || 1;

        var update = function()
        {
            var a = args.direction * counter * circle * this.hz;

            fn[ 0 ] = Math.sin( a ) * this.amplitude;
            fn[ 1 ] = Math.cos( a ) * this.amplitude;
            fn[ 2 ] = Math.sin( a ) * Math.cos( a ) * this.amplitude;

            args.attributes.forEach( ( attr, index ) =>
            {
                var value = fn[ index ] * attr.scale + attr.offset;
                    value = args.absolute ? Math.sqrt( value * value ): value;

                app[ scope ].path( args.target, attr.attribute, value );
            } );

            counter += 1 / app[ scope ].fps;
        }.bind( this );

        app.arrays.lfo.push( { name: args.name, lfo: this } );
        app.arrays.functions.push( { name: args.name, scope: this, function: update, args: null } );
    };

    app[ scope ].Progress = function( args )
    {
        var row, title, progress;

        Object.assign( this, args );

        const remove = function()
        {
            if ( row.parentNode )
                app.ui.container.removeChild( row );
        };

        const init = function()
        {
            row = document.createElement( "div" );
            row.setAttribute( "data-progress", "" );

            title = document.createElement( "div" );
            title.classList.add( "title" );

            progress = document.createElement( "progress" );
            progress.value = this.value / this.limit;
            progress.classList.add( "progress" );

            row.appendChild( title );
            row.appendChild( progress );

            app.ui.container.appendChild( row );
        }.bind( this );

        this.update = function( args )
        {
            var value = args.value ? args.value / this.limit : 0;

            app.ui.container.classList.add( "expand" );

            title.innerText = `${ args.label } ( ${ args.value.toFixed() } / ${ this.limit } )`;
            progress.value = value;

            if ( value >= 1 ) remove();
        };

        init();
    };

    app[ scope ].Wave = function( args )
    {
        Object.assign( this, args );

        const circle = Math.PI * 2;
        const fn = [ 'sin', 'cos', 'tan', 'sinh', 'cosh', 'tanh', 'asin', 'acos', 'atan', 'asinh', 'acosh', 'atanh' ];

        this.angle = ( ( this.frame / app[ scope ].fps ) * ( circle * this.cycles ) ) % circle;

        fn.forEach( ( f ) =>
        {
            this[ f ] = Math[ f ]( this.angle ) * this.amplitude + this.offset;
        } );
    };

    /** function */
    // polygon geometry helper
    app[ scope ].apothem = function( side, number )
    {
        var apothem = ( side / 2 ) * Math.tan( ( Math.PI * ( number - 2 ) ) / ( number * 2 ) );
        var radius = side / ( 2 * Math.sin( Math.PI / number ) );

        return { apothem: apothem, radius: radius, side: side };
    };
    
    // get/set buffer geometry attributes
    app[ scope ].attributes =
    {
        get: function( geometry, attribute, index )
        {
            var value = [];
            var size = geometry.attributes[ attribute ].itemSize;
            var i = index * size;

            for ( var s = 0; s < size; s++ )
            {
                value[ s ] = geometry.attributes[ attribute ].array[ i + s ];
            }

            return value;
        },
        set: function( geometry, attribute, index, value )
        {
            var size = geometry.attributes[ attribute ].itemSize;
            var i = index * size;

            value = typeof value === "object" ? Object.values( value ) : [ value ];

            for ( var s = 0; s < size; s++ )
            {
                geometry.attributes[ attribute ].array[ i + s ] = value[ s ];
            }

            geometry.attributes[ attribute ].needsUpdate = true;
        }
    };

    // set camera position to ui
    app[ scope ].camera = function()
    {
        app.ui.data.camera.copy( app.stage.camera.position );
        app.ui.update();        
    };

    // 3D object centering
    app[ scope ].center = function( object )
    {
        var box = new THREE.Box3().setFromObject( object );

        object.translateX( -( box.max.x - box.min.x ) / 2 );
        object.translateY( -( box.max.y - box.min.y ) / 2 );
        object.translateZ( -( box.max.z - box.min.z ) / 2 );
        object.updateMatrix();
    };

    // reset value to start
    app[ scope ].circular = function( value, max )
    {
        if ( max > 1 )
            return value % max;
        else if ( value < 0 )
            return max + value;
        else if ( value > max )
            return value - max;
        else
            return value;
    };

    // clamp to min or max value
    app[ scope ].clamp = function( value, lower, upper )
    {
        if ( value < lower )
            value = lower;
        if  ( value > upper )
            value = upper;
        return value;
    };
    
    app[ scope ].clone = function( object )
    {
        let clone, value, key;
    
        if ( typeof object !== "object" || object === null ) 
            return object;

        clone = Array.isArray( object ) ? [] : {};
    
        for ( key in object ) 
        {
            if ( object.hasOwnProperty( key ) )
            {
                value = object[ key ];

                clone[ key ] = app[ scope ].clone( value )
            }
        }
    
        return clone
    };

    // convert hex string to THREE.Color
    app[ scope ].convert = function( hex )
    {
        var array = hex.match( /.{1,2}/g );
        var vector = [];
        var dec;

        for ( var a = 1; a < array.length; a++ )
        {
            dec = parseInt( array[ a ], 16 );
            vector.push( dec / 255 );
        }

        return new THREE.Color( ...vector );
    };

    // returns the normalized vector of direction
    app[ scope ].direction = function( vector )
    {
        var direction = [];

        for( var axis in vector )
        {
            if ( vector.hasOwnProperty( axis ) )
                direction.push( Math.sign( vector[ axis ] ) );
        }

        return new THREE.Vector3( ...direction );
    };

    // colorful console.log()
    app[ scope ].debug = function( message, bgcolor )
    {
        var style =
        [
            'color: black',
            `background-color: ${ bgcolor }`
        ].join( ';' );

        console.log( `%c${ message }`, style );
    };

    app[ scope ].table = function( data, headings )
    {
        var delim = " \t\t | \t";

        if ( data )
        {
            var output = Array.from( data ).map( ( item, index ) =>
            {
                var string = headings ? headings[ index ] + `: ` : "";
                string += item.toFixed( 2 ) + delim;

                return string;
            } );

            console.log( ...output );
        }
    };

    // rads to degrees
    app[ scope ].degrees = function( rads )
    {
        return Math.round( rads * 180 / Math.PI );
    };

    // grid indices of next and above - should wrap infinitely
    app[ scope ].dxdy = function( index, width, height )
    {
        var w  = width  + 1;
        var h  = height + 1;
        var x  = index % w;
        var y  = Math.floor( index / w ) % h;
        var dx = ( x + 1 ) % w;
        var dy = ( y + 1 ) % h;

        return { x: x, y: y, xy: { x: x, y: y }, dxy: { x: dx, y: y }, xdy: { x: x, y: dy }, dxdy: { x: dx, y: dy } };
    };

    // expands tree in console.log
    app[ scope ].expand = ( function()
    {
        var MAX_DEPTH = 32;

        return function( item, depth )
        {
            depth = depth || 0;

            if ( depth > MAX_DEPTH )
            {
                console.log( item );
                return;
            }

            if ( typeof item === "object" )
            {
                if ( Array.isArray( item ) )
                {
                    item.forEach( ( element ) =>
                    {
                        app[ scope ].expand( element, depth );
                    } );

                    return;
                }

                for( var key in item )
                {
                    if ( item.hasOwnProperty( key ) )
                    {
                        console.group( key, ": ", item[ key ] );
                        app[ scope ].expand( item[ key ], depth + 1 );
                        console.groupEnd();
                    }
                }
            }
        }
    } )();

    // color value to hex string
    app[ scope ].format = function( color )
    {
        color = color.toString( 16 );
    
        while ( color.length < 6 )
        {
            color = "0" + color;
        }
    
        return "0x" + color;
    };

    app[ scope ].framerate = function()
    {
        var start, fps, total, count;
        var sample = 60;
        var delay = 30;

        var test = function()
        {
            if ( !start )
            {
                start = performance.now();
                fps = 0;
                total = 0;
                count = 0;
            }
            else
            {
                const now = performance.now();

                fps = 1 / ( ( now - start ) / 1000 );
                if ( count >= delay ) total += fps;
                start = now;
                count++;
            }

            if ( count < sample )
            {
                requestAnimationFrame( test );
            }
            else
            {
                app[ scope ].fps = Math.round( total / ( sample - delay ) );
                app.ui.debug.innerText = app[ scope ].fps + " fps";
                app.ui.container.classList.remove( "expand" );

                var event = new Event( "framerate" );
                document.dispatchEvent( event );
            }
        };

        test();
    };

    // calculates vertex and face counts
    app[ scope ].geometry = function( width, height )
    {
        var i = 0;
    
        for ( var h = 0; h < height; h++ )
        {
            for ( var w = 0; w < width; w++ )
            {
                var v = ( w + 1 ) * ( h + 1 );
                var f = 2 * w * h;
                //var s = 2 * ( i - h * height ) * w;
    
                console.log( { i: i, w: w, h: h, vertices: v, faces: f } );
                i++;
            }
        }
    };

    // create a gradient with color stops - has a debug output to document
    app[ scope ].gradient = function( args )
    {
        var steps;
        var color = {};
        var output = [];
        var length = args.colors.length;
        var parent = document.createElement( "div" );
            parent.style.position = "absolute";
            parent.style.top = 0;
            parent.style.left = 0;
        var element;
        var components = [ "r", "g", "b" ];
        var string;

        for ( var c = 0; c < length; c++ )
        {
            steps = args.colors[ c ].steps;
            color =
            {
                current: { color: args.colors[ c ].color },
                next: args.colors[ c + 1 ] ? { color: args.colors[ c + 1 ].color } : args.colors[ c ],
                blend: [],
                debug: []
            };
            color.current.hex = app[ scope ].format( color.current.color );
            color.current.rgb = app[ scope ].convert( color.current.hex );
            color.next.hex = app[ scope ].format( color.next.color );
            color.next.rgb = app[ scope ].convert( color.next.hex );

            for ( var s = 0; s < steps; s++ )
            {
                color.blend[ s ] = new THREE.Color();
                color.debug[ s ] = {};

                components.forEach( ( c ) =>
                {
                    color.blend[ s ][ c ] = ( ( steps - s ) / steps * color.current.rgb[ c ] + ( s ) / steps * color.next.rgb[ c ] );
                    color.debug[ s ][ c ] = Math.round( color.blend[ s ][ c ] * 255 );
                } );

                output.push( color.blend[ s ] );
                string = `rgb( ${ color.debug[ s ].r }, ${ color.debug[ s ].g }, ${ color.debug[ s ].b } )`;

                element = document.createElement( "div" );
                element.style.width = "16px";
                element.style.height = "16px";
                element.style.backgroundColor = string;
                element.style.float = "left";
                element.title = string;
                parent.appendChild( element );
            }
        }

        if ( args.debug ) document.body.appendChild( parent );

        if ( args.hasOwnProperty( "index" ) )
        {
            output = output[ args.index ];
        }

        if ( args.hasOwnProperty( "value" ) )
        {
            output = output[ Math.floor( args.value * length ) ];
        }

        return output;
    };

    // return name of greater and lesser width or height or [ array ]
    app[ scope ].greater = function( obj, array )
    {
        var props = array || [ "width", "height" ];
    
        for( var index = 0; index < props.length; index++ )
        {
            var prop = props[ index ];
    
            if ( obj[ prop ] > obj[ props[ 1 - index ] ] )
            {
                return { greater: prop, lesser: props[ 1 - index ] };
            }
        }
    };

    // random hex color
    app[ scope ].hex = function()
    {
        return 0xffffff * Math.random();
    };

    // returns random element from array or object
    app[ scope ].item = function( array )
    {
        var index = -1;

        if ( Array.isArray( array ) )
        {
            index = app[ scope ].random( 0, array.length - 1 );
            return array[ index ];
        }

        if ( typeof array === "object" )
        {
            array = Object.values( array );
            index = app[ scope ].random( 0, array.length - 1 );
            return array[ index ];
        }

        return array;
    };

    // on screen debugger
    app[ scope ].log = function()
    {
        let re = /([^(]+)@|at ([^(]+) \(/g;
        let str = re.exec( new Error().stack );
        let location = str.input.split( "\n" )[ 2 ].trim().split( "/" );
        let caller =
        {
            name: str[ 1 ] || str[ 2 ],
            location: location[ location.length - 1 ].replace( /\)/g, "" )
        };
    
        var output = [];
        var items = Array.from( arguments );
        items.forEach( ( item ) =>
        {
            output.push( JSON.stringify( item ) );
        } );
    
        output = output.join( " " );
    
        app.ui.debug.innerText = `${ output } \n ${ caller.location }`;
    };
    
    // any value range to specific output range
    app[ scope ].minmax = function( args )
    {
        var value = args.value / args.limit;
    
        return ( args.max - args.min ) * value + args.min;
    };

    // calculate normal of angle
    app[ scope ].normal = function( a )
    {
        var d = 1 / ( Math.sqrt( 1 + Math.pow( Math.cos( a ), 2 ) ) );

        return { x: app[ scope ].round( Math.cos( a ) * d, 4 ), y: app[ scope ].round( Math.cos( a ) * -d, 4 ) };
    };

    // height map to normal map
    app[ scope ].normals = function( image )
    {
        const convert = function( canvas )
        {
            var context = canvas.getContext( '2d' );
            var width = canvas.width;
            var height = canvas.height;
            var src = context.getImageData( 0, 0, width, height );
            var dst = context.createImageData( width, height );

            for ( var i = 0, l = width * height * 4; i < l; i += 4 )
            {
                var x1, x2, y1, y2;

                if ( i % ( width * 4 ) == 0 )
                {
                    // left edge
                    x1 = src.data[ i ];
                    x2 = src.data[ i + 4 ];

                }
                else if ( i % ( width * 4 ) == ( width - 1 ) * 4 )
                {
                    // right edge
                    x1 = src.data[ i - 4 ];
                    x2 = src.data[ i ];

                }
                else
                {
                    x1 = src.data[ i - 4 ];
                    x2 = src.data[ i + 4 ];
                }

                if ( i < width * 4 )
                {
                    // top edge
                    y1 = src.data[ i ];
                    y2 = src.data[ i + width * 4 ];

                }
                else if ( i > width * ( height - 1 ) * 4 )
                {
                    // bottom edge
                    y1 = src.data[ i - width * 4 ];
                    y2 = src.data[ i ];

                }
                else
                {
                    y1 = src.data[ i - width * 4 ];
                    y2 = src.data[ i + width * 4 ];
                }

                dst.data[ i ] = ( x1 - x2 ) + 127;
                dst.data[ i + 1 ] = ( y1 - y2 ) + 127;
                dst.data[ i + 2 ] = 255;
                dst.data[ i + 3 ] = 255;
            }

            context.putImageData( dst, 0, 0 );
        };

        var canvas = document.createElement( "canvas" );
            canvas.getContext( '2d' ).drawImage( image, 0, 0 );
            canvas.width = image.width;
            canvas.height = image.height;

        convert( canvas );

        return canvas;
    };

    // Box helper
    app[ scope ].outline = function( args )
    {
        //scope.app[ scope ].outline( { object: scope.group, color: "yellow", name: "helper" } );
        var helper = new THREE.BoxHelper( args.object, args.color );
            helper.name = args.name;
    
        args.object.parent.remove( args.object.parent.getObjectByName( args.name ) );
        args.object.parent.add( helper );
    };

    // takes a dot notation string and converts it to object path
    app[ scope ].path = function( object, attribute, value )
    {
        var p = 0;
        var param;
        var current = object;

        attribute = typeof attribute === 'string' ? attribute.split( '.' ) : attribute;

        while ( attribute.length > p )
        {
            param = attribute[ p ];

            if ( current[ param ] === undefined ) return;

            if ( p === attribute.length - 1 )
            {
                if ( Number( value ) ) current[ param ] = value;
                return current[ param ];
            }
            else
            {
                current = current[ param ];
            }

            p++;
        }
    };

    // rads to degrees
    app[ scope ].rads = function( degrees )
    {
        return Math.PI * degrees / 180;
    };

    // random integer between min and max
    app[ scope ].random = function( min, max )
    {
        return Math.round( Math.random() * ( max - min ) + min );
    };

    // random float between min and max
    app[ scope ].range = function( min, max )
    {
        return Math.random() * ( max - min ) + min;
    };

    // round to precision decimal
    app[ scope ].round = function( value, precision )
    {
        var p = Math.pow( 10, precision );

        return Math.round( p * value ) / p;
    };

    // sort key[ prop ]
    app[ scope ].sort = function( array, prop )
    {
        var value =
        {
            a: isNaN( a[ prop ] ) ? a[ prop ] : parseFloat( a[ prop ] ),
            b: isNaN( b[ prop ] ) ? b[ prop ] : parseFloat( b[ prop ] )
        };

        return array.sort( ( a, b ) => value.a > value.b ? 1 : -1 )
    };

    // traverse an object of unknown schema
    app[ scope ].traverse = function( object )
    {
        const isArray = ( o ) => Object.prototype.toString.call( o ) === '[object Array]';
        const traverseArray = ( arr ) => arr.forEach( ( x ) => traverse( x ) );

        function traverse( x )
        {
            if ( isArray( x ) )
                traverseArray( x );
            else if ( ( typeof x === 'object' ) && ( x !== null ) )
                traverseObject( x );
            else
            {
                console.log( x );
            }
        }

        function traverseObject( obj )
        {
            for ( var key in obj )
            {
                if ( obj.hasOwnProperty( key ) )
                    traverse( obj[ key ] )
            }
        }

        traverse( object );
    };

    // async slow down a loop - see app.props.city / scan for usage
    app[ scope ].sleep = function( milliseconds )
    {
        return new Promise( resolve => setTimeout( resolve, milliseconds ) );
    };

    // remove duplicate object keys from array
    app[ scope ].unique = function( array, key )
    {
        return Array.from( new Set( array.map( a => a[ key ] ) ) )
        .map( k =>
        {
            return array.find( a => a[ key ] === k );
        } );
    };

    // update / insert value in object
    app[ scope ].upsert = function( object, args )
    {
        if ( !object || !args )
            return;

        var keys = Object.keys( args );
        var _prop;

        for ( let prop in object )
        {
            if ( object.hasOwnProperty( prop ) )
            {
                if ( typeof prop === "string" && keys.find( key => key === prop ) )
                {
                    Object.assign( object[ prop ], args[ prop ] );
                }
            }
            
            _prop = prop;
        }

        object = object[ _prop ];

        if ( typeof object == "object" ) app[ scope ].upsert( object, args );
    };

    app[ scope ].uuid = function()
    {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c )
        {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : ( r & 0x3 | 0x8 );
            return v.toString( 16 );
        } );
    };
};
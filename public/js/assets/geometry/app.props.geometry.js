const Geometry = function()
{
    var app = {};
    var scope = this;
    var dims = [ "width", "height" ];
    var fn = [ "sin", "cos" ];
    var loop = [ 0, 0 ];
    var types = {};
    var modifiers = {};
    var pi = Math.PI;
    var circle = pi * 2;
    var ninety = pi / 2;
    var fv = [ 2, 1, 0, 1, 2, 3 ];
    var tick = 0;

    // draws debug vertex points
    const point = function( corners )
    {
        if ( scope.debug )
        {
            var geometry = new THREE.BufferGeometry().setFromPoints( corners );
            var material = new THREE.PointsMaterial( { size: 4, sizeAttenuation: false, color: new THREE.Color( 0x00FF00 ) } );
            var point = new THREE.Points( geometry, material );

            scope.group.add( point );
        }
    };

    // returns index of grid item
    const mul = function( w, h )
    {
        return w + h * ( scope.params.width.segments + 1 );
    };

    // returns four corners of grid item
    const corners = function( w, h )
    {
        let v0 = mul( w, h );
        let v1 = mul( w + 1, h );
        let v2 = mul( w, h + 1 );
        let v3 = mul( w + 1, h + 1 );

        return [
            scope.vertices[ v0 ],
            scope.vertices[ v1 ],
            scope.vertices[ v2 ],
            scope.vertices[ v3 ]
        ];
    };

    // creates geometry
    const vertices = function( render )
    {
        var i = 0;

        for ( var h = 0; h < scope.params.height.segments; h++ )
        {
            for ( var w = 0; w < scope.params.width.segments; w++ )
            {
                let c = corners( w, h );

                let geometry = new THREE.Geometry();
                    geometry.vertices.push( ...c );
                    geometry.name = scope.type + i;
                    // todo: morph targets
                    //geometry.morphTargets.push( { name: "target" + i, vertices: c } );

                scope.geometries.push( geometry );

                i++;

                point( c );
                faces( geometry );
                uvs( geometry );

                if ( render )
                    mesh( geometry );
            }
        }
    };

    const faces = function( geometry )
    {
        geometry.faces.push
        (
            new THREE.Face3( fv[ 0 ], fv[ 1 ], fv[ 2 ] ),
            new THREE.Face3( fv[ 3 ], fv[ 4 ], fv[ 5 ] ),
        );
    };

    const uvs = function( geometry )
    {
        geometry.faceVertexUvs[ 0 ].push(
        [
            new THREE.Vector2( 0, 0 ), // 2
            new THREE.Vector2( 1, 1 ), // 1
            new THREE.Vector2( 0, 1 ), // 0
            new THREE.Vector2( 1, 0 )  // 3
        ],
        [
            new THREE.Vector2( 1, 1 ), // 1
            new THREE.Vector2( 0, 0 ), // 2
            new THREE.Vector2( 1, 0 ), // 3
            new THREE.Vector2( 0, 1 )  // 0
        ] );

        geometry.uvsNeedUpdate = true;
    };

    const mesh = function( geometry )
    {
        var name = geometry.name;

        geometry = new THREE.BufferGeometry().fromGeometry( geometry );
        geometry.name = name;

        var material = new THREE.MeshStandardMaterial(
        {
            wireframe: scope.wireframe,
            side: THREE.DoubleSide,
            color: scope.color || new THREE.Color( 1, 1, 1 ),
            //morphTargets: true,
            flatShading: scope.flatShading || false,
            metalness: 0.5,
            roughness: 0.5
            //reflectivity: 1,
            //clearcloat: 1,
            //clearcoatRoughness: 0,
            //transparency: 0.5
        } );

        var mesh = new THREE.Mesh( geometry, material );
            mesh.name = geometry.name;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.visible = !scope.debug;

        scope.mesh = mesh;

        if ( scope.texture && scope.params.texture )
            scope.texture( scope.params.texture );

        scope.group.add( mesh );
        scope.meshes.push( mesh );
    };

    // centers the geometry
    const center = function()
    {
        var children = scope.group.children;

        if ( scope.center.length )
        {
            var box = new THREE.Box3();
            var clone;
            var size = new THREE.Vector3();
            var bounds = { max: new THREE.Vector3(), min: new THREE.Vector3( Infinity, Infinity, Infinity ) };
            var axes = scope.center;

            for ( var i = 0; i < children.length; i++ )
            {
                children[ i ].geometry.computeBoundingBox();
                clone = children[ i ].geometry.boundingBox;

                for ( var a = 0; a < axes.length; a++ )
                {
                    bounds.max[ axes[ a ] ] = bounds.max[ axes[ a ] ] > clone.max[ axes[ a ] ] ? bounds.max[ axes[ a ] ] : clone.max[ axes[ a ] ];
                    bounds.min[ axes[ a ] ] = bounds.min[ axes[ a ] ] < clone.min[ axes[ a ] ] ? bounds.min[ axes[ a ] ] : clone.min[ axes[ a ] ];
                }

                box.max = clone.max;
                box.min = clone.min;
            }

            for ( a = 0; a < axes.length; a++ )
            {
                size[ axes[ a ] ] = bounds.max[ axes[ a ] ] - ( bounds.max[ axes[ a ] ] - bounds.min[ axes[ a ] ] ) / 2;
            }

            translate( size );

            scope.translate = size;
        }
    };

    // update normals and vertex flags
    const update = function( geometry )
    {
        geometry.verticesNeedUpdate = true;
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
    };

    // called from center
    const translate = function( vector )
    {
        var children = scope.group.children;

        for ( let child of children )
        {
            var array = child.geometry.attributes.position.array;
            var items = child.geometry.attributes.position.itemSize;
            var length = child.geometry.attributes.position.count * items;

            for ( var v = 0; v < length; v += items )
            {
                array[ v ]     -= vector.x;
                array[ v + 1 ] -= vector.y;
                array[ v + 2 ] -= vector.z;
            }

            update( child.geometry );
        }
    };

    // called from animator - updates the geometry
    const updater = function()
    {
        var i = 0;
        var children = scope.group.children;

        for ( var h = 0; h < scope.params.height.segments; h++ )
        {
            for ( var w = 0; w < scope.params.width.segments; w++ )
            {
                let c = corners( w, h );
                let array = [];

                fv.forEach( u =>
                {
                    // re-center
                    var vector = new THREE.Vector3().copy( c[ u ] ).sub( scope.translate );
                    array = array.concat( vector.toArray() );
                } );

                children[ i ].geometry.attributes.position.array = new Float32Array( array );
                children[ i ].geometry.attributes.position.needsUpdate = true;
                update( children[ i ].geometry );

                i++;
            }
        }
    };

    // sets, counts, modifies, updates, repeat
    const animator = function()
    {
        if ( scope.params.hasOwnProperty( "animate" ) )
        {
            if ( scope.params.animate.hasOwnProperty( "frames" ) && scope.params.animate.hasOwnProperty( "keys" ) )
            {
                scope.params.animate.frames.counted++;

                var predicate = Math.abs( scope.params.animate.frames.count ) !== Infinity;
                var counted = predicate ? scope.params.animate.frames.counted / scope.params.animate.frames.count : scope.params.animate.frames.elapsed / scope.params.animate.frames.time;
                    counted = Math.round( counted * 1000 ) / 1000;
                var delta = predicate ? scope.params.animate.frames.time / scope.params.animate.frames.count : 0.01 * scope.params.animate.frames.time; // 4ms - Javascript limit
                var cycle = !!scope.params.animate.hasOwnProperty( "cycle" );
                var flag = !predicate && counted >= 1 && !cycle;
                var animate = [];


                app.ui.debug.innerText = cycle

                scope.params.animate.frames.elapsed += delta;

                // reset time, count and modifiers
                const reset = ( function()
                {
                    return {
                        elapsed: function()
                        {
                            scope.params.animate.frames.elapsed = 0;
                        },
                        modify: function( key )
                        {
                            scope.params.modifiers[ key ] = scope.initial[ key ].from;
                        },
                        deep: function( key, index )
                        {
                            scope.params.modifiers[ key ][ index ] = scope.initial[ key ][ index ].from;
                        },
                        counted: function()
                        {
                            counted = 0;
                        }
                    }
                } )();

                if ( flag )
                    reset.elapsed();

                // numbers
                const modify = function( key )
                {
                    if ( !scope.animation.hasOwnProperty( key ) )
                    {
                        scope.animation[ key ] = { from: scope.params.modifiers[ key ], to: scope.params.animate.keys[ key ] };
                        scope.initial[ key ] = { from: scope.params.modifiers[ key ] };
                    }

                    var distance = scope.animation[ key ].to - scope.animation[ key ].from;
                    animate.push( !!distance );

                    if ( !cycle )
                        scope.params.modifiers[ key ] = counted * distance + scope.animation[ key ].from;
                    else
                        scope.params.modifiers[ key ] = Math[ scope.params.animate.cycle ]( counted * scope.params.animate.speed ) * distance + scope.animation[ key ].from;

                    if ( flag )
                        reset.modify( key );
                };

                // arrays and objects
                const deep = function( key, index )
                {
                    if ( !scope.animation.hasOwnProperty( key ) )
                    {
                        scope.animation[ key ] = [];
                        scope.initial[ key ] = [];
                    }

                    if ( !scope.animation[ key ].hasOwnProperty( index ) )
                    {
                        scope.animation[ key ][ index ] = { from: scope.params.modifiers[ key ][ index ], to: scope.params.animate.keys[ key ][ index ] };
                        scope.initial[ key ][ index ] = { from: scope.params.modifiers[ key ][ index ] };
                    }

                    var distance = scope.animation[ key ][ index ].to - scope.animation[ key ][ index ].from;

                    animate.push( !!distance );

                    if ( !cycle )
                        scope.params.modifiers[ key ][ index ] = counted * distance + scope.animation[ key ][ index ].from;
                    else
                        scope.params.modifiers[ key ][ index ] = Math[ scope.params.animate.cycle ]( counted * scope.params.animate.speed ) * distance + scope.animation[ key ][ index ].from;

                    if ( flag )
                        reset.deep( key, index );
                };

                // find and set scope.animation keys
                Object.keys( scope.params.animate.keys ).forEach( key =>
                {
                    if ( scope.params.modifiers.hasOwnProperty( key ) )
                    {
                        if ( typeof scope.params.animate.keys[ key ] == "object" )
                        {
                            if ( Array.isArray( scope.params.animate.keys[ key ] ) )
                            {
                                scope.params.animate.keys[ key ].forEach( ( k, i ) =>
                                {
                                    deep( key, i );
                                } );
                            }
                            else
                            {
                                for ( var k in scope.params.animate.keys[ key ] )
                                {
                                    if ( scope.params.animate.keys[ key ].hasOwnProperty( k ) )
                                        deep( key, k );
                                }
                            }
                        }
                        else
                        {
                            modify( key );
                        }
                    }
                } );

                if ( flag )
                    reset.counted();

                if ( scope.running && scope.params.animate.frames.counted <= scope.params.animate.frames.count && animate.some( a => a ) )
                {
                    scope.vertices = [];
                    types[ scope.type ]();
                    updater();
                }
                else
                    scope.stop();
            }
        }
    };

    // draws the original mesh
    const plot = function()
    {
        types[ scope.type ]();
        vertices( true );
        center();
    };

    // set axes, loops and type
    const reset = function( args )
    {
        scope.animation = {};
        scope.initial = {};
        scope.params = app.utils.clone( args );
        scope.type = scope.params.type;
        scope.order = dims.map( ( dim, index ) => scope.axes.find( axis => axis === scope.params[ dim ].axis ) );
        scope.axes.forEach( axis => { if ( !scope.order.find( a => a === axis ) ) scope.axis = axis } );
    };

    // calls set and plot
    const create = function( args )
    {
        reset( args );
        plot();

        if ( args.animate )
        {
            // scope.initialize counted
            if ( scope.params.hasOwnProperty( "animate" ) )
            {
                scope.params.animate.frames.counted = 0;
                scope.params.animate.frames.elapsed = 0;
            }

            scope.animate();
        }
    };

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        scope.axes = [ "x", "y", "z" ];
        scope.vertices = [];
        scope.geometries = [];
        scope.meshes = [];
        scope.mesh = {};
        scope.stop();

        if ( scope.debug )
            app.helpers.axes.visible = true;

        create( args.params );
    };

    // sets scope.animation in motion
    scope.animate = function()
    {
        scope.running = true;
        app.arrays.functions.push( { name: scope.name, scope: this, function: animator, args: null } );
    };

    scope.stop = function()
    {
        scope.running = false;
        app.kill( app.arrays.functions, scope.name );
    };

    // sets access to geometry in scope
    scope.get = function( type, args )
    {
        set( type, args );
        types[ scope.type ]();
        vertices( false );
        center();
    };

    // modifiers
    const cubify = function( angle )
    {
        return Math.tan( angle - ninety * ( Math.floor( ( angle + pi / 4 ) / ninety ) ) );
    };
    
    modifiers.cap = function( angle )
    {
        return angle % circle ? 1 : 0;
    };

    modifiers.cbrtPowerOnePlus = function( angle )
    {
        return Math.cbrt( Math.pow( 1 + cubify( angle ), 2 ) );
    };

    modifiers.flatten = function( loop, segments )
    {
        var offset;

        if ( !loop )
            offset = loop + 1;
        else if ( loop === segments )
            offset = loop - 1;
        else
            offset = loop;

        return offset;
    };

    modifiers.onePlusSqrt = function( angle )
    {
        return 1 + Math.sqrt( Math.pow( cubify( angle ), 2 ) );
    };

    modifiers.oneMinusSqrt = function( angle )
    {
        return 1 - Math.sqrt( Math.pow( cubify( angle ), 2 ) );
    };

    modifiers.twoMinusSqrt = function( angle )
    {
        return 2 - Math.sqrt( Math.pow( cubify( angle ), 2 ) );
    };

    modifiers.sin = function( time )
    {
        return Math.sin( time );
    }

    modifiers.sqrtOnePlus = function( angle )
    {
        return Math.sqrt( 1 + Math.pow( cubify( angle ), 2 ) );
    };

    modifiers.multiply = function()
    {
        return Array.from( arguments ).reduce( ( acc, val ) => acc * val );
    };

    modifiers.taper = function( angle )
    {
        return angle % circle;
    };

    modifiers.timer = function( t )
    {
        return tick += t;
    };
    
    modifiers.tooth = function( loop )
    {
        var m = 4;
        var d = 1;
        var r = 0.8;

        if ( !( loop % m ) || !( ( loop + 1 ) % m ) )
            d = r;

        return d;
    };


    // types
    types.active = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];
        var T = scope.params.modifiers.hasOwnProperty( "tick" ) ? modifiers.timer( scope.params.modifiers.tick ) : 1;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = Math.abs( loop[ 1 ] - scope.params.modifiers.focus ) / ( scope.params.modifiers.spread * 2 );
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * ( scope.params.modifiers.scale[ axis ] + Math.cos( angle[ 1 ] ) + scope.params.modifiers.diameter );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };
    
    types.acorn = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( l[ 1 ], scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };
    
    types.anvil = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.ashtray = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, l[ 1 ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.auger = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), ( scope.params.modifiers.scale[ axis ] + scope.params.modifiers.scale[ axis ] * Math.cos( angle[ 1 ] ) ) );
                } );

                vertex[ scope.axis ] = scope.params.modifiers.scale[ scope.axis ] * ( loop[ 0 ] - Math.sin( angle[ 1 ] ) / scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.barrel = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.bell = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ) * Math.cos( angle[ 1 ] ), l[ 1 ], scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.bend = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) + scope.params.modifiers.amount * scope.params.modifiers.scale[ axis ] * Math[ fn[ index ] ]( angle[ 1 ] );
                } );

                vertex[ scope.axis ] = loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.bulge = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            if ( loop[ 1 ] >= scope.params.modifiers.focus - scope.params.modifiers.spread && loop[ 1 ] <= scope.params.modifiers.focus + scope.params.modifiers.spread )
            {
                l[ 1 ] = Math.abs( loop[ 1 ] - scope.params.modifiers.focus ) / ( scope.params.modifiers.spread * 2 );
                angle[ 1 ] = ninety - circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
                A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            }
            else
            {
                angle[ 1 ] = 0;
            }

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * scope.params.modifiers.scale[ axis ] * ( 1 + Math.sin( angle[ 1 ] ) );
                } );

                vertex[ scope.axis ] = loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.bullet = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = ( loop[ 1 ] - scope.params.modifiers.focus ) / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.sin( angle[ 1 ] ), loop[ 1 ], scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.bump = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            if ( loop[ 1 ] >= scope.params.modifiers.focus - scope.params.modifiers.spread && loop[ 1 ] <= scope.params.modifiers.focus + scope.params.modifiers.spread )
            {
                l[ 1 ] = Math.abs( loop[ 1 ] - scope.params.modifiers.focus ) / ( scope.params.modifiers.spread * 2 );
                angle[ 1 ] = ninety - circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
                A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            }
            else
            {
                angle[ 1 ] = 0;
            }

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = loop[ index ] * scope.params.modifiers.scale[ axis ];
                } );

                vertex[ scope.axis ] = Math.sin( angle[ 1 ] ) * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.capsule = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] * A )
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ) * scope.params.modifiers.scale[ scope.axis ] * A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.carton = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( loop[ index ], scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = ( Math.sin( angle[ 1 ] + scope.params.modifiers.time ) + Math.sin( angle[ 0 ] + scope.params.modifiers.time ) ) * scope.params.modifiers.scale[ scope.axis ] * scope.params.modifiers.amplitude;

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.cigar = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.clam = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( loop[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ], scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.coil = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * ( scope.params.modifiers.diameter + scope.params.modifiers.scale[ axis ] * Math.cos( angle[ 1 ] ) );
                } );

                vertex[ scope.axis ] = ( loop[ 0 ] * scope.params.modifiers.pitch + Math.sin( angle[ 1 ] ) ) * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.cone = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * scope.params.modifiers.scale[ axis ] * loop[ 1 ];
                } );

                vertex[ scope.axis ] = loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.cross = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] * A * B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.cube = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.cup = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], Math.pow( scope.params.modifiers.base, scope.params.modifiers.power ) );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.cylinder = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            
            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * scope.params.modifiers.scale[ axis ];
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ], scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.dart = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], Math.pow( l[ 1 ], scope.params.modifiers.power ) );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.diamond = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, B, l[ 1 ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.diaphragm = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = ( Math[ fn[ index ] ]( angle[ 0 ] + scope.params.modifiers.rotate ) + ( 1 - Math.cos( angle[ 1 ] ) ) * Math[ fn[ index ] ]( angle[ 0 ] ) ) * scope.params.modifiers.scale[ axis ];
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.dome = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = Math.cos( angle[ 1 ] ) * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.dumbells = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            if ( loop[ 1 ] >= scope.params.modifiers.focus - scope.params.modifiers.spread && loop[ 1 ] <= scope.params.modifiers.focus + scope.params.modifiers.spread )
            {
                l[ 1 ] = Math.abs( loop[ 1 ] - scope.params.modifiers.focus ) / ( scope.params.modifiers.spread * 2 );
                angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
                A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            }
            else
            {
                angle[ 1 ] = 0;
            }

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * scope.params.modifiers.scale[ axis ] - Math.cos( angle[ 1 ] ) * Math[ fn[ index ] ]( angle[ 0 ] );
                } );

                vertex[ scope.axis ] = loop[ 1 ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.eardrum = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * ( scope.params.modifiers.scale[ axis ] + Math.cos( angle[ 1 ] ) );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 0 ], scope.params.modifiers.scale[ scope.axis ], Math.sin( angle[ 1 ] ) );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.fang = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], Math.pow( l[ 1 ], scope.params.modifiers.power ) );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.flow = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = Math.abs( loop[ 1 ] - scope.params.modifiers.focus ) / ( scope.params.modifiers.spread * 2 );
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * ( scope.params.modifiers.scale[ axis ] + Math.cos( angle[ 1 ] ) + scope.params.modifiers.diameter );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.gaussian = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        var a, b, c;
        var cos2, sin2;
        var s02, s12;
        var d0, d1;
        var s = {};
        var v;
        
        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            
            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;
                
                cos2 = Math.cos( angle[ 0 ] ) * Math.cos( angle[ 0 ] );
                sin2 = Math.sin( angle[ 0 ] ) * Math.sin( angle[ 0 ] );

                scope.order.forEach( ( axis, index ) =>
                {
                    s[ index ] = scope.params[ dims[ index ] ].segments / 2;
                    vertex[ axis ] = loop[ index ];
                } );

                s02 = s[ 0 ] * s[ 0 ] * 2;
                s12 = s[ 1 ] * s[ 1 ] * 2;

                a = cos2 / s02 + sin2 / s12;
                b = Math.sin( 2 * angle[ 0 ] ) / ( 2 * s12 ) - Math.sin( 2 * angle[ 0 ] ) / ( 2 * s02 );
                c = sin2 / s02 + cos2 / s12;

                d0 = loop[ 0 ] - s[ 0 ];
                d1 = loop[ 1 ] - s[ 1 ];

                v = scope.params.modifiers.scale[ scope.axis ] * Math.pow( Math.pow( scope.params.modifiers.base, scope.params.modifiers.power ) * scope.params.modifiers.scale[ scope.axis ], -( a * Math.pow( d0, 2 ) + 2 * b * d0 * d1 + c * Math.pow( d1, 2 ) ) );
                vertex[ scope.axis ] = isNaN( v ) ? 0 : v;

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.gear = function()
    {
        var vertex;
        var A, B, C;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            C = scope.params.modifiers.hasOwnProperty( "C" ) ? modifiers[ scope.params.modifiers.C ]( loop[ 1 ], scope.params[ dims[ 1 ] ].segments ) : loop[ 1 ];

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( loop[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( scope.params.modifiers.scale[ scope.axis ], C );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.goblet = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, l[ 1 ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( 1 - Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.hammock = function()
    {
        var vertex;
        var d;
        var p;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();
                d = 0;

                scope.order.forEach( ( axis, index ) =>
                {
                    p = scope.params[ dims[ index ] ].segments / 2 - loop[ index ];
                    vertex[ axis ] = loop[ index ] * scope.params.modifiers.scale[ axis ];
                    d += p * p;
                } );

                vertex[ scope.axis ] = Math.sqrt( d ) * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.hat = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];
        
        var d;
        var p;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();
                d = 0;

                scope.order.forEach( ( axis, index ) =>
                {
                    p = scope.params[ dims[ index ] ].segments / 2 - loop[ index ];
                    vertex[ axis ] = loop[ index ] * scope.params.modifiers.scale[ axis ];
                    d += p * p;
                } );

                vertex[ scope.axis ] = ( scope.params[ dims[ 1 ] ].segments / 2 - Math.sqrt( d ) * Math.sin( angle[ 1 ] ) ) * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.horn = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        var log;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            log = Math.log10( loop[ 1 ] + 2 );

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ) / log, scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.hourglass = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * ( Math.cos( angle[ 1 ] ) + scope.params.modifiers.diameter );
                } );

                vertex[ scope.axis ] = modifiers.multiply( l[ 1 ], scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.kink = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            if ( loop[ 1 ] >= scope.params.modifiers.focus - scope.params.modifiers.spread && loop[ 1 ] <= scope.params.modifiers.focus + scope.params.modifiers.spread )
            {
                l[ 1 ] = Math.abs( loop[ 1 ] - scope.params.modifiers.focus ) / ( scope.params.modifiers.spread * 2 );
                angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
                A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            }
            else
            {
                angle[ 1 ] = 0;
            }

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = ( Math[ fn[ index ] ]( angle[ 0 ] ) + Math.cos( angle[ 1 ] ) ) * scope.params.modifiers.scale[ axis ];
                } );

                vertex[ scope.axis ] = loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.kiss = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        var base;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            base = ( scope.params[ dims[ 1 ] ].segments - loop[ 1 ] ) / 2;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], Math.pow( base, scope.params.modifiers.power ) );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.lamp = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.lozenge = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ) * Math.sin( angle[ 1 ] ), l[ 1 ], scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.lump = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        var a, b, c;
        var cos2, sin2;
        var s02, s12;
        var d0, d1;
        var s = {};
        var v;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                cos2 = Math.cos( angle[ 0 ] ) * Math.cos( angle[ 0 ] );
                sin2 = Math.sin( angle[ 0 ] ) * Math.sin( angle[ 0 ] );

                scope.order.forEach( ( axis, index ) =>
                {
                    s[ index ] = scope.params[ dims[ index ] ].segments / 2;
                    vertex[ axis ] = loop[ index ];
                } );

                s02 = s[ 0 ] * s[ 0 ] * 2;
                s12 = s[ 1 ] * s[ 1 ] * 2;

                a = cos2 / s02 + sin2 / s12;
                b = Math.sin( 2 * angle[ 0 ] ) / ( 2 * s12 ) - Math.sin( 2 * angle[ 0 ] ) / ( 2 * s02 );
                c = sin2 / s02 + cos2 / s12 ;

                d0 = loop[ 0 ] - s[ 0 ] - scope.params.modifiers.focus[ 0 ];
                d1 = loop[ 1 ] - s[ 1 ] - scope.params.modifiers.focus[ 1 ];

                v = scope.params.modifiers.scale[ scope.axis ] * Math.pow( Math.pow( scope.params.modifiers.base, scope.params.modifiers.power ) * scope.params.modifiers.scale[ scope.axis ], -( a * Math.pow( d0, 2 ) + 2 * b * d0 * d1 + c * Math.pow( d1, 2 ) ) );
                vertex[ scope.axis ] = isNaN( v ) ? 0 : v;

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.molar = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];
        var T = scope.params.modifiers.hasOwnProperty( "tick" ) ? modifiers.timer( scope.params.modifiers.tick ) : 1;

        var d;
        var p;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();
                d = 0;

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    angle[ 1 ] = pi * loop[ index ] / scope.params[ dims[ index ] ].segments;
                    p = scope.params[ dims[ index ] ].segments / 2 - loop[ index ];
                    vertex[ axis ] = loop[ index ] * scope.params.modifiers.scale[ axis ];
                    d += p * p * Math.sin( angle[ 1 ] );
                } );

                vertex[ scope.axis ] = Math.sqrt( d ) * scope.params.modifiers.scale[ scope.axis ] * ( Math.sin( angle[ 1 ] * T ) * Math.cos( angle[ 0 ] * T ) );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.muffler = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, ninety ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            if ( loop[ 1 ] >= scope.params.modifiers.focus - scope.params.modifiers.spread && loop[ 1 ] <= scope.params.modifiers.focus + scope.params.modifiers.spread )
            {
                l[ 1 ] = Math.abs( loop[ 1 ] - scope.params.modifiers.focus ) / ( scope.params.modifiers.spread * 2 );
                angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
                A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            }

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();
                angle[ 0 ] = circle * loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = ( Math[ fn[ index ] ]( angle[ 0 ] ) + Math.sin( angle[ 1 ] ) * Math.cos( angle[ 0 ] ) ) * scope.params.modifiers.scale[ axis ];
                } );

                vertex[ scope.axis ] = loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.needle = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], Math.pow( l[ 1 ], scope.params.modifiers.power ) );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.narrow = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            if ( loop[ 1 ] >= scope.params.modifiers.focus - scope.params.modifiers.spread && loop[ 1 ] <= scope.params.modifiers.focus + scope.params.modifiers.spread )
            {
                l[ 1 ] = Math.abs( loop[ 1 ] - scope.params.modifiers.focus ) / ( scope.params.modifiers.spread * 2 );
                angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
                A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            }
            else
            {
                angle[ 1 ] = 0;
            }

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = ( ( Math[ fn[ index ] ]( angle[ 0 ] ) * scope.params.modifiers.diameter - Math.sin( angle[ 1 ] ) * Math[ fn[ index ] ]( angle[ 0 ] ) ) ) * scope.params.modifiers.scale[ axis ];
                } );

                vertex[ scope.axis ] = loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.pacman = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];
        var mouth = scope.params.modifiers.angle[ 0 ] - scope.params.animate.keys.angle[ 0 ];
        var T = scope.params.modifiers.hasOwnProperty( "tick" ) ? modifiers.timer( scope.params.modifiers.tick ) : 1;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ] - mouth * 2;
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = Math.cos( angle[ 1 ] ) * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.pill = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.plane = function()
    {
        var vertex;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = loop[ index ] * scope.params.modifiers.scale[ axis ];
                } );

                vertex[ scope.axis ] = 0;

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.propeller = function()
    {
        var vertex;
        var A, B, C;
        var l = [];
        var angle = [ 0, 0 ];

        if ( !( scope.params.modifiers.blades % 2 ) )
            scope.params.modifiers.blades /= 2;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            C = scope.params.modifiers.hasOwnProperty( "C" ) ? modifiers[ scope.params.modifiers.C ]( loop[ 1 ], scope.params[ dims[ 1 ] ].segments ) : loop[ 1 ];

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.cos( angle[ 0 ] * scope.params.modifiers.blades ), scope.params.modifiers.scale[ axis ], A );
                } );

                vertex[ scope.axis ] = scope.params.modifiers.scale[ scope.axis ] * C;

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };
    
    types.pulley = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A );
                } );

                vertex[ scope.axis ] = modifiers.multiply( l[ 1 ], scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.ripple = function()
    {
        var vertex;       
        var d;
        var p;
        var T = scope.params.modifiers.hasOwnProperty( "tick" ) ? modifiers.timer( scope.params.modifiers.tick ) : 1;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();
                d = 0;

                scope.order.forEach( ( axis, index ) =>
                {
                    p = scope.params[ dims[ index ] ].segments / 2 - loop[ index ];
                    d += p * p;

                    vertex[ axis ] = loop[ index ] * scope.params.modifiers.scale[ axis ];
                } );

                vertex[ scope.axis ] = Math.sin( Math.sqrt( d ) + T ) * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.rotate = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];
        var T = scope.params.modifiers.hasOwnProperty( "tick" ) ? modifiers.timer( scope.params.modifiers.tick ) : 1;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] + T ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.saucer = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];
        var T = scope.params.modifiers.hasOwnProperty( "tick" ) ? modifiers.timer( scope.params.modifiers.tick ) : 1;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] + T ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.slope = function()
    {
        var vertex;
        var d;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();
                d = 0;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = loop[ index ] * scope.params.modifiers.scale[ axis ];
                    d += vertex[ axis ] * vertex[ axis ];
                } );

                vertex[ scope.axis ] = Math.sqrt( d ) * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.sphere = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = Math.cos( angle[ 1 ] ) * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.spindle = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.spiral = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * ( scope.params.modifiers.diameter * l[ 0 ] + scope.params.modifiers.scale[ axis ] * Math.cos( angle[ 1 ] ) );
                } );

                vertex[ scope.axis ] = ( loop[ 0 ] * scope.params.modifiers.pitch + Math.sin( angle[ 1 ] ) ) * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.spool = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.stack = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ];

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.tent = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        var base;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            base = ( scope.params[ dims[ 1 ] ].segments - loop[ 1 ] ) / 2;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], Math.pow( base, scope.params.modifiers.power ) );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.top = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };    

    types.torus = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * ( scope.params.modifiers.diameter + scope.params.modifiers.scale[ axis ] * Math.cos( angle[ 1 ] ) );
                } );

                vertex[ scope.axis ] = modifiers.multiply( scope.params.modifiers.scale[ scope.axis ], Math.sin( angle[ 1 ] ) );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.tower = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        var base;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            base = ( scope.params[ dims[ 1 ] ].segments / 2 - loop[ 1 ] );

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * ( scope.params.modifiers.diameter + Math.pow( base, scope.params.modifiers.power ) * scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ], scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.twist = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];
        var T = scope.params.modifiers.hasOwnProperty( "tick" ) ? modifiers.timer( scope.params.modifiers.tick ) : 1;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] + T * angle[ 1 ] ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ], scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.ufo = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.vortex = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        var base;

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            base = ( scope.params[ dims[ 1 ] ].segments - loop[ 1 ] ) / 2;

            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] + angle[ 1 ] ), ( 1 + Math.pow( base, scope.params.modifiers.power ) ), scope.params.modifiers.scale[ axis ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( -loop[ 1 ], scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.wind = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = -modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), scope.params.modifiers.scale[ axis ] / ( loop[ 0 ] + 1 ) );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ], scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.wrapper = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            if ( loop[ 1 ] >= scope.params.modifiers.focus - scope.params.modifiers.spread && loop[ 1 ] <= scope.params.modifiers.focus + scope.params.modifiers.spread )
            {
                l[ 1 ] = Math.abs( loop[ 1 ] - scope.params.modifiers.focus ) / ( scope.params.modifiers.spread * 2 );
                angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
                A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;
            }
            else
            {
                angle[ 1 ] = 0;
            }

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math[ fn[ index ] ]( angle[ 0 ] ) * scope.params.modifiers.scale[ axis ] + Math.cos( angle[ 1 ] ) * Math[ fn[ index ] ]( angle[ 0 ] );
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ] * scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.yoyo = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            l[ 1 ] = loop[ 1 ] / scope.params[ dims[ 1 ] ].segments;
            angle[ 1 ] = circle * l[ 1 ] * scope.params.modifiers.angle[ 1 ];
            A = scope.params.modifiers.hasOwnProperty( "A" ) ? modifiers[ scope.params.modifiers.A ]( angle[ 1 ] ) : 1;

            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = modifiers.multiply( Math[ fn[ index ] ]( angle[ 0 ] ), Math.sin( angle[ 1 ] * scope.params.modifiers.stacks ), scope.params.modifiers.scale[ axis ], A, B );
                } );

                vertex[ scope.axis ] = modifiers.multiply( Math.cos( angle[ 1 ] ), scope.params.modifiers.scale[ scope.axis ], A );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope[ scope.params.modifiers.center ];
    };

    types.zigzag = function()
    {
        var vertex;
        var A, B;
        var l = [];
        var angle = [ 0, 0 ];

        for ( loop[ 1 ] = 0; loop[ 1 ] <= scope.params[ dims[ 1 ] ].segments; loop[ 1 ]++ )
        {
            for ( loop[ 0 ] = 0; loop[ 0 ] <= scope.params[ dims[ 0 ] ].segments; loop[ 0 ]++ )
            {
                vertex = new THREE.Vector3();

                l[ 0 ] = loop[ 0 ] / scope.params[ dims[ 0 ] ].segments;
                angle[ 0 ] = circle * l[ 0 ] * scope.params.modifiers.angle[ 0 ];
                B = scope.params.modifiers.hasOwnProperty( "B" ) ? modifiers[ scope.params.modifiers.B ]( angle[ 0 ] ) : 1;

                scope.order.forEach( ( axis, index ) =>
                {
                    vertex[ axis ] = Math.sqrt( Math.pow( loop[ 0 ], Math.pow( Math[ fn[ index ] ]( angle[ 0 ] ), scope.params.modifiers.power ) ) ) * scope.params.modifiers.scale[ axis ];
                } );

                vertex[ scope.axis ] = modifiers.multiply( loop[ 1 ], scope.params.modifiers.scale[ scope.axis ] );

                vertex.add( scope.position );
                scope.vertices.push( vertex );
            }
        }

        scope.center = scope.axes;
    };
};
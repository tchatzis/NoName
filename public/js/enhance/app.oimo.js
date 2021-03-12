const Oimo3 = function()
{
    var scope = "oimo";
    var app = this;
        app[ scope ] = {};

    const orientation = function( target )
    {
        const axes = [ "x", "y", "z" ];
        const array = [ ...target.geometry.attributes.position.array ];
        const value = {};
        const min = {};
        const max = {};
        const position = [];
        var i = 0;

        axes.forEach( axis =>
        {
            value[ axis ] = [];
        } );

        for ( var a = 0; a < array.length; a += axes.length )
        {
            i = a % axes.length;

            value[ axes[ i ] ].push( array[ a ] );
            value[ axes[ i + 1 ] ].push( array[ a + 1 ] );
            value[ axes[ i + 2 ] ].push( array[ a + 2 ] );
        }

        axes.forEach( axis =>
        {
            min[ axis ] = Math.min( ...value[ axis ] );
            max[ axis ] = Math.max( ...value[ axis ] );
        } );

        axes.forEach( axis =>
        {
            position.push( ( max[ axis ] - min[ axis ] ) / 2 + min[ axis ] );
        } );

        return position;
    };

    app[ scope ].init = function( args )
    {
        app[ scope ].world = new OIMO.World(
        {
            timestep: 1 / app.utils.fps,
            iterations: 8,
            broadphase: 2, // 1: brute force, 2: sweep & prune, 3: volume tree
            worldscale: 1,
            random: true,
            info: false
        } );

        app[ scope ].bodies = [];
        app[ scope ].world.gravity = new OIMO.Vec3( ...args.gravity.toArray() );

        Object.assign( app[ scope ], args );
    };

    app[ scope ].add = function( target, args )
    {
        var g = target.geometry;
        var s = g.parameters;
        var type = g.type.replace( "Buffer", "" ).replace( "Geometry", "" ).toLowerCase() || "geometry";
        var size;
        var position;

        /*var SHAPE_NULL = 0;
        var SHAPE_SPHERE = 1;
        var SHAPE_BOX = 2;
        var SHAPE_CYLINDER = 3;
        var SHAPE_PLANE = 4;
        var SHAPE_PARTICLE = 5;
        var SHAPE_TETRA = 6;*/
 
        switch ( type )
        {
            // 1
            case "sphere": size = [ s.radius ]; break;
            // 2
            case "box": size = Object.values( new THREE.Vector3( s.width, s.height, s.depth ).multiply( target.scale ) ); break;
            // 3
            case "cylinder": size = [ s.radiusTop, s.height, s.radiusBottom ]; break;
            // 4
            case "plane":
                size = Object.values( new THREE.Vector3( s.width * target.scale.x, 0.01, s.height * target.scale.y ) );
                type = "box";
            break;

            case "geometry":
                type = "plane";
                position = orientation( target );
            break;
        }

        var parameters =
        {
            name:   args.name,
            pos:    Object.values( target.position ),
            rot:    Object.values( target.rotation ).slice( 0, 3 ).map( app.utils.degrees ),
            size:   size,
            type:   type,
            world:  app[ scope ].world
        };

        Object.assign( target.userData,
        {
            start:  new THREE.Vector3().copy( target.position ),
            onOIMOComplete: args.onOIMOComplete
        } );

        Object.assign( parameters, args );

        var body = app[ scope ].world.add( parameters );
            body.connectMesh( target );

        app[ scope ].bodies.push( body );

        return body;
    };
    
    app[ scope ].destroy = function( body, index )
    {
        app[ scope ].bodies.splice( index, 1 );
        body.mesh.parent.remove( body.mesh );
        body = null;
    };

    app[ scope ].play = function()
    {
        if ( app[ scope ].bodies.length )
        {
            app[ scope ].world.postLoop = app[ scope ].postLoop;
            app[ scope ].world.play();
        }
    };

    app[ scope ].postLoop = function()
    {
        app[ scope ].bodies.forEach( ( body, index ) =>
        {
            var distance = body.mesh.position.distanceTo( body.mesh.userData.start );
            var quaternion = body.mesh.quaternion.clone();

            if ( body.mesh.userData.onOIMOComplete )
                body.mesh.userData.onOIMOComplete( body, index );

            if ( distance > app[ scope ].distance && !body.isStatic )
                reset( body );
        } );
    };

    app[ scope ].reset = function()
    {
        app[ scope ].world.postLoop = app[ scope ].postLoop;
        app[ scope ].bodies = [];
    };

    app[ scope ].wake = function( body )
    {
        if ( body.sleeping )
            reset( body );
    };

    app[ scope ].stop = function()
    {
        if ( app[ scope ].world )
            app[ scope ].world.stop();
    };

    app[ scope ].update = function( body, dummy )
    {
        //console.log( dummy.position.toArray(), dummy.rotation.toArray() )
        
        //body.setPosition( dummy.position.toArray() );
        //body.setRotation( dummy.rotation.toArray() );
    };

    function reset( body )
    {
        var position = body.mesh.userData.start.clone().toArray();

        body.resetPosition( ...position );
    }
};
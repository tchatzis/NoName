const Polygons = function()
{
    var app = {};
    var scope = this;

    var round = function( vector, precision )
    {
        precision = !isNaN( precision ) ? precision : 2;
        var exponent = Math.pow( 10, precision );

        for( var axis in vector )
        {
            if ( vector.hasOwnProperty( axis ) )
                vector[ axis ] = Math.round( vector[ axis ] * exponent ) / exponent;
        }

        return vector;
    };

    var Ring = function( origin, depth )
    {
        depth--;

        let angle = Math.PI * 2 / scope.sides;

        for ( let s = 0; s < scope.sides; s++ )
        {
            let clone = new THREE.Object3D();
                clone.position.copy( origin );
                clone.rotateY( angle * s );
                clone.translateX( scope.distance );
                clone.translateY( scope.up * depth );
                clone.rotateY( -angle * s );
                clone.position = round( clone.position );
                clone.updateMatrix();

            var start = new THREE.Vector3( clone.position.x, scope.up * depth, clone.position.z );

            app.utils.attributes.set( scope.geometry, "start", scope.iteration, start );

            scope.mesh.setMatrixAt( scope.iteration, clone.matrix );
            scope.iteration++;

            if ( 0 < depth )
                new Ring( new THREE.Vector3().copy( clone.position ), depth );
        }
    };

    var Polygon = function( position )
    {
        let clone = new THREE.Object3D();
            clone.position.copy( position );
            clone.updateMatrix();
            clone.translateY( -scope.up * scope.depth );

        var start = new THREE.Vector3( clone.position.x, scope.up * scope.depth, clone.position.z );

        app.utils.attributes.set( scope.geometry, "start", scope.iteration, start );

        scope.mesh.setMatrixAt( scope.iteration, clone.matrix );
        scope.iteration++;

        if ( scope.iteration < scope.count )
            new Ring( new THREE.Vector3().copy( clone.position ), scope.depth );
    };

    var count = function()
    {
        scope.count = 0;
        scope.iteration = 0;

        var depth = scope.depth;

        while ( depth >= 0 )
        {
            scope.count += Math.pow( scope.sides, depth );
            depth--;
        }
    };

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        var size = scope.size - scope.spacing;

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        count();
        scope.geometry = new THREE.CylinderBufferGeometry( size, size, size, scope.sides, 1, false );
        scope.onInstancedComplete = ( instance ) =>
        {
            scope.mesh = instance.mesh;
            scope.plot();
            scope.group.add( instance.mesh );

            app.arrays.animations.push( { name: scope.name, object: instance.mesh, path: "rotation.y", value: 0.01 } );
            app.arrays.animations.push( { name: scope.name, object: instance.mesh, path: "material.uniforms.time.value", value: 0.01 } );
            app.arrays.functions.push( { name: scope.name, scope: scope, function: scope.disruptor, args: null } );
        };
        scope.instanced = new Instanced( app, scope );
        scope.instanced.preset();
    };

    scope.plot = function()
    {
        var distance = app.utils.apothem( scope.size, scope.sides );
        scope.distance = !( scope.sides % 2 ) ? distance.apothem : scope.size;
        scope.distance *= 2;

        new Polygon( scope.origin );

        scope.mesh.instanceMatrix.needsUpdate = true;
    };

    scope.disruptor = function()
    {
        scope.last = ( scope.index + scope.count - 1 ) % ( scope.count );
        scope.index = scope.index % ( scope.count );

        app.utils.attributes.set( scope.geometry, "color", scope.last, scope.attributes.color.value );
        app.utils.attributes.set( scope.geometry, "color", scope.index, scope.attributes.alternate.value );
        app.utils.attributes.set( scope.geometry, "opaque", scope.index, scope.attributes.opaque.value );
        app.ui.debug.innerText = scope.index;
        scope.index++;
    };
};
const Analyser = function()
{
    var app = {};
    var scope = this;

    var geometry = function( type )
    {
        switch ( type.toLowerCase() )
        {
            case "box":
                return new THREE.BoxBufferGeometry( scope.size - scope.spacing, scope.size - scope.spacing, scope.size - scope.spacing );

            case "sphere":
                return new THREE.SphereBufferGeometry( scope.size / 2 - scope.spacing, 16, 8 );
        }
    };

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = scope.name;
        scope.parent.add( scope.group );

        scope.geometry = geometry( scope.geometry );
        scope.onInstancedComplete = ( instance ) =>
        {
            scope.mesh = instance.mesh;
            scope.mesh.scale.copy( scope.scale );
            scope.group.add( instance.mesh );
            scope.instanced.plot();

            if ( scope.uniforms.phase.value > -1 )
                app.arrays.animations.push( { name: scope.name, object: instance.mesh, path: "material.uniforms.time.value", value: 0.01 } );

            if ( scope.audio )
                Input.call( scope, app, scope.output );

            if ( scope.straightness )
            {
                Bender.call( scope, app );
                scope.bend();
            }
        };

        scope.columns = scope.dimensions.x;
        scope.rows = scope.dimensions.y;
        scope.depth = scope.dimensions.z;
        scope.count = Object.values( scope.dimensions ).reduce( ( accumulator, value ) => accumulator * value );
        scope.instanced = new Instanced( app, scope );
    };
};
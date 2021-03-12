const Marquee = function()
{
    var app = {};
    var scope = this;    

    var geometry = function( type )
    {
        switch ( type.toLowerCase() )
        {
            case "box":
                return new THREE.BoxBufferGeometry( scope.size - scope.spacing, scope.size - scope.spacing, scope.size - scope.spacing, 1, 1, 1 );

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

            if ( scope.characters )
            {
                Reader.call( scope, app );
                scope.read();
            }
        };

        scope.count = Object.values( scope.dimensions ).reduce( ( accumulator, value ) => accumulator * value );
        scope.instanced = new Instanced( app, scope );
    };
};
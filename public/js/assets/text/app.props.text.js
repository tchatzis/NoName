const Text = function()
{
    var app = {};
    var scope = this;

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        Object.defineProperty( scope.geometry, 'font',
        {
            enumerable: false,
            value: args.font
        } );

        scope.group = new THREE.Group();
        scope.parent.add( scope.group );

        scope.update( scope.message );
    };

    scope.update = function( message )
    {
        var geometry = new THREE.TextGeometry( message, scope.geometry );

        scope.message = message;
        scope.mesh = new THREE.Mesh( geometry, scope.material || new THREE.MeshStandardMaterial() );
        scope.mesh.name = message;
        scope.group.name = message;
        scope.group.children = [];
        scope.group.add( scope.mesh );
        
        app.utils.center( scope.mesh );
    };
};


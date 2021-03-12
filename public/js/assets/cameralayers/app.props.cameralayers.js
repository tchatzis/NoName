const CameraLayers = function()
{
    var app = {};
    var scope = this;

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = scope.name;
        scope.parent.add( scope.group );

        var objBack = new THREE.Mesh( new THREE.BoxGeometry( 5, 5, 1 ), new THREE.MeshBasicMaterial( { color: new THREE.Color( 0xFF9900 ), wireframe: false } ) );
            objBack.position.z = -2.25;
            objBack.layers.set( 1 );
            scope.group.add( objBack );

        var obj = new THREE.Mesh( new THREE.BoxGeometry( 5, 5, 4 ), new THREE.MeshLambertMaterial( { color: new THREE.Color( 0x666666 ), wireframe: false } ) );
            obj.layers.set( 0 );
            obj.position.z = 0.25;
            scope.group.add( obj );
    };

};
const Scanner = function()
{
    var app = {};
    var scope = this;
    var range     = () => new THREE.Vector3().copy( scope.to ).sub( scope.from );
    var increment = () => new THREE.Vector3().set( range().x / scope.resolution, 0, scope.step );

    scope.flagged = [];
    scope.current = null;
    scope.round = ( point ) => point.toArray().map( a => Math.round( a / scope.quantize ) * scope.quantize );

    scope.init = function( target, args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.probe = target;
        scope.probe.visible = false;
        scope.resolution = args.resolution;
        scope.index = 0;
        scope.step = 10;
        scope.dimensions = scope.to.clone().sub( scope.from.clone() );
        scope.increment = increment();
        scope.count = ( scope.resolution + 1 ) * ( scope.resolution + 1 );
    };

    scope.next = function()
    {
        if ( scope.index < scope.count )
        {
            scope.move();
            scope.index++;
        }
        else
            scope.end();
    };

    // move the probe
    scope.move = function()
    {
        var pos = scope.position( scope.index );

        scope.probe.position.x = pos.x;
        scope.probe.position.z = pos.z;
        scope.probe.visible = true;
    };

    // set world position
    scope.position = function( index )
    {
        return new THREE.Vector3().copy( scope.from ).add( scope.indices( index ).multiply( scope.increment.clone() ) );
    };

    // access grid x and z indices
    scope.indices = function( index )
    {
        var x = index % ( scope.resolution + 1 );
        var z = Math.floor( index / ( scope.resolution + 1 ) );

        return new THREE.Vector3( x, 0, z );
    };

    // kill
    scope.end = function()
    {
        app.kill( app.arrays.functions, scope.raycaster.name );

        scope.probe.parent.remove( scope.probe );
        scope.raycaster.beam.group.children = [];
        scope.raycaster = null;
    };
};
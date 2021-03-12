const MarchingCube = function()
{
    var app = {};
    var scope = this;
    var time = 0;

    scope.reset = true;
    scope.planes = [];

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );
        
        create();
    };
    
    const create = function()
    {
        scope.effect = new MarchingCubes( scope.resolution, scope.material, true, true, scope.rounding );
        scope.effect.position.set( 0, 0, 0 );
        scope.effect.scale.multiplyScalar( scope.scale || 1 );
        scope.effect.isolation = scope.isolation;
        scope.effect.enableUvs = false;
        scope.effect.enableColors = false;

        scope.group.add( scope.effect );

        app.arrays.functions.push( { name: scope.name, scope: scope, function: update, args: null } );
    };

    const update = function()
    {
        time += scope.tick * scope.speed;

        if ( scope.reset )
            scope.effect.reset();
        else
        {
            if ( scope.time && time > scope.time )
                app.kill( app.arrays.functions, scope.name );
        }

        var x, y, z;
        var tx, ty, tz;
        var subtract = scope.subtract;
        var strength = scope.strength / ( ( Math.sqrt( scope.count ) - 1 ) / 4 + 1 );

        for ( let i = 0; i < scope.count; i ++ )
        {
            tx = i + 1.26 * time;
            ty = i + 1.12 * time;
            tz = i + 1.32 * time;

            // plot Superquadric
            x = Math.sin( tx * Math.cos( 0.21 + 0.3033 * i ) ) * scope.limit.x + scope.offset.x;
            y = Math.cos( ty * Math.cos( 1.22 + 0.1424 * i ) ) * scope.limit.y + scope.offset.y;
            z = Math.cos( tz * Math.sin( 0.92 + 0.5300 * i ) ) * scope.limit.z + scope.offset.z;

            scope.effect.addBall( x, y, z, strength, subtract );
        }

        scope.planes.forEach( axis =>
        {
            scope.effect[ `addPlane${ axis.toUpperCase() }` ]( strength, subtract );
        } );
    }
};
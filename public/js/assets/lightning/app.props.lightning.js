const Lightning = function()
{
    var app = {};
    var scope = this;

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        scope.lightning = [];
        scope.current = 0;
        scope.total = 50;

        scope.geometry = new THREE.BufferGeometry();
        scope.material = new THREE.LineBasicMaterial();

        app.arrays.persistent.functions.push( { name: scope.name, scope: scope, function: scope.update, args: null } );
    };

    var rand = function( rMi, rMa )
    {
        return ~~( ( Math.random() * ( rMa - rMi ) ) + rMi );
    };

    var create = function( points, canSpawn )
    {
        scope.lightning.push(
        {
            xRange: rand( 1, 10 ),
            yRange: rand( 1, 10 ),
            zRange: rand( 1, 10 ),
            path: [ points ],
            pathLimit: rand( 10, 20 ),
            canSpawn: canSpawn,
            hasFired: false
        } );
    };

    var update = function()
    {
        var i = scope.lightning.length;
        
        while( i-- )
        {
            var light = scope.lightning[ i ];

            light.path.push(
            [
                light.path[ light.path.length - 1 ][ 0 ] + ( rand( 0, light.xRange ) - ( light.xRange / 2 ) ),
                light.path[ light.path.length - 1 ][ 1 ] + ( rand( 0, light.yRange ) ),
                light.path[ light.path.length - 1 ][ 2 ] + ( rand( 0, light.zRange ) - ( light.zRange / 2 ) )
            ]
            );

            if( light.path.length > light.pathLimit )
            {
                scope.lightning.splice( i, 1 )
            } 
            
            light.hasFired = true;
        }
    };

    var render = function()
    {
        var i = scope.lightning.length;
        var points = [];

        while( i-- )
        {
            var light = scope.lightning[ i ];
            var pathCount = light.path.length;

            for( var pc = 0; pc < pathCount; pc++ )
            {
                points.push( new THREE.Vector3( ...light.path[ pc ] ) );

                if( light.canSpawn )
                {
                    if( rand( 0, 10 ) === 0 )
                    {
                        light.canSpawn = false;
                        create( light.path[ pc ], false );
                    }
                }
            }
        }

        scope.geometry.setFromPoints( points );

        var line = new THREE.Line( scope.geometry, scope.material );
            line.layers.set( 1 );
        scope.group.add( line );
    };

    var limiter = function()
    {
        scope.current++;

        if ( scope.current >= scope.total )
        {
            clear();

            var points = [ 0, 0, 0 ];
            create( points, true );
            /*var createCount = rand( 1, 3 );

            while( createCount-- )
            {
                create( points, false );
            }*/

            scope.current = 0;
            scope.total = rand( 30, 100 );
        }
    };

    var clear = function()
    {
        scope.group.children = [];
        scope.geometry = new THREE.BufferGeometry();
    };

    scope.update = function()
    {
        update();
        limiter();
        render();
    };

};

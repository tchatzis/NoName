const Bender = function( app )
{
    var scope = this;
    var circle = Math.PI * 2;
    var i = 0;

    const set = function( x, z, a )
    {
        for ( var row = 0; row < scope.rows; row++ )
        {
            let y = row - ( scope.rows / 2 );
            let dummy = new THREE.Object3D();
                dummy.position.set( x, y, z );
                dummy.rotation.set( 0, a, 0 );
                dummy.updateMatrix();

            scope.mesh.setMatrixAt( i, dummy.matrix );

            app.utils.attributes.set( scope.mesh.geometry, "start", i, new THREE.Vector3( x, y, z ) );
            app.utils.attributes.set( scope.mesh.geometry, "rotation", i, new THREE.Vector3( 0, a, 0 ) );

            i++;
        }
    };

    scope.bend = function()
    {
        var dimensions = scope.grid.dimensions.toArray().sort( ( a, b ) => b - a );

        scope.columns = dimensions[ 0 ];
        scope.rows = dimensions[ 1 ];

        while ( ( scope.columns % scope.bender.sides ) )
        {
            scope.columns++;
        }

        var r = scope.columns / circle;
        var t = 1 / r;

        switch( scope.bender.sides )
        {
            case 0: // circle
            case 1: // plane
            case 2: // plane
                for ( let column = 0; column < scope.columns; column++ )
                {
                    let x, z, a;

                    switch( scope.bender.sides )
                    {
                        case 0:
                            x = Math.sin( t * column + Math.PI ) * r;
                            z = Math.cos( t * column + Math.PI ) * r;
                            a = Math.atan( x / z );
                        break;

                        case 1:
                        case 2:
                            x = column - ( scope.columns / 2 );
                            z = 0;
                            a = Math.atan( x / z );
                        break;
                    }

                    set( x, z, a );
                }
            break;

            default: // polygon
                // get all points in a circle
                var getPoints = function()
                {
                    var points = [];
                    var t = circle / scope.columns;

                    for ( var column = 0; column < scope.columns; column++ )
                    {
                        let x = Math.sin( t * column + Math.PI ) * r;
                        let z = Math.cos( t * column + Math.PI ) * r;
                        let a = Math.atan( x / z );

                        points.push( { x: x, z: z } );

                        set( x, z, a );
                    }

                    return points;
                };

                var points = getPoints();
                var number = points.length;

                // length of side
                var l = number / scope.bender.sides;

                // set center of side for calculating normal
                var c = Math.floor( l / 2 );
                var f = 0;

                function bend()
                {
                    i = 0;

                    for ( let n = 0; n < number; n++ )
                    {
                        if ( n % ( number / scope.bender.sides ) )
                        {
                            let h = ( n - 1 + number ) % number;
                            let j = ( n + 1 + number ) % number;

                            points[ n ].x = ( points[ h ].x + points[ n ].x + points[ j ].x ) / 3;
                            points[ n ].z = ( points[ h ].z + points[ n ].z + points[ j ].z ) / 3;
                        }

                        let s = Math.floor( n * scope.bender.sides / number );
                        let x = points[ n ].x;
                        let z = points[ n ].z;
                        let a = Math.atan( points[ s * l + c ].x / points[ s * l + c ].z );//( scope.bender.straightness * scope.bender.sides ) < 600 ? Math.atan( x / z ) : 

                        set( x, z, a );
                    }

                    f++;

                    if ( f === scope.bender.straightness )
                    {
                        app.kill( app.arrays.functions, "bend" );

                        if ( scope.bender.onBendComplete )
                            scope.bender.onBendComplete( scope );
                    }
                }

                app.arrays.functions.push( { name: "bend", scope: this, function: bend, args: null } );
            break;
        }
    };
};
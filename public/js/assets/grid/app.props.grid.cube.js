const Cube = function( args )
{
    var app = {};
    var scope = this;

    const create = function()
    {
        var array = [];
            array[ 0 ] = 0;
            array[ 1 ] = args.sides[ 0 ];
            array[ 2 ] = 0;
            array[ 3 ] = args.sides[ 3 ];
            array[ 4 ] = 1;
            array[ 5 ] = args.sides[ 1 ];
            array[ 6 ] = 0;
            array[ 7 ] = args.sides[ 2 ];
            array[ 8 ] = 0;

        var i = 0;
        var c = args.col * args.factor;
        var r = args.row * args.factor;
        var columns = scope.cols * args.factor;
        var offset = new THREE.Vector3( ( scope.dimensions.x - scope.size ) / 2, scope.dimensions.y / 2, ( scope.dimensions.z - scope.size ) / 2 );

        for ( let row = 0; row < args.factor; row++ )
        {
            for ( let col = 0; col < args.factor; col++ )
            {
                if ( !array[ i ] )
                {
                    let x = c + col;
                    let z = r + row;
                    let position = new THREE.Vector3( x, 0, z ).sub( offset );
                    let index = columns * z + x;
                    let dummy = new THREE.Object3D();
                        dummy.position.copy( position );
                        dummy.updateMatrix();

                    scope.mesh.setMatrixAt( index, dummy.matrix );

                    app.utils.attributes.set( scope.mesh.geometry, "start",    index, dummy.position );
                    app.utils.attributes.set( scope.mesh.geometry, "end",      index, dummy.position );
                    app.utils.attributes.set( scope.mesh.geometry, "rotation", index, dummy.rotation );

                    if ( scope.hasOwnProperty( "attributes" ) )
                    {
                        if ( scope.attributes.hasOwnProperty( "color" ) )
                            app.utils.attributes.set( scope.mesh.geometry, "color",      index, scope.attributes.color.value );
                        if ( scope.attributes.hasOwnProperty( "alternate" ) )
                            app.utils.attributes.set( scope.mesh.geometry, "alternate",  index, scope.attributes.alternate.value );
                        if ( scope.attributes.hasOwnProperty( "opaque" ) )
                            app.utils.attributes.set( scope.mesh.geometry, "opaque",     index, scope.attributes.opaque.value );
                        if ( scope.attributes.hasOwnProperty( "level" ) )
                            app.utils.attributes.set( scope.mesh.geometry, "level",      index, scope.attributes.level.value );
                    }
                }

                i++;
            }
        }
    };

    this.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        create.call( scope );
    }
};
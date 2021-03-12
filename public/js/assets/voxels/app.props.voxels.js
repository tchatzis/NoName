const Voxels = function()
{
    var app = {};
    var scope = this;

    function dim( axis )
    {
        var d = scope.dimensions[ axis ];

        return { min: -Math.floor( d / 2 ), max: Math.round( d / 2 ), val: d };
    }

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        scope[ scope.type ]();
    };

    scope.menger = function()
    {
        scope.onInstancedComplete = init;
        scope.count = Math.pow( scope.dimensions[ "x" ] * scope.dimensions[ "y" ] * scope.dimensions[ "z" ], scope.iterations );
        scope.instanced = new Instanced( app, scope );

        function init( instance )
        {
            var c = 0;
            var mesh = instance.mesh;

            scope.group.add( mesh );

            function voxel( x, y, z, r )
            {
                var dummy = new THREE.Object3D();
                    dummy.position.set( x, y, z );
                    dummy.scale.multiplyScalar( r - scope.spacing );
                    dummy.updateMatrix();

                mesh.setMatrixAt( c, dummy.matrix );

                app.utils.attributes.set( mesh.geometry, "color",  c, scope.color );
                app.utils.attributes.set( mesh.geometry, "start",  c, dummy.position );
                app.utils.attributes.set( mesh.geometry, "end",    c, dummy.position );
                app.utils.attributes.set( mesh.geometry, "opaque", c, scope.opaque );

                c++;
            }

            function Position( x, y, z, r, i, j, k )
            {
                this.x = x + i * r;
                this.y = y + j * r;
                this.z = z + k * r;
                this.r = r * 3;
                this.p = [ this.x, this.y, this.z, this.r ];
            }

            function fractal( x, y, z, r, level )
            {
                if ( level <= scope.iterations )
                {
                    var pos = [];
                    var nextLevel = level + 1;
                    var dimx = dim( "x" );
                    var dimy = dim( "y" );
                    var dimz = dim( "z" );

                    for ( var i = dimx.min; i < dimx.max; i++ )
                    {
                        for ( var j = dimy.min; j < dimy.max; j++ )
                        {
                            for ( var k = dimz.min; k < dimz.max; k++ )
                            {
                                var sum = Math.abs( i ) + Math.abs( j ) + Math.abs( k );

                                if ( sum > 1 )
                                {
                                    var t = pos.length;
                                    pos[ t ] = new Position( x, y, z, r, i, j, k );

                                    if ( level === scope.iterations )
                                        voxel( ...pos[ t ].p );
                                    else
                                        fractal( pos[ t ].x, pos[ t ].y, pos[ t ].z, pos[ t ].r, nextLevel );
                                }
                            }
                        }
                    }
                }
            }

            fractal( 0, 0, 0, scope.size, 1 );

            mesh.instanceMatrix.needsUpdate = true;
        }
    };

    scope.ripple = function()
    {
        scope.onInstancedComplete = init;
        scope.count = Object.values( scope.dimensions ).reduce( ( accumulator, value ) => accumulator * value );
        scope.shader = "ripple";
        scope.instanced = new Instanced( app, scope );

        function init( instance )
        {
            var c = 0;
            var dimx = dim( "x" );
            var dimy = dim( "y" );
            var dimz = dim( "z" );
            var mesh = instance.mesh;

            scope.group.add( mesh );

            function voxel( x, y, z )
            {
                var dummy = new THREE.Object3D();
                    dummy.position.set( x, y, z );
                    dummy.scale.multiplyScalar( scope.size - scope.spacing );
                    dummy.updateMatrix();

                mesh.setMatrixAt( c, dummy.matrix );

                app.utils.attributes.set( mesh.geometry, "color",  c, scope.color );
                app.utils.attributes.set( mesh.geometry, "start",  c, dummy.position );
                app.utils.attributes.set( mesh.geometry, "end",    c, dummy.position );
                app.utils.attributes.set( mesh.geometry, "opaque", c, scope.opaque );

                c++;
            }

            function Position( x, y, z, i, j, k )
            {
                this.x = x + i;
                this.y = y + j;
                this.z = z + k;
                this.p = [ this.x, this.y, this.z ];
            }

            function grid( x, y, z )
            {
                for ( var i = dimx.min; i < dimx.max; i++ )
                {
                    for ( var j = dimy.min; j < dimy.max; j++ )
                    {
                        for ( var k = dimz.min; k < dimz.max; k++ )
                        {
                            voxel( ...new Position( x, y, z, i, j, k ).p );
                        }
                    }
                }
            }

            grid( 0, 0, 0 );

            mesh.instanceMatrix.needsUpdate = true;
        }
    };

    scope.trajectory = function()
    {
        var args =
        {
            parent: scope.group,
            category: "trajectory",
            params: scope.params,
            object: new Path.Object( { type: "box", size: scope.size, visible: false, color: new THREE.Color( 0x0000ff ), opaque: scope.opaque } ),
            line:   new Path.Line  ( {                                visible: false, color: new THREE.Color( 0x0000ff ), opaque: 0.5 } ),
            animation: { animate: false, loop: true, direction: "forward", onPathAnimationComplete: null }
        };

        var object = new app.path.Instance( new THREE.Object3D(), args );

        scope.onInstancedComplete = init;
        scope.count = object.path.vertices.length;
        scope.instanced = new Instanced( app, scope );

        function init( instance )
        {
            var c = 0;
            var mesh = instance.mesh;

            scope.group.add( mesh );

            function voxel( x, y, z )
            {
                var dummy = new THREE.Object3D();
                    dummy.position.set( x, y, z );
                    dummy.scale.multiplyScalar( scope.size - scope.spacing );
                    dummy.scale.multiply( scope.dimensions );
                    dummy.updateMatrix();

                mesh.setMatrixAt( c, dummy.matrix );

                app.utils.attributes.set( mesh.geometry, "color",  c, scope.color );
                app.utils.attributes.set( mesh.geometry, "start",  c, dummy.position );
                app.utils.attributes.set( mesh.geometry, "end",    c, dummy.position );
                app.utils.attributes.set( mesh.geometry, "opaque", c, scope.opaque );

                c++;
            }

            for ( let vertex of object.path.vertices )
            {
                voxel( ...vertex.toArray() );
            }

            mesh.instanceMatrix.needsUpdate = true;
        }
    };
};
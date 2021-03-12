const Pyramid = function()
{
    var app = {};
    var scope = this;

    var count = function()
    {
        scope.count = 0;
        scope.iteration = 0;

        var levels = 1;

        while ( levels <= scope.levels )
        {
            scope.count += Math.pow( levels * 2 - 1, 2 );
            levels++;
        }
    };

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        var size = [ scope.size.x - scope.spacing, scope.size.z - scope.spacing, scope.size.y - scope.spacing ];

        scope.group = new THREE.Group();
        scope.group.name = args.name;
        scope.parent.add( scope.group );

        count();
        scope.geometry = new THREE.CylinderBufferGeometry( ...size, scope.sides, 1, false );
        scope.onInstancedComplete = ( instance ) =>
        {
            scope.mesh = instance.mesh;
            scope.plot( instance.mesh );
            scope.group.add( instance.mesh );

            app.arrays.animations.push( { name: scope.name, object: instance.mesh, path: "rotation.y", value: 0.01 } );
        };
        scope.instanced = new Instanced( app, scope );
    };

    scope.plot = function()
    {
        var base = scope.levels;
        var position = new THREE.Vector3( 0, scope.levels - scope.size.y / 2, 0 );

        for( let y = 0; y < base; y++ )
        {
            for ( let x = -y; x <= y; x++ )
            {
                for ( let z = -y; z <= y; z++ )
                {
                    let clone = new THREE.Object3D();
                        clone.position.set( x, -y, z ).add( position ).multiply( scope.size );
                        clone.updateMatrix();

                    app.utils.attributes.set( scope.geometry, "start", scope.iteration, clone.position );
                    app.utils.attributes.set( scope.geometry, "color", scope.iteration, scope.attributes.color.value );
                    app.utils.attributes.set( scope.geometry, "alternate", scope.iteration, scope.attributes.alternate.value );
                    app.utils.attributes.set( scope.geometry, "opaque", scope.iteration, scope.attributes.opaque.value );

                    scope.mesh.setMatrixAt( scope.iteration, clone.matrix );
                    scope.iteration++;

                    app.ui.debug.innerText = scope.iteration;
                }
            }
        }

        scope.mesh.instanceMatrix.needsUpdate = true;
    };
};
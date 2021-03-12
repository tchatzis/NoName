const Hollow = function()
{
    var app = {};
    var scope = this;

    var projectile = function()
    {
        switch ( scope.type )
        {
            case "box":
                scope.object = new app.presets.Cube(
                {
                    name: name,
                    parent: scope.parent,
                    position: new THREE.Vector3(),
                    size: 3,
                    segments: 1
                } );
                scope.bounding = new THREE.Box3();
                scope.object.mesh.geometry.computeBoundingBox();
            break;

            case "sphere":
                scope.object = new app.presets.Sphere(
                {
                    name: "sphere",
                    parent: scope.parent,
                    position: new THREE.Vector3(),
                    radius: 4,
                    widthSegments: 16,
                    heightSegments: 16,
                    phiStart: 0,
                    phiLength: Math.PI * 2,
                    thetaStart: 0,
                    thetaLength: Math.PI
                } );
                scope.object.mesh.geometry.computeBoundingSphere();
            break;
        }
    };

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        scope.armed = true;

        scope.group = new THREE.Group();
        scope.group.name = "hollow";
        args.parent.add( scope.group );

        projectile();
    };

    scope.set = function()
    {
        if ( scope.armed )
        {
            if ( scope.hasOwnProperty( "trajectory" ) )
            {
                scope.trajectory.onTrajectoryComplete = function()
                {
                    scope.armed = false;
                    // reset position of mesh
                    scope.object.mesh.visible = false;
                    scope.object.mesh.position.copy( new THREE.Vector3() );
                    scope.object.mesh.updateMatrix();

                    // link group to camera
                    scope.object.link( scope.object.group, app.stage.camera, [ "position", "rotation" ] );
                    app.kill( app.arrays.functions, scope.name );
                    app.ui.container.classList.add( "expand" );
                    app.ui.debug.innerText = "armed";
                    scope.armed = true;
                };
                scope.object.enhance( app.trajectory.Plot, scope.trajectory );
                scope.object.link( scope.object.group, app.stage.camera, [ "position", "rotation" ] );
            }

            app.arrays.functions.push( { name: scope.name, scope: scope, function: scope[ scope.type ], args: null } );

            scope.armed = false;
        }
    };

    scope.sphere = function()
    {
        // blob
        var count = scope.blob.count * 3;
        var mesh = scope.blob.instanced.mesh;
        var geometry = mesh.geometry;
        var positions = geometry.attributes.start.array;
        // preset
        var radius = scope.object.mesh.geometry.boundingSphere.radius;
        var center = new THREE.Vector3();

        scope.object.mesh.getWorldPosition( center );
        scope.object.mesh.geometry.boundingSphere.center.copy( center );
        scope.object.mesh.visible = !scope.armed;
        scope.object.mesh.frustumCulled = false;

        for ( var c = 0; c < count; c += 3 )
        {
            let id = c / 3;
            let position = new THREE.Vector3( positions[ c ], positions[ c + 1 ], positions[ c + 2 ] );
            let distance = center.distanceTo( position );

            if ( distance < radius )
            {
                app.utils.attributes.set( geometry, "opaque", id, 0 );
                app.utils.attributes.set( geometry, "color",  id, new THREE.Color( 0x000000 ) );
            }
        }
    };

    scope.box = function()
    {
        var count = scope.blob.count * 3;
        var mesh = scope.blob.instanced.mesh;
        var geometry = mesh.geometry;
        var positions = geometry.attributes.start.array;

        scope.object.mesh.visible = !scope.armed;

        for ( var c = 0; c < count; c += 3 )
        {
            let id = c / 3;
            let position = new THREE.Vector3( positions[ c ], positions[ c + 1 ], positions[ c + 2 ] );
            let inside = check( position );

            if ( inside )
            {
                app.utils.attributes.set( geometry, "opaque", id, 0 );
                app.utils.attributes.set( geometry, "color",  id, new THREE.Color( 0x000000 ) );
            }
        }
    };

    scope.fire = function()
    {
        scope.set();
    };

    const check = function( position )
    {
        scope.bounding.copy( scope.object.mesh.geometry.boundingBox ).applyMatrix4( scope.object.mesh.matrixWorld );

        return scope.bounding.containsPoint( position );
    };
};
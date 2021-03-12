const Sky = function()
{
    var app = {};
    var scope = this;

    Object.defineProperty( scope, 'update',
    {
        enumerable: false,
        value: function()
        {
            if ( app.controls.active[ scope.name ] )
            {
                scope.inclination += scope.speed;

                var theta = Math.PI * scope.inclination;
                var phi = 2 * Math.PI * scope.azimuth;
                var distance = app.stage.world;
                var darkness = Math.sin( phi );

                scope.sun.position.x = distance * Math.cos( phi );
                scope.sun.position.y = distance * Math.sin( phi ) * Math.sin( theta );
                scope.sun.position.z = distance * Math.sin( phi ) * Math.cos( theta );

                app.stage.lights.directional.position.copy( scope.sun.position );
                app.stage.lights.directional.intensity = darkness;
                app.stage.lights.directional.color = scope.sun.position.y > 0 ? new THREE.Color( 0xFFFFFF ) : new THREE.Color( 0.01, 0.01, 0.02 );
                app.stage.scene.fog.visible = scope.sun.position.y > 0;

                scope.sky.material.uniforms.sunPosition.value = scope.sun.position;
            }
        }
    } );

    scope.init = function( args )
    {
        Object.assign( app, this );
        Object.assign( scope, args );

        var theta = Math.PI * args.inclination;
        var phi = 2 * Math.PI * args.azimuth;
        var distance = app.stage.world;

        var sun = new THREE.Mesh( new THREE.SphereBufferGeometry( 50, 4, 8 ), new THREE.MeshBasicMaterial( { color: 0xff0000 } ) );
            sun.name = args.name + "_sun";
            sun.visible = args.sun;
            sun.position.x = distance * Math.cos( phi );
            sun.position.y = distance * Math.sin( phi ) * Math.sin( theta );
            sun.position.z = distance * Math.sin( phi ) * Math.cos( theta );

        var uniforms =
        {
            turbidity:       { value: args.uniforms.turbidity },
            rayleigh:        { value: args.uniforms.rayleigh },
            luminance:       { value: args.uniforms.luminance },
            mieCoefficient:  { value: args.uniforms.mieCoefficient },
            mieDirectionalG: { value: args.uniforms.mieDirectionalG },
            sunPosition:     { value: sun.position }
        };

        var sky = new THREE.Sky();
            sky.name = args.name + "_sky";
            sky.scale.setScalar( app.stage.world );
            sky.material.uniforms = uniforms;

        var group = new THREE.Object3D();
            group.name = args.name;
            group.add( sun );
            group.add( sky );

        scope.sun = sun;
        scope.sky = sky;
        scope.group = group;

        scope.parent.add( group );
        app.controls.active[ scope.name ] = true;
        app.arrays.persistent.functions.push( { name: scope.name, scope: scope, function: scope.update, args: null } );
    };
};